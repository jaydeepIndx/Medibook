from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from DTO.doctor_dto import DoctorCreateDTO
from service.doctor_service import create_doctor, get_all_doctors
from flask_jwt_extended import jwt_required
from utils.auth_utils import role_required

doctor_bp = Blueprint("doctor", __name__)


@doctor_bp.route("/doctors", methods=["POST"])
@jwt_required()
@role_required("admin")
def create_doctor_route():


    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Invalid JSON request"
        }), 400

    # Validate request
    try:
        doctor_data = DoctorCreateDTO.model_validate(data)

    except ValidationError as e:
        return jsonify({
            "error": "Validation failed",
            "details": e.errors(
                include_context=False,
                include_url=False
            )
        }), 400

    # Call service
    try:
        doctor = create_doctor(doctor_data)

    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 409

    return jsonify({
        "message": "Doctor created successfully",
        "doctor": {
            "id": doctor.id,
            "user_id": doctor.user_id,
            "name": doctor.user.name,
            "email": doctor.user.email,
            "specialization": doctor.specialization,
            "consultation_fee": float(doctor.consultation_fee)
        }
    }), 201


@doctor_bp.route("/doctors", methods=["GET"])
def get_doctors():

    specialization = request.args.get("specialization")

    doctors = get_all_doctors(specialization)

    doctor_list = []

    for doctor in doctors:
        doctor_list.append({
            "id": doctor.id,
            "name": doctor.user.name,
            "email": doctor.user.email,
            "specialization": doctor.specialization,
            "consultation_fee": float(doctor.consultation_fee)
        })

    return jsonify({
        "doctors": doctor_list
    }), 200