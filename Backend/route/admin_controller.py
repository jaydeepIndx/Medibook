
from flask import Blueprint, Response, stream_with_context
from flask_jwt_extended import jwt_required

from service.admin_service import export_appointments_csv
from utils.auth_utils import role_required

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/export", methods=["GET"])
@jwt_required()
@role_required("admin")
def export_appointments():
    csv_data = export_appointments_csv()

    return Response(
            stream_with_context(csv_data),
        mimetype="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=appointments.csv"
        }
    )
    