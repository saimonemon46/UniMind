from django.conf import settings
from django.db import models


class Grade(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="grades")
    course = models.ForeignKey("courses.Course", on_delete=models.CASCADE, related_name="grades")
    graded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="entered_grades")
    letter = models.CharField(max_length=4)
    points = models.DecimalField(max_digits=4, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["course__code", "student__last_name"]
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student} {self.letter} in {self.course}"
