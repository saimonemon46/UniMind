# UniMind (Alma UMS) — Swimlane Diagrams (Cross-Functional Flowcharts)

This document contains **Swimlane Diagrams** illustrating how different user roles (Student, Faculty, Advisor, Admin) and system microservices (Django REST API, FastAPI AI Analytics, PostgreSQL DB) interact seamlessly across organizational boundaries.

---

## 1. Swimlane Diagram 1: At-Risk Student Detection & Advisory Intervention Lifecycle

```mermaid
swimlane
    title Cross-Functional At-Risk Early Warning & Intervention Process

    actor Student
    actor Faculty
    actor AI Engine as FastAPI AI Agent
    actor Advisor
    actor System as UniMind Backend / DB

    Student: Misses consecutive classes OR Scores low on midterm exam
    Faculty: Enters Attendance status='ABSENT' OR Enters Grade 'F'
    
    System: Saves Attendance / Grade Record
    System: Enqueues Async Risk Evaluation Task

    AI Engine: Retrieves attendance %, submission history, & current CGPA
    AI Engine: Runs LangGraph Risk Agent with Groq LLM
    AI Engine: Flags Student Risk Level = HIGH (Score = 0.82)
    
    System: Updates StudentProfile.risk_level to HIGH
    System: Sends In-App Notification & Email Alert to Assigned Advisor

    Advisor: Receives High-Risk Alert on Advisor Dashboard
    Advisor: Reviews student risk drivers (Attendance dropping, Failed Exam)
    Advisor: Drafts Intervention Plan with target goals & counseling date

    Student: Receives Counseling Session Request & Intervention Notification
    Student: Attends Counseling Session with Advisor
    
    Advisor: Conducts counseling session
    Advisor: Logs meeting outcome & progress in CounselingLog
    Advisor: Updates InterventionPlan status to 'COMPLETED'

    System: Re-evaluates risk score after attendance improvement
    AI Engine: Recalculates Risk Level = LOW (Score = 0.25)
    System: Clears High-Risk Banner
```

---

## 2. Swimlane Diagram 2: Assessment Lifecycle, Submission, and Automated Evaluation

```mermaid
swimlane
    title Assessment Creation, Submission, and Grading Workflow

    actor Faculty
    actor Student
    actor AI Assistant as AI Service
    actor System DB as Django Backend DB

    Faculty: Creates Assignment with title, description, max_points, due_date
    System DB: Stores Assignment record & publishes notification to enrolled students

    Student: Views Assignment details on Student Portal
    Student: Submits solution file / write-up before due_date

    System DB: Stores Submission record with status='SUBMITTED'
    System DB: Triggers background AI grading suggestion task

    AI Assistant: Analyzes submission text against assignment rubric using Groq LLM
    AI Assistant: Generates recommended score & constructive feedback draft
    System DB: Stores preliminary AI feedback & suggested score

    Faculty: Opens Assignment Management page
    Faculty: Reviews student submission alongside AI feedback suggestion
    Faculty: Approves or adjusts final grade & clicks 'Publish Grade'

    System DB: Saves final Grade record
    System DB: Dispatches grade notification to Student

    Student: Receives notification & views final grade + feedback on dashboard
```
