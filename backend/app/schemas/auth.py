from pydantic import BaseModel, Field


class ChangePasswordSchema(BaseModel):
    user_id: int
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)