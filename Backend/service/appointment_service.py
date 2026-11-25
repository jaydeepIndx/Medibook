
from datetime import datetime, timedelta, timezone

from sqlalchemy.exc import IntegrityError

from CustomException.appointment_exceptions import (AppointmentNotCancellable, AppointmentNotFound, 
                                                    AppointmentNotOwned, CancelTooLate, PrescriptionNotFound, SlotAlreadyBooked
                                                    ,DoctorNotAssigned, AppointmentNotActive, PrescriptionAlreadyExists
                                                    )
from extensions import db
from models.appointment import Appointment
from models.prescription import Prescription
from models.doctor import Doctor


def book_appointment(patient_id, appointment_data):

    doctor = Doctor.query.get(appointment_data.doctor_id)

    if not doctor:
        raise ValueError("Doctor not found")

    start_time = appointment_data.start_time

    # Convert appointment time to UTC
    start_time = start_time.astimezone(timezone.utc)

    # Appointment must be in the future
    current_time = datetime.now(timezone.utc)

    if start_time <= current_time:
        raise ValueError("Appointment must be in the future")

    # Appointment must start at 00 or 30 minutes
    if (
        start_time.minute not in [0, 30]
        or start_time.second != 0
        or start_time.microsecond != 0
    ):
        raise ValueError(
            "Appointment must start at 00 or 30 minutes"
        )

    # Calculate appointment end time
    end_time = start_time + timedelta(minutes=30)

    # Check patient's upcoming appointments
    upcoming_count = Appointment.query.filter(
        Appointment.patient_id == patient_id,
        Appointment.status == "booked",
        Appointment.start_time > current_time
    ).count()

    if upcoming_count >= 3:
        raise ValueError(
            "Patient cannot have more than 3 upcoming appointments"
        )

    # Check whether doctor already has this slot
    existing_appointment = Appointment.query.filter(
        Appointment.doctor_id == doctor.id,
        Appointment.start_time == start_time,
        Appointment.status == "booked"
    ).first()

    if existing_appointment:
        raise SlotAlreadyBooked("Appointment slot already booked")

    # Create appointment
    new_appointment = Appointment(
        patient_id=patient_id,
        doctor_id=doctor.id,
        start_time=start_time,
        end_time=end_time,
        status="booked"
    )

    db.session.add(new_appointment)

    try:
        db.session.commit()

    except IntegrityError:
        db.session.rollback()
        raise ValueError("Appointment slot already booked")

    return new_appointment




def cancel_appointment(patient_id, appointment_id):

    appointment = Appointment.query.get(appointment_id)

    # Check appointment exists
    if not appointment:
        raise AppointmentNotFound("Appointment not found")

    # Check appointment belongs to logged-in patient
    if appointment.patient_id != patient_id:
        raise AppointmentNotOwned(
            "You cannot cancel another patient's appointment"
        )

    # Check appointment status
    if appointment.status != "booked":
        raise AppointmentNotCancellable(
            "Only booked appointments can be cancelled"
        )

    # Get current UTC time
    current_time = datetime.now(timezone.utc)

    # Calculate cancellation deadline
    cancellation_deadline = (
        appointment.start_time - timedelta(hours=2)
    )

    # Check 2-hour cancellation rule
    if current_time > cancellation_deadline:
        raise CancelTooLate(
            "Appointment cannot be cancelled within 2 hours of start time"
        )

    # Update appointment status
    appointment.status = "cancelled"

    db.session.commit()

    return appointment



from models.user import User
from models.doctor import Doctor
from models.appointment import Appointment


def get_my_appointments(user_id, user_role):

    if user_role == "patient":

        appointments = Appointment.query.filter_by(
            patient_id=user_id
        ).order_by(
            Appointment.start_time.desc()
        ).all()

    elif user_role == "doctor":

        doctor = Doctor.query.filter_by(
            user_id=user_id
        ).first()

        if not doctor:
            return []

        appointments = Appointment.query.filter_by(
            doctor_id=doctor.id
        ).order_by(
            Appointment.start_time.desc()
        ).all()

    else:
        return []

    return appointments




def add_prescription(
    doctor_user_id,
    appointment_id,
    prescription_data
):

    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        raise AppointmentNotFound("Appointment not found")

    # Find the logged-in doctor's profile
    doctor = Doctor.query.filter_by(
        user_id=doctor_user_id
    ).first()

    if not doctor or appointment.doctor_id != doctor.id:
        raise DoctorNotAssigned("You are not assigned to this appointment")
          

    # Only booked appointments can be completed
    if appointment.status != "booked":
        raise AppointmentNotActive(
            "Only booked appointments can be completed"
        )

    # Check whether prescription already exists
    existing_prescription = Prescription.query.filter_by(
        appointment_id=appointment.id
    ).first()

    if existing_prescription:
        raise PrescriptionAlreadyExists(
            "Prescription already exists for this appointment"
        )

    new_prescription = Prescription(
        appointment_id=appointment.id,
        notes=prescription_data.notes,
        medicines=prescription_data.medicines
    )

    # Mark appointment completed
    appointment.status = "completed"

    db.session.add(new_prescription)

    try:
        db.session.commit()

    except IntegrityError:
        db.session.rollback()
        raise PrescriptionAlreadyExists(
            "Prescription already exists for this appointment"
        )

    return new_prescription





def get_prescription(user_id, user_role, appointment_id):

    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        raise AppointmentNotFound("Appointment not found")

    # Patient can view their own prescription
    if user_role == "patient":

        if appointment.patient_id != user_id:
            raise AppointmentNotOwned(
                "You cannot view another patient's prescription"
            )

    # Doctor can view prescriptions for their appointments
    elif user_role == "doctor":

        doctor = Doctor.query.filter_by(
            # left is doctor.user_id, right is the logged-in user_id
            user_id=user_id
        ).first()

        if not doctor or appointment.doctor_id != doctor.id:
            raise AppointmentNotOwned(
                "You are not assigned to this appointment"
            )

    else:
        raise AppointmentNotOwned(
            "You are not allowed to view this prescription"
        )

    prescription = Prescription.query.filter_by(
        appointment_id=appointment.id
    ).first()

    if not prescription:
        raise PrescriptionNotFound(
            "Prescription not found for this appointment"
        )

    return prescription


