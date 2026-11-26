
import csv
from io import StringIO

from sqlalchemy.orm import aliased

from extensions import db
from models.user import User
from models.doctor import Doctor
from models.appointment import Appointment



def export_appointments_csv():
    buffer = StringIO(newline="")
    writer = csv.writer(buffer)

    # Write CSV column headings.
    writer.writerow([
        "Appointment ID",
        "Patient Name",
        "Patient Email",
        "Doctor Name",
        "Specialization",
        "Consultation Fee",
        "Start Time",
        "End Time",
        "Status",
        "Created At"
    ])

    # Get the CSV header from the buffer.
    yield buffer.getvalue()

    # Clear the buffer before writing appointment data.
    buffer.seek(0)
    buffer.truncate(0)

    # User table is joined twice:
    # once for the patient and once for the doctor.
    doctor_user = aliased(User)

    appointments = db.session.query(
        Appointment.id,
        User.name.label("patient_name"),
        User.email.label("patient_email"),
        doctor_user.name.label("doctor_name"),
        Doctor.specialization,
        Doctor.consultation_fee,
        Appointment.start_time,
        Appointment.end_time,
        Appointment.status,
        Appointment.created_at
    ).join(
        User,
        Appointment.patient_id == User.id
    ).join(
        Doctor,
        Appointment.doctor_id == Doctor.id
    ).join(
        doctor_user,
        Doctor.user_id == doctor_user.id
    ).order_by(
        Appointment.start_time
    ).yield_per(100)

    for appointment in appointments:
        writer.writerow([
            appointment.id,
            appointment.patient_name,
            appointment.patient_email,
            appointment.doctor_name,
            appointment.specialization,
            appointment.consultation_fee,
            appointment.start_time,
            appointment.end_time,
            appointment.status,
            appointment.created_at
        ])

        # Return the current CSV row(s).
        yield buffer.getvalue()

        # Reuse the same buffer for the next row.
        buffer.seek(0)
        buffer.truncate(0)
