import datetime
from decimal import Decimal

from pydantic import BaseModel

from app.schemas.user import StudentProfileOut


class DashboardOut(BaseModel):
    user_id: int
    full_name: str
    email: str
    national_id: str
    birth_date: datetime.date | None
    phone: str | None
    is_active: bool
    created_at: datetime.datetime
    roles: list[str]
    profile: StudentProfileOut | None

class SubmissionOut(BaseModel):
    evaluation_title: str
    score: Decimal | None
    weight_percent: Decimal | None
    submitted_at: datetime.datetime | None


class GradeReportOut(BaseModel):
    period_id: int
    period_name: str
    course_name: str
    final_grade: Decimal | None
    status: str
    submissions: list[SubmissionOut]
