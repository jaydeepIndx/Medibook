from flask import Blueprint, request, jsonify
from pydantic import ValidationError

from DTO.RegisterRequestDTO import RegisterRequestDTO
from DTO.loginRequestDTO import LoginRequestDTO
from service.auth_service import login_user, register_user
from utils.jwt_utils import generate_token


auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    # Validate request using Pydantic
    try:
        register_data = RegisterRequestDTO.model_validate(data)

    except ValidationError as e:
        return jsonify({
            "error": "Validation failed",
            "details": e.errors(
                include_context=False,
                include_url=False
            )
        }), 400

    # Call service layer
    try:
        user = register_user(register_data)

    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 409

    # Return successful response
    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Invalid JSON request"
        }), 400

    # Validate request
    try:
        login_data = LoginRequestDTO.model_validate(data)

    except ValidationError as e:
        return jsonify({
            "error": "Validation failed",
            "details": e.errors(
                include_context=False,
                include_url=False
            )
        }), 400

    # Authenticate user
    try:
        user = login_user(login_data)

    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 401

    # Generate JWT token
    jwt_token = generate_token(user)
    
    return jsonify({
        "message": "Login successful",
        "jwt_token": jwt_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200