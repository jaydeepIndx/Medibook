from extensions import db


class Prescription(db.Model):

    __tablename__ = "prescriptions"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    appointment_id = db.Column(
        db.Integer,
        db.ForeignKey("appointments.id"),
        unique=True,
        nullable=False
    )

    notes = db.Column(
        db.Text,
        nullable=False
    )

    medicines = db.Column(
        db.Text,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        server_default=db.func.now()
    )

    appointment = db.relationship(
        "Appointment",
        back_populates="prescription"
    )