import datetime

from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    national_id: str


class StudentProfileCreate(BaseModel):
    year_level: int
    specialty_id: int
    section_id: int
    section_part: str
    section_shift: str
    enrolled_since: datetime.date | None = None

class ProfessorProfileCreate(BaseModel):
    specialty_area: str | None = None

class UserCreateAdmin(BaseModel):
    email: str
    full_name: str
    national_id: str
    role: str

    student_profile: StudentProfileCreate | None = None
    professor_profile: ProfessorProfileCreate | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str

    class Config:
        from_attributes = True