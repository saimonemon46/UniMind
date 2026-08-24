from fastapi import APIRouter, HTTPException
from ai_service.schemas.ai_schemas import TutoringRequest, RiskAssessmentRequest, InstitutionalAnalyticsRequest, AIResponse
from ai_service.agents.groq_agent import run_tutoring_agent, run_risk_assessment_agent, call_groq_api

router = APIRouter(prefix="/ai/v1", tags=["AI Services"])


@router.post("/tutoring/chat", response_model=AIResponse)
async def tutor_chat(req: TutoringRequest):
    try:
        history = [msg.model_dump() for msg in req.conversation_history] if req.conversation_history else []
        reply = await run_tutoring_agent(req.message, req.course_code, history)
        return AIResponse(
            success=True,
            data={"reply": reply, "course_code": req.course_code},
            message="Tutor response generated"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/advising/risk-assessment", response_model=AIResponse)
async def risk_assessment(req: RiskAssessmentRequest):
    try:
        res = await run_risk_assessment_agent(
            student_name=req.student_name,
            attendance_rate=req.attendance_rate,
            gpa=req.gpa,
            failed_assignments=req.failed_assignments
        )
        return AIResponse(
            success=True,
            data=res,
            message="Risk assessment completed"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analytics/summary", response_model=AIResponse)
async def institutional_summary(req: InstitutionalAnalyticsRequest):
    try:
        prompt = (
            f"Provide an executive institutional summary for UniMind: Total Students: {req.total_students}, "
            f"Total Faculty: {req.total_faculty}, Active Courses: {req.active_courses}, Average Attendance: {req.average_attendance}%."
        )
        ai_narrative = await call_groq_api([{"role": "user", "content": prompt}], "You are a university executive analyst.")
        
        return AIResponse(
            success=True,
            data={
                "total_students": req.total_students,
                "total_faculty": req.total_faculty,
                "active_courses": req.active_courses,
                "average_attendance": req.average_attendance,
                "summary_narrative": ai_narrative or f"University operating smoothly with {req.total_students} enrolled students across {req.active_courses} active courses. Average overall attendance is {req.average_attendance}%."
            },
            message="Analytics summary generated"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
