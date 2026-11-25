
from pydantic import BaseModel, Field


class PrescriptionCreateDTO(BaseModel):

    notes: str = Field(min_length=1)
    medicines: str = Field(min_length=1)
