from pydantic import BaseModel


class SpecialtyCreateSchema(BaseModel):
    name: str
    description: str | None = None


class SpecialtyUpdateSchema(BaseModel):
    name: str | None = None
    description: str | None = None
