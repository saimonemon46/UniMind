from django.db.models import Q

from .models import ClassSchedule, ExamSchedule


class SchedulingService:
    @staticmethod
    def class_schedule_queryset(user):
        qs = ClassSchedule.objects.select_related("course", "room", "created_by", "course__faculty")
        if user.role == "admin":
            return qs
        if user.role == "faculty":
            return qs.filter(course__faculty=user)
        if user.role == "student":
            return qs.filter(course__enrollments__student=user, course__enrollments__status="active").distinct()
        return qs.none()

    @staticmethod
    def exam_schedule_queryset(user):
        qs = ExamSchedule.objects.select_related("course", "room", "created_by", "course__faculty").prefetch_related("invigilators")
        if user.role == "admin":
            return qs
        if user.role == "faculty":
            return qs.filter(Q(course__faculty=user) | Q(invigilators=user)).distinct()
        if user.role == "student":
            return qs.filter(course__enrollments__student=user, course__enrollments__status="active", status="published").distinct()
        return qs.none()
