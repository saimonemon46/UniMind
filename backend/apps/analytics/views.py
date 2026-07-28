from collections import defaultdict
from datetime import date

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.models import CustomUser
from apps.advisors.models import InterventionPlan
from apps.assignments.models import Assignment, Submission
from apps.attendance.models import AttendanceRecord
from apps.courses.models import Course, Enrollment
from apps.departments.models import Department, Semester
from apps.grades.models import Grade
from apps.messaging.models import Notification
from apps.scheduling.models import ClassSchedule
from apps.students.models import StudentProfile


def attendance_rate(records):
    total = records.count()
    present = records.filter(status__in=["present", "late"]).count()
    return round((present / total) * 100, 2) if total else 0


def gpa_for(student):
    grades = Grade.objects.filter(student=student).select_related("course")
    credits = sum((grade.course.credits for grade in grades), start=0)
    quality_points = sum((grade.points * grade.course.credits for grade in grades), start=0)
    return round(float(quality_points / credits), 2) if credits else 0


def risk_for(student):
    attendance = attendance_rate(AttendanceRecord.objects.filter(student=student))
    gpa = gpa_for(student)
    missing = Assignment.objects.filter(course__enrollments__student=student, course__enrollments__status="active").exclude(submissions__student=student).count()
    if attendance < 70 or gpa < 2.0 or missing >= 3: return "high"
    if attendance < 80 or gpa < 2.5 or missing: return "medium"
    return "low"


def admin_dashboard():
    departments = []
    for department in Department.objects.all():
        students = CustomUser.objects.filter(role="student", department=department)
        records = AttendanceRecord.objects.filter(student__department=department)
        departments.append({"id": department.id, "name": department.name, "students": students.count(), "attendance_rate": attendance_rate(records), "courses": Course.objects.filter(department=department).count()})
    return {"role": "admin", "stats": {"students": CustomUser.objects.filter(role="student").count(), "faculty": CustomUser.objects.filter(role="faculty").count(), "courses": Course.objects.count(), "departments": Department.objects.count(), "enrollments": Enrollment.objects.filter(status="active").count()}, "active_semester": Semester.objects.filter(status="active").values("name", "code").first(), "departments": departments, "recent_users": list(CustomUser.objects.select_related("department").order_by("-date_joined")[:8].values("id", "username", "first_name", "last_name", "role", "department__name", "is_active"))}


def faculty_dashboard(user):
    courses = Course.objects.filter(faculty=user).prefetch_related("enrollments", "class_schedules")
    course_data = []
    for course in courses:
        enrollments = course.enrollments.filter(status="active")
        records = AttendanceRecord.objects.filter(course=course)
        course_data.append({"id": course.id, "code": course.code, "title": course.title, "enrolled": enrollments.count(), "attendance_rate": attendance_rate(records), "next_classes": list(course.class_schedules.values("day_of_week", "start_time", "end_time", "room__name"))})
    students = CustomUser.objects.filter(enrollments__course__faculty=user, enrollments__status="active").distinct()
    at_risk = [{"id": student.id, "name": student.get_full_name() or student.username, "attendance_rate": attendance_rate(AttendanceRecord.objects.filter(student=student, course__faculty=user)), "gpa": gpa_for(student), "risk": risk_for(student)} for student in students]
    return {"role": "faculty", "stats": {"courses": courses.count(), "students": students.count(), "attendance_rate": attendance_rate(AttendanceRecord.objects.filter(course__faculty=user)), "pending_submissions": Submission.objects.filter(assignment__course__faculty=user, status="submitted").count()}, "courses": course_data, "at_risk_students": sorted(at_risk, key=lambda item: {"high": 0, "medium": 1, "low": 2}[item["risk"]])}


def student_dashboard(user):
    enrollments = Enrollment.objects.filter(student=user, status="active").select_related("course")
    records = AttendanceRecord.objects.filter(student=user)
    profile = StudentProfile.objects.select_related("program", "advisor").filter(user=user).first()
    assignments = Assignment.objects.filter(course__enrollments__student=user, course__enrollments__status="active", due_at__gte=timezone.now()).select_related("course").order_by("due_at")[:8]
    assignment_data = [{"id": assignment.id, "title": assignment.title, "course": assignment.course.code, "due_at": assignment.due_at, "submission_status": Submission.objects.filter(assignment=assignment, student=user).values_list("status", flat=True).first()} for assignment in assignments]
    recommendations = []
    rate = attendance_rate(records)
    if rate < 75: recommendations.append({"kind": "attendance", "title": "Improve attendance", "detail": f"Your attendance is {rate}%. Attend the next scheduled classes to return above the 75% threshold."})
    missing = Assignment.objects.filter(course__enrollments__student=user, course__enrollments__status="active").exclude(submissions__student=user).count()
    if missing: recommendations.append({"kind": "assignment", "title": "Submit outstanding work", "detail": f"You have {missing} assignment(s) without a submission."})
    current_gpa = gpa_for(user)
    if current_gpa and current_gpa < 2.5: recommendations.append({"kind": "grade", "title": "Plan academic support", "detail": f"Your current GPA is {current_gpa}. Review feedback and speak with your advisor."})
    return {"role": "student", "profile": {"name": user.get_full_name() or user.username, "department": user.department.name if user.department else None, "program": profile.program.name if profile else None, "university_id": profile.university_id if profile else None, "advisor": profile.advisor.get_full_name() if profile and profile.advisor else None}, "stats": {"gpa": current_gpa, "credits": float(sum((item.course.credits for item in enrollments), start=0)), "attendance_rate": rate, "current_courses": enrollments.count(), "upcoming_assignments": len(assignment_data)}, "assignments": assignment_data, "recommendations": recommendations, "notifications": list(Notification.objects.filter(recipient=user).values("id", "title", "message", "kind", "is_read", "created_at")[:5])}


def advisor_dashboard(user):
    students = CustomUser.objects.filter(student_profile__advisor=user).select_related("student_profile", "student_profile__program")
    student_data = [{"id": student.id, "name": student.get_full_name() or student.username, "program": student.student_profile.program.name, "gpa": gpa_for(student), "attendance_rate": attendance_rate(AttendanceRecord.objects.filter(student=student)), "risk": risk_for(student)} for student in students]
    plans = InterventionPlan.objects.filter(advisor=user).select_related("student").values("id", "student__first_name", "student__last_name", "focus", "next_step", "status", "updated_at")[:10]
    return {"role": "advisor", "stats": {"assigned_students": students.count(), "high_risk": sum(1 for item in student_data if item["risk"] == "high"), "open_plans": InterventionPlan.objects.filter(advisor=user).exclude(status="closed").count(), "average_gpa": round(sum(item["gpa"] for item in student_data) / len(student_data), 2) if student_data else 0}, "students": sorted(student_data, key=lambda item: {"high": 0, "medium": 1, "low": 2}[item["risk"]]), "plans": list(plans)}


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard(request):
    handlers = {"admin": admin_dashboard, "faculty": lambda: faculty_dashboard(request.user), "student": lambda: student_dashboard(request.user), "advisor": lambda: advisor_dashboard(request.user)}
    return Response({"data": handlers[request.user.role](), "message": "Dashboard loaded.", "success": True})
