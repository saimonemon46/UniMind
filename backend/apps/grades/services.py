from decimal import Decimal
from rest_framework.exceptions import PermissionDenied

from .models import Grade


class GradeService:
    @staticmethod
    def queryset_for(user):
        qs = Grade.objects.select_related("student", "course", "course__faculty", "graded_by")
        if user.role == "admin": return qs
        if user.role == "faculty": return qs.filter(course__faculty=user)
        if user.role == "student": return qs.filter(student=user)
        return qs.none()

    @staticmethod
    def save(serializer, user):
        course = serializer.validated_data.get("course", getattr(serializer.instance, "course", None))
        if user.role == "faculty" and course and course.faculty_id != user.id:
            raise PermissionDenied("Faculty can enter grades only for assigned courses.")
        return serializer.save(graded_by=user)

    @staticmethod
    def student_grades(user, student_id):
        if user.role == "student": student_id = user.id
        return GradeService.queryset_for(user).filter(student_id=student_id)

    @staticmethod
    def gpa_for(user, student_id):
        grades = GradeService.student_grades(user, student_id)
        total_quality_points, total_credits = Decimal("0"), Decimal("0")
        for grade in grades:
            credits = Decimal(grade.course.credits)
            total_quality_points += Decimal(grade.points) * credits
            total_credits += credits
        gpa = total_quality_points / total_credits if total_credits else Decimal("0")
        return {"student_id": int(student_id), "credits_attempted": float(total_credits), "gpa": round(float(gpa), 2)}

    @staticmethod
    def transcript_for(user, student_id):
        grades = GradeService.student_grades(user, student_id).select_related("course", "course__semester")
        return {"student_id": int(student_id), "gpa": GradeService.gpa_for(user, student_id)["gpa"], "courses": [{"course_code": grade.course.code, "course_title": grade.course.title, "semester": grade.course.semester.name, "credits": float(grade.course.credits), "letter": grade.letter, "points": float(grade.points)} for grade in grades]}
