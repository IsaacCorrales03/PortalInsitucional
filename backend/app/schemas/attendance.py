
import datetime

from pydantic import BaseModel


class AttendanceRecordOut(BaseModel):
    date: datetime.date
    course_name: str
    present: bool
    late: bool
    justification: str | None


class AttendanceSummaryOut(BaseModel):
    total: int
    present: int
    absent: int
    late: int
    attendance_rate: float
    records: list[AttendanceRecordOut]