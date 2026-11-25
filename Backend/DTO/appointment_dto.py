
from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class AppointmentCreateDTO(BaseModel):

    doctor_id: int = Field(gt=0)

    start_time: datetime

    @field_validator("start_time")
    @classmethod
    def validate_start_time_timezone(cls, value):
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("start_time must include timezone")

        return value
