from django.conf import settings
from django.db import models


class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="student_profile")
    university_id = models.CharField(max_length=32, unique=True)
    program = models.ForeignKey("departments.Program", on_delete=models.PROTECT, related_name="students")
    advisor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="advised_students")
    enrollment_date = models.DateField()
    cgpa = models.DecimalField(max_digits=3, decimal_places=2, default=3.50)
    credits_completed = models.PositiveIntegerField(default=30)
    academic_standing = models.CharField(max_length=30, default="Good Standing")
    financial_hold = models.BooleanField(default=False)

    class Meta:
        ordering = ["university_id"]

    def __str__(self):
        return f"{self.university_id} - {self.user.get_full_name()}"
