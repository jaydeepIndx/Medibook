from sqlalchemy import func
from werkzeug.security import generate_password_hash
from sqlalchemy.exc import IntegrityError

from extensions import db
from models.appointment import Appointment
from models.user import User
from models.doctor import Doctor
from utils.database_performance import measure_db_time


def create_doctor(doctor_data):

    email = str(doctor_data.email).lower()

    # Check whether email already exists
    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        raise ValueError("Email already registered")

    # Create user
    new_user = User(
        name=doctor_data.name,
        email=email,
        password_hash=generate_password_hash(doctor_data.password),
        role="doctor"
    )

    try:
        db.session.add(new_user)

        # Save user first to generate its ID
        db.session.flush()

        # Create doctor profile
        new_doctor = Doctor(
            user_id=new_user.id,
            specialization=doctor_data.specialization,
            consultation_fee=doctor_data.consultation_fee
        )

        db.session.add(new_doctor)

        db.session.commit()

    except IntegrityError:
        db.session.rollback()
        raise ValueError("Email already registered")

    return new_doctor


@measure_db_time
def get_all_doctors(specialization=None):

    query = Doctor.query.join(User)

    if specialization:
        query = query.filter(
            Doctor.specialization.ilike(f"%{specialization}%")
        )

    doctors = query.all()

    return doctors



def update_doctor(doctor_id, doctor_data):

    # Find doctor
    doctor = Doctor.query.get(doctor_id)

    if not doctor:
        raise LookupError("Doctor not found")

    email = str(doctor_data.email).lower()

    # Check whether email belongs to another user
    existing_user = User.query.filter(
        User.email == email,
        User.id != doctor.user_id
    ).first()

    if existing_user:
        raise ValueError("Email already registered")

    # Update user details
    doctor.user.name = doctor_data.name
    doctor.user.email = email

    # Update doctor details
    doctor.specialization = doctor_data.specialization
    doctor.consultation_fee = doctor_data.consultation_fee

    try:
        db.session.commit()

    except IntegrityError:
        db.session.rollback()
        raise ValueError("Email already registered")

    return doctor




def delete_doctor(doctor_id):

    # Find doctor
    doctor = db.session.get(Doctor, doctor_id)

    if not doctor:
        raise LookupError("Doctor not found")

    # Check whether doctor has appointments
    existing_appointment = Appointment.query.filter_by(
        doctor_id=doctor.id
    ).first()

    if existing_appointment:
        raise ValueError(
            "Cannot delete doctor because appointments are associated with this doctor"
        )

    # Store details before deleting records
    deleted_doctor = {
        "id": doctor.id,
        "user_id": doctor.user_id,
        "name": doctor.user.name,
        "email": doctor.user.email,
        "specialization": doctor.specialization,
        "consultation_fee": float(doctor.consultation_fee)
    }

    # Get associated user
    user = doctor.user

    try:
        # Delete doctor profile first
        db.session.delete(doctor)

        # Execute doctor deletion before deleting user
        db.session.flush()

        # Delete associated user account
        db.session.delete(user)

        db.session.commit()

    except IntegrityError:
        db.session.rollback()

        raise ValueError(
            "Cannot delete doctor because related records exist"
        )

    return deleted_doctor



def get_top_doctors():

    results = db.session.query(
        Doctor,
        User.name,
        func.count(Appointment.id).label(
            "completed_appointments"
        )
    ).join(
        User,
        Doctor.user_id == User.id
    ).outerjoin(
        Appointment,
        (
            (Appointment.doctor_id == Doctor.id)
            &
            (Appointment.status == "completed")
        )
    ).group_by(
        Doctor.id,
        User.id,
        User.name
    ).order_by(
        func.count(Appointment.id).desc(),
        Doctor.id.asc()
    ).limit(5).all()

    return results

