# Alma UMS — Master AI Build Prompt

> Paste this prompt into any capable AI coding assistant (Claude, GPT-4, Cursor, etc.) to scaffold and build the full Alma University Management System. It encodes every architectural, design, and AI decision made during planning.

---

## 0. Project identity

You are building **Alma UMS** — an AI-powered university management system. The product name is Alma (Latin: "nourishing"). It is warm, serious, and purposeful. It must never look like a generic AI dashboard or a typical university ERP.

Work methodically. Before writing any file, state what you are about to create and why. After each major section, summarize what was built and what comes next. Never skip steps silently.

---

## 1. Tech stack — non-negotiable

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v3 (custom config below) |
| State | Zustand (global auth/role) + React Query (server state) |
| HTTP client | Axios with JWT interceptors |
| Routing | React Router v6 with protected route guards |
| Backend | Django 4.2 + Django REST Framework |
| Auth | `djangorestframework-simplejwt` |
| Database | PostgreSQL 15 |
| Async tasks | Celery + Redis |
| AI service | FastAPI 0.110 |
| AI framework | LangGraph (agents) + LangChain (chains) |
| LLM | Groq API (`llama3-70b-8192` model) |
| AI memory/cache | Redis |
| File storage | MinIO (S3-compatible) |
| Container | Docker + Docker Compose |
| Reverse proxy | Nginx |

Do not substitute any of these. If a library version conflict arises, resolve it and continue.

---

## 2. Folder structure

Scaffold exactly this structure before writing any logic:

```
alma-ums/
├── docker-compose.yml
├── nginx/
│   └── nginx.conf
│
├── frontend/                          # React + Vite
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/                       # Axios instances + all endpoint functions
│       │   ├── client.ts              # Base Axios instance with JWT interceptor
│       │   ├── auth.api.ts
│       │   ├── students.api.ts
│       │   ├── courses.api.ts
│       │   ├── attendance.api.ts
│       │   ├── grades.api.ts
│       │   ├── assignments.api.ts
│       │   ├── analytics.api.ts
│       │   └── ai.api.ts
│       ├── store/
│       │   └── auth.store.ts          # Zustand store: user, role, token
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useRBAC.ts             # canAccess(role) → boolean
│       │   └── useCurrentUser.ts
│       ├── layouts/
│       │   ├── RootLayout.tsx         # Topbar + sidebar shell
│       │   ├── AdminLayout.tsx
│       │   ├── FacultyLayout.tsx
│       │   ├── StudentLayout.tsx
│       │   └── AdvisorLayout.tsx
│       ├── routes/
│       │   ├── index.tsx              # All routes defined here
│       │   └── ProtectedRoute.tsx     # Role-aware guard
│       ├── features/
│       │   ├── admin/
│       │   │   ├── pages/
│       │   │   │   ├── AdminDashboard.tsx
│       │   │   │   ├── ManageUsers.tsx
│       │   │   │   ├── ManageCourses.tsx
│       │   │   │   ├── ManageDepartments.tsx
│       │   │   │   └── InstitutionalAnalytics.tsx
│       │   │   └── components/
│       │   ├── faculty/
│       │   │   ├── pages/
│       │   │   │   ├── FacultyDashboard.tsx
│       │   │   │   ├── MyCourses.tsx
│       │   │   │   ├── AttendanceMarking.tsx
│       │   │   │   ├── GradeEntry.tsx
│       │   │   │   ├── AssignmentManager.tsx
│       │   │   │   └── StudentRiskView.tsx
│       │   │   └── components/
│       │   ├── student/
│       │   │   ├── pages/
│       │   │   │   ├── StudentDashboard.tsx
│       │   │   │   ├── MyCourses.tsx
│       │   │   │   ├── MyGrades.tsx
│       │   │   │   ├── MyAttendance.tsx
│       │   │   │   ├── Assignments.tsx
│       │   │   │   ├── AcademicProgress.tsx
│       │   │   │   └── AIRecommendations.tsx
│       │   │   └── components/
│       │   └── advisor/
│       │       ├── pages/
│       │       │   ├── AdvisorDashboard.tsx
│       │       │   ├── AssignedStudents.tsx
│       │       │   ├── InterventionPlans.tsx
│       │       │   └── CounselingLog.tsx
│       │       └── components/
│       └── components/                # Shared UI components
│           ├── ui/
│           │   ├── Button.tsx
│           │   ├── Badge.tsx
│           │   ├── Card.tsx
│           │   ├── Table.tsx
│           │   ├── Modal.tsx
│           │   ├── Input.tsx
│           │   ├── Select.tsx
│           │   ├── Spinner.tsx
│           │   ├── RiskBadge.tsx      # Low/Med/High with dot
│           │   ├── StatCard.tsx
│           │   └── Avatar.tsx
│           ├── layout/
│           │   ├── Sidebar.tsx
│           │   ├── Topbar.tsx
│           │   └── PageHeader.tsx
│           └── ai/
│               ├── AIAssistant.tsx    # Floating chat widget
│               ├── RiskCard.tsx
│               └── LessonViewer.tsx
│
├── backend/                           # Django
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── celery.py
│   └── apps/
│       ├── accounts/                  # CustomUser, JWT, roles
│       ├── departments/               # Department, Program
│       ├── courses/                   # Course, Enrollment, Semester
│       ├── attendance/                # AttendanceRecord
│       ├── assignments/               # Assignment, Submission
│       ├── grades/                    # Grade, GPA
│       ├── messaging/                 # Notification, Announcement
│       ├── analytics/                 # Aggregated read models
│       └── ai_bridge/                 # Facade to FastAPI AI service
│
└── ai_service/                        # FastAPI
    ├── main.py
    ├── requirements.txt
    ├── routers/
    │   ├── risk.py
    │   ├── lessons.py
    │   ├── chatbot.py
    │   └── alerts.py
    ├── agents/
    │   ├── risk_agent.py              # LangGraph graph
    │   ├── lesson_agent.py            # LangChain chain
    │   └── chat_agent.py             # Conversational agent
    ├── schemas/                       # Pydantic models
    │   ├── risk.py
    │   ├── lesson.py
    │   └── chat.py
    └── prompts/                       # Prompt templates as .txt files
        ├── risk_analysis.txt
        ├── lesson_generation.txt
        ├── early_warning.txt
        └── chat_system.txt
```

---

## 3. Design system — implement exactly

### 3.1 Tailwind config

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: {
          50:  '#FAF8F4',
          100: '#F2EDE3',
          200: '#E5DDD0',
          300: '#CFC3AE',
        },
        terracotta: {
          DEFAULT: '#C4603A',
          light:   '#F5E8E2',
          dim:     '#9B4A2B',
        },
        amber: {
          DEFAULT: '#D4821A',
          light:   '#FDF3E0',
          dim:     '#9E5F0E',
        },
        moss: {
          DEFAULT: '#4A6741',
          light:   '#EBF0E8',
          dim:     '#344A2C',
        },
        ink: {
          DEFAULT: '#1E1C18',
          60: 'rgba(30,28,24,0.6)',
          30: 'rgba(30,28,24,0.3)',
          10: 'rgba(30,28,24,0.08)',
        },
      },
      fontFamily: {
        sans:  ['DM Sans', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
      },
    },
  },
  plugins: [],
} satisfies Config
```

### 3.2 Google Fonts (in index.html)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display&display=swap" rel="stylesheet">
```

### 3.3 Design rules — enforce throughout all components

- Page background: `bg-sand-50`
- Card surfaces: `bg-white border border-ink-10 rounded-lg`
- Page titles: `font-serif text-2xl font-normal tracking-tight` (DM Serif Display, weight 400)
- Stat numbers: `font-serif text-3xl font-normal` — editorial, not numeric display
- Section labels: `text-xs font-medium uppercase tracking-widest text-ink-30`
- Body text: `text-sm text-ink` (DM Sans weight 400)
- Secondary text: `text-xs text-ink-60`
- Borders: always `border-ink-10` at 0.5px — never full black borders
- Active nav item: `bg-terracotta-light text-terracotta-dim font-medium`
- Table header: `bg-sand-50 text-xs uppercase tracking-wider text-ink-30`
- No gradients. No shadows (except `ring` focus states). No blur effects.
- No rounded corners on single-sided borders (alerts use `border-l-2 rounded-none`)

### 3.4 Risk badge component

```tsx
// src/components/ui/RiskBadge.tsx
type Risk = 'low' | 'medium' | 'high'

const config = {
  low:    { bg: 'bg-moss-light',        text: 'text-moss-dim',        dot: 'bg-moss' },
  medium: { bg: 'bg-amber-light',       text: 'text-amber-dim',       dot: 'bg-amber' },
  high:   { bg: 'bg-terracotta-light',  text: 'text-terracotta-dim',  dot: 'bg-terracotta' },
}

export function RiskBadge({ level }: { level: Risk }) {
  const c = config[level]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  )
}
```

### 3.5 Role color mapping

| Role | Accent color | Avatar bg |
|---|---|---|
| Admin | `ink` (neutral) | `bg-sand-200 text-ink-60` |
| Faculty | `terracotta` | `bg-terracotta-light text-terracotta-dim` |
| Student | `amber` | `bg-amber-light text-amber-dim` |
| Advisor | `moss` | `bg-moss-light text-moss-dim` |

The active nav sidebar item inherits the logged-in user's role accent color.

---

## 4. RBAC — implement exactly

### 4.1 Django: CustomUser model

```python
# apps/accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        ADMIN   = 'admin',   'Administrator'
        FACULTY = 'faculty', 'Faculty'
        STUDENT = 'student', 'Student'
        ADVISOR = 'advisor', 'Academic Advisor'

    role       = models.CharField(max_length=20, choices=Role.choices)
    phone      = models.CharField(max_length=20, blank=True)
    avatar_url = models.URLField(blank=True)
    department = models.ForeignKey('departments.Department', null=True, blank=True,
                                   on_delete=models.SET_NULL, related_name='users')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'role']
```

### 4.2 Django: JWT with role in payload

```python
# apps/accounts/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class AlmaTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role']       = user.role
        token['full_name']  = user.get_full_name()
        token['department'] = user.department.name if user.department else None
        return token
```

### 4.3 Django: Permission classes per role

```python
# apps/accounts/permissions.py
from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsFaculty(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'faculty'

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'

class IsAdvisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'advisor'

class IsAdminOrFaculty(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('admin', 'faculty')

class IsAdminOrAdvisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('admin', 'advisor')
```

### 4.4 React: RBAC hook + protected routes

```tsx
// src/hooks/useRBAC.ts
import { useAuthStore } from '@/store/auth.store'

type Role = 'admin' | 'faculty' | 'student' | 'advisor'

export function useRBAC(requiredRole: Role | Role[]) {
  const { user } = useAuthStore()
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return { canAccess: user ? roles.includes(user.role as Role) : false }
}

// src/routes/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

type Props = { allowedRoles: string[]; children: React.ReactNode }

export function ProtectedRoute({ allowedRoles, children }: Props) {
  const { user, token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user?.role ?? '')) return <Navigate to="/unauthorized" replace />
  return <>{children}</>
}
```

### 4.5 Data access matrix

Implement object-level permissions following this matrix:

| Resource | Admin | Faculty | Student | Advisor |
|---|---|---|---|---|
| All users (CRUD) | Full | None | None | None |
| Own profile | Full | Full | Full | Full |
| All courses | Full | Own courses | Enrolled only | None |
| All student records | Full | Students in their courses | Own only | Assigned students only |
| Grades (write) | Full | Own course students | None | None |
| Grades (read) | Full | Own course students | Own | Assigned students |
| Attendance (write) | Full | Own courses | None | None |
| Attendance (read) | Full | Own courses | Own | Assigned students |
| AI risk dashboard | Full (university-wide) | Own course students | Own score only | Assigned students |
| AI alerts | All alerts | Their course students | Own alerts | Assigned student alerts |
| Analytics | Institutional | Course-level | Personal | Student-level |
| Notifications | Send to all | Send to own students | Receive only | Send to assigned students |

---

## 5. Django backend — core apps

Build each app in order. Each app must have: `models.py`, `serializers.py`, `views.py`, `urls.py`, `services.py`, `permissions.py` (if app-specific), `signals.py` (if applicable), `tests.py`.

### 5.1 Service layer pattern (enforce for every app)

Never put business logic in views. Views must be thin:

```python
# Pattern to follow in every viewset
class EnrollmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminOrStudent]
    serializer_class = EnrollmentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = EnrollmentService.enroll_student(
            student=request.user,
            course_id=serializer.validated_data['course_id']
        )
        return Response(result, status=status.HTTP_201_CREATED)
```

Services are plain Python classes in `apps/<app>/services.py`. They contain all logic, call repositories, and raise exceptions that views convert to HTTP responses.

### 5.2 Repository pattern (enforce for complex queries)

```python
# apps/students/repositories.py
class StudentRepository:
    @staticmethod
    def get_at_risk_students(faculty_user=None, threshold=0.65):
        qs = StudentProfile.objects.select_related('user', 'department')
        if faculty_user:
            qs = qs.filter(enrollments__course__faculty=faculty_user)
        return qs.filter(ai_risk_score__gte=threshold).distinct()

    @staticmethod
    def get_performance_summary(student_id: int) -> dict:
        # Aggregate attendance, grades, assignments in one query block
        ...
```

### 5.3 Observer pattern via Django signals

```python
# apps/grades/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Grade
from apps.ai_bridge.tasks import trigger_risk_assessment

@receiver(post_save, sender=Grade)
def grade_saved_handler(sender, instance, created, **kwargs):
    """When any grade is saved, re-evaluate the student's risk score async."""
    trigger_risk_assessment.delay(student_id=instance.student.id)
```

Connect signals in `apps/grades/apps.py` → `ready()`.

### 5.4 Core models to build

**accounts:** `CustomUser` (as above)

**departments:** `Department(name, code, head)`, `Program(name, department, duration_years)`

**courses:** `Course(code, name, program, faculty, credits, semester)`, `Enrollment(student, course, enrolled_at, status)`, `Semester(name, start_date, end_date, is_active)`

**attendance:** `AttendanceRecord(student, course, date, status[present/absent/late], marked_by)`

**assignments:** `Assignment(course, title, description, due_date, max_marks, file_url)`, `Submission(assignment, student, submitted_at, file_url, marks_obtained, feedback)`

**grades:** `Grade(student, course, midterm, final, assignments_avg, quiz_avg, total, letter_grade, gpa_points)`, compute GPA automatically in `Grade.save()`.

**messaging:** `Notification(recipient, title, body, type[info/warning/critical], is_read, created_at)`, `Announcement(author, title, body, target_roles, course)`

**analytics:** No models — only views and serializers that aggregate across apps using repository queries. All analytics endpoints are GET-only.

**ai_bridge:** `AIRiskResult(student, score, level, explanation, computed_at)`, `AILesson(student, topic, content_json, created_at)`. This app is Django's facade to FastAPI.

---

## 6. AI bridge (Django → FastAPI)

### 6.1 Facade class

```python
# apps/ai_bridge/service.py
import httpx
from django.conf import settings
from django.core.cache import cache

AI_BASE = settings.AI_SERVICE_URL  # e.g. http://ai_service:8001

class AIService:
    CACHE_TTL = 3600  # 1 hour

    @classmethod
    def get_risk_score(cls, student_id: int) -> dict:
        cache_key = f"risk:{student_id}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        payload = cls._build_student_payload(student_id)
        try:
            response = httpx.post(f"{AI_BASE}/predict/risk", json=payload, timeout=15)
            response.raise_for_status()
            result = response.json()
            cache.set(cache_key, result, cls.CACHE_TTL)
            return result
        except httpx.TimeoutException:
            return {"level": "unavailable", "score": None, "explanation": "AI service timeout"}
        except Exception:
            return {"level": "unavailable", "score": None, "explanation": "AI service error"}

    @classmethod
    def generate_lesson(cls, student_id: int, topic: str, weak_areas: list[str]) -> dict:
        payload = {"student_id": student_id, "topic": topic, "weak_areas": weak_areas}
        response = httpx.post(f"{AI_BASE}/generate/lesson", json=payload, timeout=30)
        response.raise_for_status()
        return response.json()

    @classmethod
    def chat(cls, session_id: str, message: str, role: str) -> dict:
        payload = {"session_id": session_id, "message": message, "role": role}
        response = httpx.post(f"{AI_BASE}/chat", json=payload, timeout=20)
        response.raise_for_status()
        return response.json()

    @staticmethod
    def _build_student_payload(student_id: int) -> dict:
        from apps.students.repositories import StudentRepository
        return StudentRepository.get_ai_payload(student_id)
```

### 6.2 Celery tasks

```python
# apps/ai_bridge/tasks.py
from config.celery import app
from .service import AIService
from apps.messaging.services import NotificationService

@app.task(bind=True, max_retries=3)
def trigger_risk_assessment(self, student_id: int):
    result = AIService.get_risk_score(student_id)
    if result['level'] == 'high':
        NotificationService.send_risk_alert(student_id, result)

@app.task
def nightly_batch_risk_assessment():
    """Runs every night at 2am via Celery Beat."""
    from apps.students.repositories import StudentRepository
    for student_id in StudentRepository.get_all_active_student_ids():
        trigger_risk_assessment.delay(student_id)
```

---

## 7. FastAPI AI service

### 7.1 Risk prediction agent (LangGraph)

```python
# ai_service/agents/risk_agent.py
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from typing import TypedDict

llm = ChatGroq(model="llama3-70b-8192", temperature=0.1)

class RiskState(TypedDict):
    student_data: dict
    attendance_score: float
    academic_score: float
    engagement_score: float
    aggregate_score: float
    risk_level: str
    explanation: str

def score_attendance(state: RiskState) -> RiskState:
    d = state["student_data"]
    state["attendance_score"] = d.get("attendance_pct", 0) / 100
    return state

def score_academics(state: RiskState) -> RiskState:
    d = state["student_data"]
    gpa_score = d.get("current_gpa", 0) / 4.0
    assignment_score = d.get("assignment_completion_pct", 0) / 100
    quiz_score = d.get("avg_quiz_score", 0) / 100
    state["academic_score"] = (gpa_score * 0.5 + assignment_score * 0.3 + quiz_score * 0.2)
    return state

def score_engagement(state: RiskState) -> RiskState:
    d = state["student_data"]
    state["engagement_score"] = d.get("participation_score", 0.5)
    return state

def aggregate_risk(state: RiskState) -> RiskState:
    state["aggregate_score"] = (
        state["attendance_score"] * 0.35 +
        state["academic_score"]   * 0.50 +
        state["engagement_score"] * 0.15
    )
    score = state["aggregate_score"]
    state["risk_level"] = "low" if score >= 0.7 else ("medium" if score >= 0.45 else "high")
    return state

def generate_explanation(state: RiskState) -> RiskState:
    prompt = open("prompts/risk_analysis.txt").read().format(
        student_data=state["student_data"],
        risk_level=state["risk_level"],
        score=round(state["aggregate_score"], 3)
    )
    response = llm.invoke(prompt)
    state["explanation"] = response.content
    return state

# Build graph
graph = StateGraph(RiskState)
graph.add_node("attendance",   score_attendance)
graph.add_node("academics",    score_academics)
graph.add_node("engagement",   score_engagement)
graph.add_node("aggregate",    aggregate_risk)
graph.add_node("explanation",  generate_explanation)

graph.set_entry_point("attendance")
graph.add_edge("attendance",  "academics")
graph.add_edge("academics",   "engagement")
graph.add_edge("engagement",  "aggregate")
graph.add_edge("aggregate",   "explanation")
graph.add_edge("explanation", END)

risk_graph = graph.compile()
```

### 7.2 Lesson generation chain (LangChain)

```python
# ai_service/agents/lesson_agent.py
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

llm = ChatGroq(model="llama3-70b-8192", temperature=0.4)

lesson_prompt = ChatPromptTemplate.from_template(
    open("prompts/lesson_generation.txt").read()
)

lesson_chain = lesson_prompt | llm | JsonOutputParser()

# Returns: { "title", "summary", "sections": [{"heading", "content", "examples"}], "practice_questions": [...] }
```

### 7.3 Chat agent (LangGraph with memory)

```python
# ai_service/agents/chat_agent.py
# Stateful conversational agent with Redis-backed session memory.
# System prompt loaded from prompts/chat_system.txt
# Contains university policies, course info, academic calendar.
# Role-aware: adapts responses based on user's role field in payload.
```

### 7.4 FastAPI routers

```python
# ai_service/routers/risk.py
from fastapi import APIRouter
from agents.risk_agent import risk_graph
from schemas.risk import RiskRequest, RiskResponse

router = APIRouter()

@router.post("/predict/risk", response_model=RiskResponse)
async def predict_risk(request: RiskRequest):
    result = risk_graph.invoke({"student_data": request.dict()})
    return RiskResponse(
        level=result["risk_level"],
        score=round(result["aggregate_score"], 3),
        explanation=result["explanation"]
    )
```

Build equivalent routers for `/generate/lesson`, `/chat`, `/check/alerts`.

### 7.5 Prompt files

**`prompts/risk_analysis.txt`:**
```
You are an academic risk analyst for a university. Based on the following student data,
provide a concise 2-3 sentence explanation of why this student is at {risk_level} risk.
Be specific, empathetic, and actionable. Do not be generic.

Student data: {student_data}
Computed risk score: {score} (0 = highest risk, 1 = lowest risk)

Focus on the most impactful factors. Suggest one concrete intervention.
Respond in plain text only. No bullet points. No markdown.
```

**`prompts/lesson_generation.txt`:**
```
You are a university tutor. Generate a structured lesson for a student struggling with: {topic}
Their specific weak areas: {weak_areas}
Student level: {student_level}
Course: {course_name}

Respond ONLY with valid JSON matching this exact schema:
{{
  "title": "string",
  "summary": "string (2 sentences)",
  "sections": [
    {{"heading": "string", "content": "string", "examples": ["string"]}}
  ],
  "practice_questions": ["string"],
  "estimated_read_minutes": number
}}
No preamble. No markdown fences. Pure JSON only.
```

**`prompts/chat_system.txt`:**
```
You are Alma, the academic assistant for this university management system.
You help students, faculty, advisors, and administrators with academic matters.
Current user role: {role}

You know:
- University academic regulations and grading policy
- Course registration and enrollment procedures
- Assignment submission guidelines
- GPA calculation methods
- Academic support resources available

Rules:
- Be warm, concise, and specific. Never give generic advice.
- If a student asks about their grades or risk score, encourage them constructively.
- If you don't know something specific to this university, say so clearly.
- Never fabricate specific dates, names, or policies you aren't given.
- Respond in plain conversational text. No bullet lists unless explicitly helpful.
```

---

## 8. Event-driven / async pipeline

Implement this exact flow for the early warning system:

```
1. Teacher marks attendance / submits grade
   ↓ Django model .save()
   ↓ Django signal fires (post_save)
   ↓ Celery task enqueued: trigger_risk_assessment(student_id)

2. Celery worker picks up task
   ↓ Calls AIService.get_risk_score(student_id)
   ↓ AIService builds payload from StudentRepository
   ↓ POST to FastAPI /predict/risk

3. FastAPI runs LangGraph risk graph
   ↓ Returns { level, score, explanation }

4. Django saves AIRiskResult to DB
   ↓ If level == 'high':
     → Create Notification for student (type=critical)
     → Create Notification for faculty of that course (type=warning)
     → Create Notification for assigned advisor (type=warning)
     → Create Notification for admin (type=info)

5. Frontend polls /api/notifications/ every 30s
   ↓ New notifications appear in topbar bell icon
   ↓ Dashboard at-risk counter updates
```

Also implement **nightly Celery Beat** job at 02:00 that runs `nightly_batch_risk_assessment` across all active students.

---

## 9. API endpoint map

All Django endpoints under `/api/v1/`. All FastAPI endpoints under `/ai/v1/`.

```
AUTH
POST   /api/v1/auth/token/              Login → JWT pair
POST   /api/v1/auth/token/refresh/      Refresh access token
POST   /api/v1/auth/logout/

USERS (Admin only for CRUD, others GET self)
GET    /api/v1/users/
POST   /api/v1/users/
GET    /api/v1/users/{id}/
PATCH  /api/v1/users/{id}/
DELETE /api/v1/users/{id}/
GET    /api/v1/users/me/

DEPARTMENTS
GET/POST   /api/v1/departments/
GET/PATCH  /api/v1/departments/{id}/
GET/POST   /api/v1/programs/

COURSES
GET/POST   /api/v1/courses/
GET/PATCH  /api/v1/courses/{id}/
GET        /api/v1/courses/{id}/students/
GET        /api/v1/courses/{id}/analytics/
GET/POST   /api/v1/enrollments/
GET/POST   /api/v1/semesters/

ATTENDANCE
GET/POST   /api/v1/attendance/
GET        /api/v1/attendance/student/{student_id}/
GET        /api/v1/attendance/course/{course_id}/
GET        /api/v1/attendance/course/{course_id}/summary/

ASSIGNMENTS
GET/POST   /api/v1/assignments/
GET/PATCH  /api/v1/assignments/{id}/
POST       /api/v1/assignments/{id}/submit/
GET        /api/v1/submissions/
PATCH      /api/v1/submissions/{id}/grade/

GRADES
GET/POST   /api/v1/grades/
GET        /api/v1/grades/student/{student_id}/
GET        /api/v1/grades/student/{student_id}/gpa/
GET        /api/v1/grades/student/{student_id}/transcript/

ANALYTICS
GET        /api/v1/analytics/institutional/        (admin)
GET        /api/v1/analytics/department/{id}/
GET        /api/v1/analytics/course/{id}/
GET        /api/v1/analytics/student/{id}/

MESSAGING
GET        /api/v1/notifications/
PATCH      /api/v1/notifications/{id}/read/
GET/POST   /api/v1/announcements/

AI BRIDGE (Django proxies to FastAPI)
GET        /api/v1/ai/risk/{student_id}/
POST       /api/v1/ai/lesson/generate/
POST       /api/v1/ai/chat/
GET        /api/v1/ai/recommendations/{student_id}/

FASTAPI (internal, not exposed to frontend directly)
POST       /ai/v1/predict/risk
POST       /ai/v1/generate/lesson
POST       /ai/v1/chat
POST       /ai/v1/check/alerts
```

---

## 10. Docker Compose

```yaml
# docker-compose.yml
version: '3.9'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: alma_ums
      POSTGRES_USER: alma
      POSTGRES_PASSWORD: alma_secret
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  backend:
    build: ./backend
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://alma:alma_secret@db:5432/alma_ums
      - REDIS_URL=redis://redis:6379/0
      - AI_SERVICE_URL=http://ai_service:8001
      - SECRET_KEY=dev-secret-change-in-production
    depends_on: [db, redis]
    ports:
      - "8000:8000"

  celery_worker:
    build: ./backend
    command: celery -A config worker -l info
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://alma:alma_secret@db:5432/alma_ums
      - REDIS_URL=redis://redis:6379/0
      - AI_SERVICE_URL=http://ai_service:8001
    depends_on: [db, redis, backend]

  celery_beat:
    build: ./backend
    command: celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://alma:alma_secret@db:5432/alma_ums
      - REDIS_URL=redis://redis:6379/0
    depends_on: [db, redis, backend]

  ai_service:
    build: ./ai_service
    command: uvicorn main:app --host 0.0.0.0 --port 8001 --reload
    volumes:
      - ./ai_service:/app
    environment:
      - GROQ_API_KEY=${GROQ_API_KEY}
      - REDIS_URL=redis://redis:6379/1
    ports:
      - "8001:8001"
    depends_on: [redis]

  frontend:
    build: ./frontend
    command: npm run dev -- --host
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "5173:5173"

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
    depends_on: [backend, frontend, ai_service]

volumes:
  postgres_data:
```

---

## 11. Circuit breaker pattern

Implement in `apps/ai_bridge/service.py`:

```python
import time
from threading import Lock

class CircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_timeout=30):
        self.failure_count = 0
        self.threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.last_failure_time = None
        self.state = "closed"  # closed=normal, open=failing, half-open=testing
        self._lock = Lock()

    def call(self, func, *args, **kwargs):
        with self._lock:
            if self.state == "open":
                if time.time() - self.last_failure_time > self.recovery_timeout:
                    self.state = "half-open"
                else:
                    raise Exception("Circuit breaker OPEN — AI service unavailable")
        try:
            result = func(*args, **kwargs)
            with self._lock:
                self.failure_count = 0
                self.state = "closed"
            return result
        except Exception as e:
            with self._lock:
                self.failure_count += 1
                self.last_failure_time = time.time()
                if self.failure_count >= self.threshold:
                    self.state = "open"
            raise e

ai_circuit_breaker = CircuitBreaker()
```

Wrap all `httpx` calls in `AIService` with `ai_circuit_breaker.call(...)`.

---

## 12. Build sequence

Build in this exact order. Do not skip ahead. Confirm completion of each phase before starting the next.

### Phase 1 — Foundation (build first)
- [ ] Docker Compose + Nginx config
- [ ] Django project scaffold + settings (base/dev/prod)
- [ ] `CustomUser` model + JWT auth endpoints
- [ ] React app scaffold + Tailwind config + DM Sans/Serif fonts loaded
- [ ] Login page (clean, uses terracotta accent, serif heading "Welcome back")
- [ ] Auth store (Zustand) + JWT interceptor (Axios)
- [ ] Protected routes + role redirect logic
- [ ] Sidebar + Topbar shell (all four role variants)

### Phase 2 — Core backend
- [ ] `Department`, `Program`, `Semester` models + APIs
- [ ] `Course`, `Enrollment` models + APIs
- [ ] `AttendanceRecord` model + mark attendance API
- [ ] `Assignment`, `Submission` models + APIs
- [ ] `Grade` model + GPA calculation + transcript API
- [ ] `Notification`, `Announcement` models + APIs
- [ ] Django signals wired up

### Phase 3 — Frontend dashboards
- [ ] Faculty Dashboard (stat cards, student risk table, course list, alert sidebar)
- [ ] Student Dashboard (GPA card, attendance ring, upcoming assignments, AI recommendations panel)
- [ ] Admin Dashboard (institutional stats, user management table, department analytics)
- [ ] Advisor Dashboard (assigned students table, intervention plan tracker)
- [ ] Shared components: `RiskBadge`, `StatCard`, `DataTable`, `Avatar`, `Modal`

### Phase 4 — AI service
- [ ] FastAPI scaffold + all routers stubbed
- [ ] LangGraph risk agent (full graph with all nodes)
- [ ] LangChain lesson generation chain
- [ ] LangGraph chat agent with Redis session memory
- [ ] All prompt files written
- [ ] Django `AIService` facade with circuit breaker
- [ ] Celery tasks: `trigger_risk_assessment`, `nightly_batch_risk_assessment`
- [ ] `AIRiskResult` and `AILesson` models + storage

### Phase 5 — AI features in frontend
- [ ] Risk score display on student profile + faculty student table
- [ ] AI alert panel in faculty/advisor dashboards
- [ ] AI lesson viewer for students (structured lesson from LangChain)
- [ ] AI recommendations page for students
- [ ] AI assistant widget (floating, available to all roles)
- [ ] Notification bell + real-time polling

### Phase 6 — Polish
- [ ] Analytics pages with charts (use Recharts; warm amber/terracotta palette)
- [ ] PDF transcript generation
- [ ] Assignment file upload (MinIO integration)
- [ ] Search (⌘K command palette, searches students/courses/assignments)
- [ ] Announcement broadcast system
- [ ] Mobile responsiveness pass

---

## 13. Code quality rules

Enforce throughout every file you generate:

- All Django views return consistent response shapes: `{ "data": ..., "message": "...", "success": true/false }`
- All API errors use DRF's `ValidationError` with a message field
- All React components are typed with TypeScript interfaces — no `any`
- All React Query keys follow the pattern `['resource', id, filter]`
- No hardcoded strings — use constants files for role names, API paths, status labels
- All database queries use `select_related`/`prefetch_related` to prevent N+1
- All Celery tasks have `max_retries=3` and `bind=True` for retry logic
- All FastAPI routes have Pydantic request and response models
- All AI calls have timeouts: Django→FastAPI 15s, FastAPI→Groq 20s
- Environment variables via `.env` — never hardcode API keys or DB credentials

---

## 14. Environment variables

```env
# .env (root)
GROQ_API_KEY=your_groq_api_key_here
POSTGRES_PASSWORD=alma_secret
DJANGO_SECRET_KEY=your-long-random-secret-key
DJANGO_DEBUG=True
AI_SERVICE_URL=http://ai_service:8001
REDIS_URL=redis://redis:6379/0
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=alma_minio
MINIO_SECRET_KEY=alma_minio_secret
```

---

## 15. Final checklist before declaring complete

- [ ] All four roles can log in and see their correct dashboard
- [ ] A faculty member marking a student absent triggers a Celery task
- [ ] The Celery task calls FastAPI and gets back a risk score
- [ ] If high risk, notifications are created for all relevant roles
- [ ] The AI chat assistant responds correctly for each role's context
- [ ] The lesson generator returns structured JSON rendered as a readable lesson
- [ ] The GPA calculator produces correct results for standard grading scales
- [ ] No N+1 queries on any list view (verify with Django Debug Toolbar)
- [ ] Circuit breaker prevents cascade failure when AI service is down
- [ ] All protected routes redirect correctly for wrong roles
- [ ] The design matches the Alma design system (sand background, serif titles, terracotta accent, no gradients)

---

*End of prompt. Begin with Phase 1. State each file before writing it.*
