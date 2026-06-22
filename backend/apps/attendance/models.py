from django.conf import settings
from django.db import models


class AttendanceRecord(models.Model):
    class Status(models.TextChoices):
        PRESENT = "present", "Present"
        ABSENT = "absent", "Absent"
        LATE = "late", "Late"
        EXCUSED = "excused", "Excused"

    course = models.ForeignKey("courses.Course", on_delete=models.CASCADE, related_name="attendance_records")
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="attendance_records")
    marked_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="marked_attendance")
    class_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-class_date", "course__code", "student__last_name"]
        unique_together = ("course", "student", "class_date")

    def __str__(self):
        return f"{self.student} {self.status} for {self.course} on {self.class_date}"
