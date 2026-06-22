from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Grade


@receiver(post_save, sender=Grade)
def enqueue_grade_risk_assessment(sender, instance, **kwargs):
    try:
        from apps.ai_bridge.tasks import trigger_risk_assessment
    except Exception:
        return
    trigger_risk_assessment.delay(instance.student_id)
