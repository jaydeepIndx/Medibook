from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy.exc import IntegrityError

from extensions import db
from models.user import User


def register_user(register_data):
    
    email = str(register_data.email).lower()

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        raise ValueError("Email already registered")

    
    hashed_password = generate_password_hash(register_data.password)

    new_user = User(
        name=register_data.name,
        email=email,
        password_hash=hashed_password,
        role="patient"
    )

    db.session.add(new_user)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise ValueError("Email already registered")

    return new_user



def login_user(login_data):

    email = str(login_data.email).lower()

    user = User.query.filter_by(email=email).first()

    if not user:
        raise ValueError("Invalid email")


    is_password_valid = check_password_hash(
        user.password_hash,
        login_data.password
    )

    if not is_password_valid:
        raise ValueError("Invalid password")

    return user