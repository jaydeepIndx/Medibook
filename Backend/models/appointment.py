from extensions import db
from sqlalchemy import Index, text


class Appointment(db.Model):

    __tablename__ = "appointments"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    doctor_id = db.Column(
        db.Integer,
        db.ForeignKey("doctors.id"),
        nullable=False
    )

    start_time = db.Column(
        db.DateTime(timezone=True),
        nullable=False
    )

    end_time = db.Column(
        db.DateTime(timezone=True),
        nullable=False
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="booked"
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        server_default=db.func.now()
    )

    # Relationships

    patient = db.relationship(
        "User",
        back_populates="appointments",
        foreign_keys=[patient_id]
    )

    doctor = db.relationship(
        "Doctor",
        back_populates="appointments"
    )

    prescription = db.relationship(
          "Prescription",
          back_populates="appointment",
          uselist=False
    )

    # Database constraints

    __table_args__ = (

        db.CheckConstraint(
            "end_time > start_time",
            name="check_appointment_time"
        ),

        db.CheckConstraint(
            "end_time = start_time + INTERVAL '30 minutes'",
            name="check_appointment_duration"
        ),

        db.CheckConstraint(
            "status IN ('booked', 'cancelled', 'completed')",
            name="check_appointment_status"
        ),

        Index(
            "unique_doctor_active_slot",
            "doctor_id",
            "start_time",
            unique=True,
            postgresql_where=text(
                "status IN ('booked', 'completed')"
            )
        )
    )