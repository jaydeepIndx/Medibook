from werkzeug.security import generate_password_hash
from sqlalchemy.exc import IntegrityError

from extensions import db
from models.user import User
from models.doctor import Doctor


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



def get_all_doctors(specialization=None):

    query = Doctor.query.join(User)

    if specialization:
        query = query.filter(
            Doctor.specialization.ilike(f"%{specialization}%")
        )

    doctors = query.all()

    return doctors