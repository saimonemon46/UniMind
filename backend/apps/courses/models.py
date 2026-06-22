from django.conf import settings
from django.db import models


class Course(models.Model):
    department = models.ForeignKey("departments.Department", on_delete=models.PROTECT, related_name="courses")
    program = models.ForeignKey("departments.Program", null=True, blank=True, on_delete=models.SET_NULL, related_name="courses")
    semester = models.ForeignKey("departments.Semester", on_delete=models.PROTECT, related_name="courses")
    faculty = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="teaching_courses")
    code = models.CharField(max_length=30, unique=True)
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    credits = models.DecimalField(max_digits=4, decimal_places=1)
    capacity = models.PositiveIntegerField(default=40)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} - {self.title}"


class Enrollment(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        DROPPED = "dropped", "Dropped"
        COMPLETED = "completed", "Completed"

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    enrolled_on = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["course__code", "student__last_name", "student__first_name"]
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student} in {self.course}"
