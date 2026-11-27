
from models.user import User
from extensions import db
from werkzeug.security import generate_password_hash


def user_data_update(user_id, user):

    user_check = User.query.get(user_id)

    if not user_check:
        raise LookupError("User not found")


    existing_user = User.query.filter_by(email=user.email).first()
    if existing_user and existing_user.id != user_id:
        raise ValueError("Email already registered")

    if user.password: 
         password_hash = generate_password_hash(user.password)

    user_check.name = user.name
    user_check.email = user.email


    if user.password:
       user_check.password_hash = password_hash 

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise ValueError("Failed to update user data") from e

    return user_check
         