import os
from typing import Dict, Any, List
import httpx


from pathlib import Path

def get_groq_key() -> str:
    key = os.environ.get("GROQ_API_KEY", "")
    if key and key != "your_free_groq_api_key_here":
        return key.strip('"\'')
    
    # Try loading from .env in project root
    env_file = Path(__file__).resolve().parents[2] / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("GROQ_API_KEY="):
                val = line.split("=", 1)[1].strip().strip('"\'')
                if val and val != "your_free_groq_api_key_here":
                    return val
    return ""


GROQ_MODEL = os.environ.get("GROQ_MODEL", "groq/compound-mini")


async def call_groq_api(messages: List[Dict[str, str]], system_prompt: str = "") -> str:
    """Calls Groq API if API key is provided, otherwise returns smart fallback response."""
    key = get_groq_key()
    if not key:
        return ""

    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }

    formatted_messages = []
    if system_prompt:
        formatted_messages.append({"role": "system", "content": system_prompt})
    formatted_messages.extend(messages)

    payload = {
        "model": GROQ_MODEL,
        "messages": formatted_messages,
        "temperature": 0.7,
        "max_tokens": 1024
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"[Groq AI Agent Error]: {e}")
    
    return ""


async def run_tutoring_agent(user_message: str, course_code: str = None, history: List[Dict[str, str]] = None) -> str:
    system_prompt = (
        "You are Alma AI, an intelligent, encouraging academic tutor and university assistant. "
        f"The student is asking about course {course_code or 'General Academic Inquiry'}. "
        "Provide clear, concise, step-by-step explanations and study tips."
    )
    
    messages = []
    if history:
        for msg in history:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
    messages.append({"role": "user", "content": user_message})

    response = await call_groq_api(messages, system_prompt)
    if response:
        return response
    
    # Smart local fallback response when API key is pending
    course_str = f" for {course_code}" if course_code else ""
    return (
        f"Hello! I am your Alma AI Study Assistant{course_str}. "
        f"Regarding your query: '{user_message}'\n\n"
        "Here are key steps to address this:\n"
        "1. Review the core concepts and lecture slides uploaded in the course resources.\n"
        "2. Work through sample problem sets and verify intermediate calculations.\n"
        "3. Reach out to your instructor during office hours if you require further clarification.\n\n"
        "*(Note: Groq API Key can be added to .env for real-time LLM responses)*"
    )


async def run_risk_assessment_agent(student_name: str, attendance_rate: float, gpa: float, failed_assignments: int) -> Dict[str, Any]:
    system_prompt = "You are an AI Academic Advisor evaluator analyzing student retention and risk factors."
    user_prompt = f"Analyze risk for student {student_name}: Attendance Rate: {attendance_rate}%, GPA: {gpa}, Failed Assignments: {failed_assignments}."
    
    llm_analysis = await call_groq_api([{"role": "user", "content": user_prompt}], system_prompt)
    
    # Calculate rule-based risk level & recommendations
    if attendance_rate < 70 or gpa < 2.2 or failed_assignments >= 3:
        risk_level = "HIGH"
        score = 85
        recommendations = [
            "Schedule mandatory 1-on-1 counseling session with Academic Advisor",
            "Enroll student in peer tutoring program",
            "Monitor weekly assignment submissions and attendance logs"
        ]
    elif attendance_rate < 82 or gpa < 2.8 or failed_assignments >= 1:
        risk_level = "MEDIUM"
        score = 45
        recommendations = [
            "Send automated attendance check-in alert",
            "Recommend office hours consultation for recent low-scoring assignments"
        ]
    else:
        risk_level = "LOW"
        score = 15
        recommendations = [
            "Student performing well. Maintain standard academic progress monitoring."
        ]

    return {
        "student_name": student_name,
        "risk_level": risk_level,
        "risk_score": score,
        "recommendations": recommendations,
        "ai_summary": llm_analysis or f"Risk analysis indicates {risk_level} risk level based on attendance ({attendance_rate}%) and GPA ({gpa})."
    }
