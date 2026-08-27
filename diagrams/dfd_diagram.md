# UniMind (Alma UMS) — Data Flow Diagrams (DFD)

This document contains the **Data Flow Diagrams (DFD)** for the **UniMind (Alma UMS)** platform, including the **Context Diagram (Level 0)** and the detailed **Decomposition Data Flow Diagram (Level 1)**.

---

## 1. DFD Level 0: Context Diagram

The Context Diagram defines the system boundary for UniMind and illustrates all data inputs and outputs passing between external entities and the central system.

```mermaid
graph TD
    %% External Entities
    STUDENT[External Entity: Student]
    FACULTY[External Entity: Faculty / Teacher]
    ADVISOR[External Entity: Academic Advisor]
    ADMIN[External Entity: Administrator]
    GROQ_API[External Entity: Groq LLM API]

    %% System Boundary
    UNIMIND((0.0 UniMind System: University Management & AI Advisory System))

    %% Student Data Flows
    STUDENT -- Login Credentials, Submission Files, Chat Prompts --> UNIMIND
    UNIMIND -- Course Schedule, Grades, Risk Status, AI Study Plans, Notifications --> STUDENT

    %% Faculty Data Flows
    FACULTY -- Course Materials, Attendance Entries, Assessment Grades, Assignments --> UNIMIND
    UNIMIND -- Class Roster, Student Submissions, Course Performance Analytics --> FACULTY

    %% Advisor Data Flows
    ADVISOR -- Counseling Logs, Intervention Plans, Follow-up Status --> UNIMIND
    UNIMIND -- At-Risk Student Lists, Early Warning Alerts, Student Academic Records --> ADVISOR

    %% Admin Data Flows
    ADMIN -- Department Info, Course Offerings, Room Schedules, User Provisioning --> UNIMIND
    UNIMIND -- System Audit Logs, Institutional Analytics, Enrollment Summaries --> ADMIN

    %% External AI Service Flow
    UNIMIND -- Prompts, Telemetry Data, Conversation Context --> GROQ_API
    GROQ_API -- AI Model Responses, Risk Classification JSON, Lesson Content --> UNIMIND
```

---

## 2. DFD Level 1: Process Decomposition Diagram

The Level 1 DFD decomposes Process 0.0 into seven functional subprocesses and details data flow interactions with primary data stores.

```mermaid
graph TB
    %% External Entities
    E_Student[Student]
    E_Faculty[Faculty]
    E_Advisor[Advisor]
    E_Admin[Admin]
    E_Groq[Groq LLM API]

    %% Processes
    P1((1.0 Auth & User Management))
    P2((2.0 Department & Course Provisioning))
    P3((3.0 Enrollment & Scheduling))
    P4((4.0 Attendance & Assessment Processing))
    P5((5.0 AI Risk Analytics & Intelligence))
    P6((6.0 Advisor Counseling & Interventions))
    P7((7.0 Messaging & Notifications))

    %% Data Stores
    DS1[(D1: Users & Profiles Store)]
    DS2[(D2: Courses & Schedules Store)]
    DS3[(D3: Submissions & Grades Store)]
    DS4[(D4: Attendance Record Store)]
    DS5[(D5: Risk & Intervention Store)]
    DS6[(D6: AI Memory & Cache Store)]

    %% Process 1.0 Flows
    E_Admin -->|User Credentials & Roles| P1
    E_Student -->|Login Request| P1
    P1 -->|Store User / Auth Tokens| DS1
    DS1 -->|User Profile Data| P1
    P1 -->|Auth JWT Token & User Context| E_Student

    %% Process 2.0 Flows
    E_Admin -->|Depts, Programs, Courses| P2
    P2 -->|Save Course Structure| DS2

    %% Process 3.0 Flows
    E_Student -->|Course Select / Drop| P3
    DS2 -->|Fetch Class Timetable| P3
    P3 -->|Save Enrollments & Schedule| DS2
    P3 -->|Personal Class Schedule| E_Student

    %% Process 4.0 Flows
    E_Faculty -->|Mark Attendance| P4
    E_Faculty -->|Create Assignment & Grades| P4
    E_Student -->|Submit Assignment| P4
    P4 -->|Store Attendance| DS4
    P4 -->|Store Assignments & Grades| DS3
    DS3 -->|Grades & Submissions| E_Faculty
    DS4 -->|Attendance Percentage| E_Student

    %% Process 5.0 Flows (AI Engine)
    DS3 -->|Assessment Scores| P5
    DS4 -->|Attendance Telemetry| P5
    DS1 -->|Student Academic Metrics| P5
    P5 -->|Prompt Payload| E_Groq
    E_Groq -->|Risk Score & Recommendations| P5
    P5 -->|Cache Chat Session & Risk Scores| DS6
    P5 -->|Store Risk Evaluation| DS5
    P5 -->|Trigger Risk Alert Event| P7

    %% Process 6.0 Flows
    DS5 -->|Fetch High Risk Students| P6
    P6 -->|At-Risk Student Alerts| E_Advisor
    E_Advisor -->|Create Intervention Plan & Log Notes| P6
    P6 -->|Save Intervention Plan| DS5
    P6 -->|Intervention Goal Notification| E_Student

    %% Process 7.0 Flows
    P7 -->|Write System Notification| DS1
    P7 -->|Display Notifications & Announcements| E_Student
    P7 -->|Display Urgent Alerts| E_Advisor
```

---

## 3. Data Store Reference Table

| Store ID | Data Store Name | Associated Database Tables / Services | Contents |
|---|---|---|---|
| **D1** | Users & Profiles Store | `CustomUser`, `StudentProfile` | User credentials, roles, email, student ID, CGPA, risk status. |
| **D2** | Courses & Schedules Store | `Department`, `Program`, `Semester`, `Course`, `Room`, `ClassSchedule`, `ExamSchedule` | University metadata, course definitions, room allocations, timetables. |
| **D3** | Submissions & Grades Store | `Assignment`, `Submission`, `Grade`, `AssessmentGrade` | Homework prompts, uploaded files, scores, letter grades, feedback. |
| **D4** | Attendance Record Store | `AttendanceRecord` | Per-session attendance records (Present, Absent, Late, Excused). |
| **D5** | Risk & Intervention Store | `InterventionPlan`, `CounselingLog` | AI-generated risk scores, advisor action items, meeting notes. |
| **D6** | AI Memory & Cache Store | Redis Cache Server | Conversation history buffers, AI prompt templates, session caches. |
