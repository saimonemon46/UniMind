from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import AttendanceRecord


@receiver(post_save, sender=AttendanceRecord)
def enqueue_attendance_risk_assessment(sender, instance, created, **kwargs):
    if not created or instance.status != AttendanceRecord.Status.ABSENT:
        return
    try:
        from apps.ai_bridge.tasks import trigger_risk_assessment
    except Exception:
        return
    trigger_risk_assessment.delay(instance.student_id)
