# UniMind (Alma UMS) — Activity Diagrams

This document outlines the operational **Activity Diagrams** for the key business workflows in the **UniMind (Alma UMS)** system.

---

## 1. Activity Diagram 1: Academic Early Warning & Intervention Process

```mermaid
flowchart TD
    Start([Start: Periodic Risk Evaluation Triggered]) --> FetchData[Fetch Student Telemetry: Attendance, Submissions, Grades]
    FetchData --> InvokeAI[Invoke FastAPI AI Risk Agent]
    InvokeAI --> CalculateScore[Calculate At-Risk Score: 0.0 - 1.0]

    CalculateScore --> RiskCheck{Risk Level?}
    
    RiskCheck -- Score < 0.40 --> LowRisk[Mark Student as LOW Risk]
    LowRisk --> StandardReport[Log standard academic progress record]
    StandardReport --> EndRoutine([End Workflow])

    RiskCheck -- 0.40 <= Score < 0.70 --> MedRisk[Mark Student as MEDIUM Risk]
    MedRisk --> GenRecommend[AI Engine Generates Study Recommendations]
    GenRecommend --> SendStudAlert[Send In-App Advisory Tip to Student]
    SendStudAlert --> NotifyAdvMed[Notify Assigned Advisor: Monitor Mode]
    NotifyAdvMed --> EndRoutine

    RiskCheck -- Score >= 0.70 --> HighRisk[Mark Student as HIGH Risk]
    HighRisk --> TriggerUrgent[Trigger High-Risk Early Warning Alert]
    TriggerUrgent --> NotifyAdvHigh[Send Urgent Notification to Academic Advisor]
    NotifyAdvHigh --> DraftPlan[Advisor Drafts Intervention Plan]
    DraftPlan --> ScheduleCounseling[Schedule Counseling Session with Student]
    ScheduleCounseling --> ExecuteIntervention[Execute & Log Counseling Notes in System]
    ExecuteIntervention --> CompletePlan[Mark Intervention Plan Status: COMPLETED]
    CompletePlan --> EndRoutine
```

---

## 2. Activity Diagram 2: Faculty Attendance Marking & Grade Submission Workflow

```mermaid
flowchart TD
    Start([Start: Faculty Accesses Portal]) --> SelectCourse[Select Assigned Course & Schedule Session]
    SelectCourse --> ActionType{Select Action}
    
    ActionType -- Mark Attendance --> FetchRoster[System Fetches Enrolled Student Roster]
    FetchRoster --> DisplayAttendanceUI[Render Interactive Attendance Sheet]
    DisplayAttendanceUI --> InputAttendance[Faculty Marks Status: Present / Absent / Late / Excused]
    InputAttendance --> SubmitAttendance[Click 'Save Attendance']
    SubmitAttendance --> ValidateAttData{Valid Data?}
    ValidateAttData -- No --> ShowAttError[Display Validation Error] --> InputAttendance
    ValidateAttData -- Yes --> PersistAtt[Persist AttendanceRecords in PostgreSQL]
    PersistAtt --> UpdateAttStats[Update Aggregated Course Attendance Metrics]
    UpdateAttStats --> EndAtt([Attendance Workflow Complete])

    ActionType -- Submit Grades --> SelectAssessment[Select Assessment Category: Quiz / Midterm / Assignment]
    SelectAssessment --> DisplayGradeUI[Render Grade Input Table]
    DisplayGradeUI --> EnterScores[Faculty Enters Scores per Student]
    EnterScores --> SubmitGrades[Click 'Publish Grades']
    SubmitGrades --> ValidateGrades{Scores <= Max Points?}
    ValidateGrades -- No --> ShowGradeError[Display 'Score exceeds max points'] --> EnterScores
    ValidateGrades -- Yes --> PersistGrades[Save AssessmentGrade / Grade Records]
    PersistGrades --> TriggerRiskEval[Trigger Async Risk Evaluation for Low Scorers]
    TriggerRiskEval --> SendGradeNotify[Send Grade Notifications to Students]
    SendGradeNotify --> EndGrade([Grade Workflow Complete])
```

---

## 3. Activity Diagram 3: Student Course Registration Workflow

```mermaid
flowchart TD
    Start([Start: Student Initiates Course Registration]) --> OpenCatalog[Browse Available Courses for Active Semester]
    OpenCatalog --> SelectCourse[Select Course to Add]
    SelectCourse --> CheckPrereq{Prerequisites Satisfied?}
    
    CheckPrereq -- No --> PrereqErr[Display Warning: Missing Prerequisite]
    PrereqErr --> OpenCatalog

    CheckPrereq -- Yes --> CheckCapacity{Class Seat Available?}
    CheckCapacity -- No --> CapErr[Display Notice: Section Full / Waitlist]
    CapErr --> OpenCatalog

    CheckCapacity -- Yes --> CheckScheduleConflict{Time Conflict with Enrolled Class?}
    CheckScheduleConflict -- Yes --> ConflictErr[Display Error: Room/Schedule Overlap]
    ConflictErr --> OpenCatalog

    CheckScheduleConflict -- No --> CreateEnrollment[Create Enrollment record status='ACTIVE']
    CreateEnrollment --> UpdateCredits[Update Student Total Registered Credits]
    UpdateCredits --> DisplaySchedule[Refresh Personal Class Timetable]
    DisplaySchedule --> ConfirmReg([Registration Complete])
```
