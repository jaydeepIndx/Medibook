from pydantic import BaseModel, EmailStr, Field


class DoctorCreateDTO(BaseModel):

    name: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8)
    specialization: str = Field(min_length=2, max_length=100)
    consultation_fee: float = Field(gt=0)


from pydantic import BaseModel, EmailStr, Field


class UpdateDoctorRequestDTO(BaseModel):

    name: str = Field(min_length=3, max_length=50)
    email: EmailStr
    specialization: str = Field(min_length=2, max_length=100)
    consultation_fee: float = Field(gt=0)    