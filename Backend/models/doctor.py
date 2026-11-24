from extensions import db


class Doctor(db.Model):

    __tablename__ = "doctors"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    specialization = db.Column(
        db.String(100),
        nullable=False
    )

    consultation_fee = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    user = db.relationship(
        "User",
        back_populates="doctor"
    )

    appointments = db.relationship(
    "Appointment",
    back_populates="doctor"
    )