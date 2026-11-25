from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from DTO.doctor_dto import DoctorCreateDTO,UpdateDoctorRequestDTO
from service.doctor_service import create_doctor, delete_doctor, get_all_doctors, update_doctor, get_top_doctors
from flask_jwt_extended import jwt_required
from utils.auth_utils import role_required
from extensions import cache

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


@doctor_bp.route("/doctors/<int:doctor_id>", methods=["PUT"])
@jwt_required()
@role_required("admin")
def update_doctor_route(doctor_id):

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Invalid JSON request"
        }), 400

    # Validate request
    try:
        doctor_data = UpdateDoctorRequestDTO.model_validate(data)

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
        doctor = update_doctor(doctor_id, doctor_data)

    except LookupError as e:
        return jsonify({
            "error": str(e)
        }), 404

    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 409

    return jsonify({
        "message": "Doctor updated successfully",
        "doctor": {
            "id": doctor.id,
            "user_id": doctor.user_id,
            "name": doctor.user.name,
            "email": doctor.user.email,
            "specialization": doctor.specialization,
            "consultation_fee": float(doctor.consultation_fee)
        }
    }), 200


@doctor_bp.route("/doctors/<int:doctor_id>", methods=["DELETE"])
@jwt_required()
@role_required("admin")
def delete_doctor_route(doctor_id):

    try:
        deleted_doctor = delete_doctor(doctor_id)

    except LookupError as e:
        return jsonify({
            "error": str(e)
        }), 404

    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 409

    return jsonify({
        "message": "Doctor deleted successfully",
        "doctor": deleted_doctor
    }), 200




@doctor_bp.route("/doctors/top", methods=["GET"])
@cache.cached(timeout=300, key_prefix="top_doctors")
def get_top_doctors_route():

    results = get_top_doctors()

    doctor_list = []

    for rank, result in enumerate(results, start=1):

        doctor = result[0]
        doctor_name = result[1]
        completed_count = result[2]

        doctor_list.append({
            "rank": rank,
            "doctor_id": doctor.id,
            "name": doctor_name,
            "specialization": doctor.specialization,
            "consultation_fee": float(
                doctor.consultation_fee
            ),
            "completed_appointments": completed_count
        })

    return jsonify({
        "doctors": doctor_list
    }), 200
