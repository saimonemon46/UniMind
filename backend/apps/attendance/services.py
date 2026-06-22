from django.db.models import Count, Q

from .models import AttendanceRecord


class AttendanceService:
    @staticmethod
    def queryset_for(user):
        qs = AttendanceRecord.objects.select_related("course", "student", "marked_by", "course__faculty")
        if user.role == "admin":
            return qs
        if user.role == "faculty":
            return qs.filter(course__faculty=user)
        if user.role == "student":
            return qs.filter(student=user)
        return qs.none()

    @staticmethod
    def mark(serializer, user):
        return serializer.save(marked_by=user)

    @staticmethod
    def student_records(user, student_id):
        qs = AttendanceService.queryset_for(user).filter(student_id=student_id)
        return qs

    @staticmethod
    def course_records(user, course_id):
        return AttendanceService.queryset_for(user).filter(course_id=course_id)

    @staticmethod
    def course_summary(user, course_id):
        records = AttendanceService.course_records(user, course_id)
        totals = records.values("status").annotate(count=Count("id")).order_by("status")
        total_count = records.count()
        present_count = records.filter(status__in=[AttendanceRecord.Status.PRESENT, AttendanceRecord.Status.LATE]).count()
        return {
            "course_id": course_id,
            "total_records": total_count,
            "present_or_late": present_count,
            "attendance_rate": round((present_count / total_count) * 100, 2) if total_count else 0,
            "by_status": list(totals),
        }
