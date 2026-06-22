from decimal import Decimal

from .models import Grade


class GradeService:
    @staticmethod
    def queryset_for(user):
        qs = Grade.objects.select_related("student", "course", "course__faculty", "graded_by")
        if user.role == "admin":
            return qs
        if user.role == "faculty":
            return qs.filter(course__faculty=user)
        if user.role == "student":
            return qs.filter(student=user)
        if user.role == "advisor":
            return qs.none()
        return qs.none()

    @staticmethod
    def save(serializer, user):
        return serializer.save(graded_by=user)

    @staticmethod
    def student_grades(user, student_id):
        qs = GradeService.queryset_for(user)
        if user.role == "student":
            student_id = user.id
        return qs.filter(student_id=student_id)

    @staticmethod
    def gpa_for(user, student_id):
        grades = GradeService.student_grades(user, student_id)
        total_quality_points = Decimal("0")
        total_credits = Decimal("0")
        for grade in grades:
            credits = Decimal(grade.course.credits)
            total_quality_points += Decimal(grade.points) * credits
            total_credits += credits
        gpa = total_quality_points / total_credits if total_credits else Decimal("0")
        return {"student_id": int(student_id), "credits_attempted": float(total_credits), "gpa": round(float(gpa), 2)}

    @staticmethod
    def transcript_for(user, student_id):
        grades = GradeService.student_grades(user, student_id).select_related("course", "course__semester")
        return {
            "student_id": int(student_id),
            "gpa": GradeService.gpa_for(user, student_id)["gpa"],
            "courses": [
                {
                    "course_code": grade.course.code,
                    "course_title": grade.course.title,
                    "semester": grade.course.semester.name,
                    "credits": float(grade.course.credits),
                    "letter": grade.letter,
                    "points": float(grade.points),
                }
                for grade in grades
            ],
        }
