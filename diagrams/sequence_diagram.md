# UniMind (Alma UMS) — Sequence Diagrams

This document contains detailed **Sequence Diagrams** representing the interaction patterns across the React Frontend, Django REST API Backend, PostgreSQL Database, Celery Async Worker, FastAPI AI Microservice (LangGraph/Groq LLM), and Redis Cache.

---

## 1. Sequence 1: AI Academic At-Risk Assessment & Advisor Early Warning Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Frontend as React Frontend UI
    participant Django as Django REST API (Backend)
    participant DB as PostgreSQL Database
    participant Celery as Celery Worker
    participant AI as FastAPI AI Service (LangGraph)
    participant Groq as Groq LLM API (llama3-70b)
    actor Advisor

    Student->>Frontend: Misses class / Fails Assignment
    Frontend->>Django: POST /api/attendance/ OR POST /api/grades/
    Django->>DB: Save AttendanceRecord / AssessmentGrade
    Django->>Celery: Trigger async evaluate_student_risk_task(student_id)
    
    activate Celery
    Celery->>DB: Fetch attendance history, grades, CGPA
    DB-->>Celery: Return academic telemetry
    Celery->>AI: POST /ai/risk/evaluate (student payload)
    
    activate AI
    AI->>Groq: Query risk analysis prompt with student metrics
    Groq-->>AI: Return risk evaluation JSON (score=0.78, level="HIGH", drivers=["Low Attendance", "Failed Midterm"])
    AI-->>Celery: Return Risk Assessment Result
    deactivate AI
    
    Celery->>DB: Update StudentProfile.risk_level = "HIGH"
    Celery->>DB: Create Notification(recipient=Advisor, kind="RISK_ALERT")
    deactivate Celery

    Advisor->>Frontend: Open Advisor Dashboard
    Frontend->>Django: GET /api/advisors/assigned-students/
    Django->>DB: Query students (order by risk_level DESC)
    DB-->>Django: Return at-risk student list
    Django-->>Frontend: Display At-Risk Banner & High-Risk Badges
    Frontend-->>Advisor: Render At-Risk Alert for Student
```

---

## 2. Sequence 2: Assignment Submission & AI-Assisted Automated Feedback Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as React Student Portal
    participant API as Django REST API
    participant Storage as File Storage (MinIO/S3)
    participant DB as PostgreSQL DB
    participant AI as FastAPI AI Service
    participant Groq as Groq LLM API

    Student->>UI: Select Assignment & Upload File / Text
    UI->>API: POST /api/assignments/{id}/submit/ (Multipart FormData)
    API->>Storage: Store Submission File attachment
    Storage-->>API: Return file_url
    API->>DB: Create Submission (status="SUBMITTED", student=Student)
    DB-->>API: Saved Submission instance

    opt Real-time AI Preliminary Feedback Request
        API->>AI: POST /ai/lessons/evaluate-submission
        activate AI
        AI->>Groq: Generate constructive feedback & rubric score recommendation
        Groq-->>AI: Return feedback text & recommended score
        AI-->>API: Feedback response payload
        deactivate AI
        API->>DB: Update Submission (feedback=AI_feedback, status="GRADED")
    end

    API-->>UI: 201 Created (Submission Success + Feedback Preview)
    UI-->>Student: Display "Submitted" status with instant AI feedback summary
```

---

## 3. Sequence 3: AI Advisory Chatbot Interaction Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant ChatWidget as React Floating AIAssistant Widget
    participant FastApiAI as FastAPI Microservice (/ai/chatbot)
    participant RedisMemory as Redis Conversation Cache
    participant LangChain as LangChain Conversational Agent
    participant Groq as Groq LLM API (llama3-70b-8192)

    Student->>ChatWidget: Type question ("What prerequisite courses do I need for Machine Learning?")
    ChatWidget->>FastApiAI: POST /ai/chatbot/query { user_id, message, session_id }
    
    activate FastApiAI
    FastApiAI->>RedisMemory: GET chat_history:{session_id}
    RedisMemory-->>FastApiAI: Return prior message buffer
    
    FastApiAI->>LangChain: Execute Prompt with Context + Query + History
    LangChain->>Groq: POST completions API with prompt context
    Groq-->>LangChain: Streamed text response chunks
    
    LangChain-->>FastApiAI: Compiled AI response
    FastApiAI->>RedisMemory: UPDATE chat_history:{session_id} (append user + assistant turn)
    FastApiAI-->>ChatWidget: JSON Response { response, suggestions }
    deactivate FastApiAI

    ChatWidget-->>Student: Render response formatted in Markdown with action buttons
```
