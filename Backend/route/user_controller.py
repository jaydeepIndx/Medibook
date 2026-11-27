from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
import pydantic

from DTO.user_update_dto import UserUpdateDTO
from service.user_service import user_data_update


user_bp = Blueprint("user_bp", __name__)

@user_bp.route("/user/me", methods=["PATCH"])
@jwt_required()
def update_user_route():

    data = request.get_json(silent=True)

    role = str(get_jwt().get("role"))

    if role == "admin":
        return jsonify({
            "error": "Admin users are not allowed to update user data"
        }), 403

    if not isinstance(data, dict):
        return jsonify({
            "error": "Invalid JSON request"
        }), 400

    # Validate request using Pydantic
    try:   
         user_data = UserUpdateDTO.model_validate(data)

    except pydantic.ValidationError as e:
        return jsonify({
            "error": "Validation failed",
            "details": e.errors(
                include_context=False,
                include_url=False
            )
        }), 400      

    user_id = int(get_jwt_identity())
    # Call service layer
    try:
        updated_user = user_data_update(user_id, user_data)

    except LookupError as e:
        return jsonify({
            "error": str(e)
        }), 404


    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 409 

    # Return successful response
    return jsonify({
        "message": "User updated successfully",
        "user": {
            "name": updated_user.name,
            "email": updated_user.email,
            "role": updated_user.role
        }
    }), 200    
