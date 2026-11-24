from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequestDTO(BaseModel):

    # preventing from extra fields in the request body
    model_config = ConfigDict(extra="forbid")
    

    email: EmailStr
    password: str = Field(min_length=1)