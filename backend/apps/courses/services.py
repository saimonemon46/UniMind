from django.db.models import Count

from .models import Course, Enrollment


class CourseService:
    @staticmethod
    def queryset_for(user):
        qs = Course.objects.select_related("department", "program", "semester", "faculty").prefetch_related("enrollments__student")
        if user.role == "admin":
            return qs
        if user.role == "faculty":
            return qs.filter(faculty=user)
        if user.role == "student":
            return qs.filter(enrollments__student=user, enrollments__status=Enrollment.Status.ACTIVE).distinct()
        return qs.none()

    @staticmethod
    def students(course):
        return course.enrollments.select_related("student").filter(status=Enrollment.Status.ACTIVE)

    @staticmethod
    def analytics(course):
        return {
            "course_id": course.id,
            "course_code": course.code,
            "enrolled_students": course.enrollments.filter(status=Enrollment.Status.ACTIVE).count(),
            "assignment_count": getattr(course, "assignments", []).count() if hasattr(course, "assignments") else 0,
        }


class EnrollmentService:
    @staticmethod
    def queryset_for(user):
        qs = Enrollment.objects.select_related("student", "course", "course__faculty", "course__semester")
        if user.role == "admin":
            return qs
        if user.role == "faculty":
            return qs.filter(course__faculty=user)
        if user.role == "student":
            return qs.filter(student=user)
        return qs.none()
