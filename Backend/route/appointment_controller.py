
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt, jwt_required, get_jwt_identity
from pydantic import ValidationError

from CustomException.appointment_exceptions import( AppointmentNotActive, DoctorNotAssigned, PrescriptionAlreadyExists, PrescriptionNotFound, SlotAlreadyBooked, AppointmentNotFound, 
                          AppointmentNotOwned, AppointmentNotCancellable, CancelTooLate)
from DTO.appointment_dto import AppointmentCreateDTO
from DTO.prescription_dto import PrescriptionCreateDTO
from service.appointment_service import add_prescription, book_appointment, cancel_appointment, get_my_appointments, get_prescription
from utils.auth_utils import role_required


appointment_bp = Blueprint("appointment", __name__)


@appointment_bp.route("/appointments", methods=["POST"])
@jwt_required()
@role_required("patient")
def book_appointment_route():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Invalid JSON request"
        }), 400

    try:
        appointment_data = AppointmentCreateDTO.model_validate(data)

    except ValidationError as e:
        return jsonify({
            "error": "Validation failed",
            "details": e.errors(
                include_context=False,
                include_url=False
            )
        }), 400

    patient_id = int(get_jwt_identity())

    try:
        appointment = book_appointment(
            patient_id,
            appointment_data
        )
    except SlotAlreadyBooked as e:
        return jsonify({
        "error": str(e)
    }), 409
    
    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 400

    return jsonify({
        "message": "Appointment booked successfully",
        "appointment": {
            "id": appointment.id,
            "doctor_id": appointment.doctor_id,
            "patient_id": appointment.patient_id,
            "start_time": appointment.start_time.isoformat(),
            "end_time": appointment.end_time.isoformat(),
            "status": appointment.status
        }
    }), 201




@appointment_bp.route(
    "/appointments/<int:appointment_id>/cancel",
    methods=["POST"]
)
@jwt_required()
@role_required("patient")
def cancel_appointment_route(appointment_id):

    patient_id = int(get_jwt_identity())

    try:
        appointment = cancel_appointment(
            patient_id,
            appointment_id
        )

    except AppointmentNotFound as e:
        return jsonify({"error": str(e)}), 404

    except AppointmentNotOwned as e:
        return jsonify({"error": str(e)}), 403

    except AppointmentNotCancellable as e:
        return jsonify({"error": str(e)}), 409

    except CancelTooLate as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "message": "Appointment cancelled successfully",
        "appointment": {
            "id": appointment.id,
            "doctor_id": appointment.doctor_id,
            "patient_id": appointment.patient_id,
            "start_time": appointment.start_time.isoformat(),
            "end_time": appointment.end_time.isoformat(),
            "status": appointment.status
        }
    }), 200



@appointment_bp.route("/appointments/me", methods=["GET"])
@jwt_required()
def get_my_appointments_route():

    user_id = int(get_jwt_identity())
    user_role = get_jwt().get("role")

    if user_role not in ["patient", "doctor"]:
        return jsonify({
            "error": "Only patients and doctors can view appointments"
        }), 403

    appointments = get_my_appointments(
        user_id,
        user_role
    )

    appointment_list = []

    for appointment in appointments:

        appointment_list.append({
            "id": appointment.id,
            "patient_id": appointment.patient_id,
            "patient_name": appointment.patient.name,
            "doctor_id": appointment.doctor_id,
            "doctor_name": appointment.doctor.user.name,
            "specialization": appointment.doctor.specialization,
            "consultation_fee": float(
                appointment.doctor.consultation_fee
            ),
            "start_time": appointment.start_time.isoformat(),
            "end_time": appointment.end_time.isoformat(),
            "status": appointment.status
        })

    return jsonify({
        "appointments": appointment_list
    }), 200




@appointment_bp.route(
    "/appointments/<int:appointment_id>/prescription",
    methods=["POST"]
)
@jwt_required()
@role_required("doctor")
def add_prescription_route(appointment_id):

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Invalid JSON request"
        }), 400

    try:
        prescription_data = PrescriptionCreateDTO.model_validate(data)

    except ValidationError as e:
        return jsonify({
            "error": "Validation failed",
            "details": e.errors(
                include_context=False,
                include_url=False
            )
        }), 400

    doctor_user_id = int(get_jwt_identity())

    try:
        prescription = add_prescription(
            doctor_user_id,
            appointment_id,
            prescription_data
        )

    except AppointmentNotFound as e:
        return jsonify({"error": str(e)}), 404

    except DoctorNotAssigned as e:
        return jsonify({"error": str(e)}), 403

    except AppointmentNotActive as e:
        return jsonify({"error": str(e)}), 409

    except PrescriptionAlreadyExists as e:
        return jsonify({"error": str(e)}), 409

    return jsonify({
        "message": "Prescription added successfully",
        "prescription": {
            "id": prescription.id,
            "appointment_id": prescription.appointment_id,
            "notes": prescription.notes,
            "medicines": prescription.medicines,
            "created_at": prescription.created_at.isoformat()
        }
    }), 201





@appointment_bp.route(
    "/appointments/<int:appointment_id>/prescription",
    methods=["GET"]
)
@jwt_required()
def get_prescription_route(appointment_id):

    user_id = int(get_jwt_identity())
    user_role = get_jwt().get("role")

    if user_role not in ["patient", "doctor"]:
        return jsonify({
            "error": "Only patients and doctors can view prescriptions"
        }), 403

    try:
        prescription = get_prescription(
            user_id,
            user_role,
            appointment_id
        )

    except AppointmentNotFound as e:
        return jsonify({"error": str(e)}), 404

    except AppointmentNotOwned as e:
        return jsonify({"error": str(e)}), 403

    except PrescriptionNotFound as e:
        return jsonify({"error": str(e)}), 404

    return jsonify({
        "prescription": {
            "id": prescription.id,
            "appointment_id": prescription.appointment_id,
            "notes": prescription.notes,
            "medicines": prescription.medicines,
            "created_at": prescription.created_at.isoformat()
        }
    }), 200
