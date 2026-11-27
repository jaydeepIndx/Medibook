
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserUpdateDTO(BaseModel):

    name: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str | None = Field(
        default=None,
        min_length=8
    )

    @field_validator("password", mode="before")
    @classmethod
    def empty_password_to_none(cls, value):
        if value == "":
            return None

        return value
