from datetime import timedelta
from flask_jwt_extended import create_access_token


def generate_token(user):

    access_token = create_access_token(
        identity=str(user.id),

        additional_claims={
            "role": user.role
        },

        expires_delta=timedelta(minutes=30)
    )

    return access_token