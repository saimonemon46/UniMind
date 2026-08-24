from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="user or assistant")
    content: str


class TutoringRequest(BaseModel):
    message: str
    course_code: Optional[str] = None
    conversation_history: Optional[List[ChatMessage]] = []


class RiskAssessmentRequest(BaseModel):
    student_id: str
    student_name: str
    attendance_rate: float
    gpa: float
    failed_assignments: int = 0
    notes: Optional[str] = ""


class InstitutionalAnalyticsRequest(BaseModel):
    total_students: int
    total_faculty: int
    active_courses: int
    average_attendance: float
    department_stats: Optional[Dict[str, Any]] = None


class AIResponse(BaseModel):
    success: bool = True
    data: Dict[str, Any]
    message: str = "Request processed successfully"
