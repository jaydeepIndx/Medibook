from extensions import db


class User(db.Model):

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)

    email = db.Column(db.String(150), unique=True, nullable=False)

    password_hash = db.Column(db.Text, nullable=False)

    role = db.Column(
        db.String(20),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        server_default=db.func.now()
    )

    __table_args__ = (
        db.CheckConstraint(
            "role IN ('patient', 'doctor', 'admin')",
            name="check_user_role"
        ),
    )

    doctor = db.relationship(
        "Doctor",
        back_populates="user",
        uselist=False
    )

    appointments = db.relationship(
    "Appointment",
    back_populates="patient",
    foreign_keys="Appointment.patient_id"
    )