from django.conf import settings
from django.db import models


class Room(models.Model):
    code = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=100)
    building = models.CharField(max_length=100, blank=True)
    capacity = models.PositiveIntegerField(default=30)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["building", "code"]

    def __str__(self):
        return self.code


class ClassSchedule(models.Model):
    class Day(models.TextChoices):
        MONDAY = "monday", "Monday"
        TUESDAY = "tuesday", "Tuesday"
        WEDNESDAY = "wednesday", "Wednesday"
        THURSDAY = "thursday", "Thursday"
        FRIDAY = "friday", "Friday"
        SATURDAY = "saturday", "Saturday"
        SUNDAY = "sunday", "Sunday"

    course = models.ForeignKey("courses.Course", on_delete=models.CASCADE, related_name="class_schedules")
    room = models.ForeignKey(Room, on_delete=models.PROTECT, related_name="class_schedules")
    day_of_week = models.CharField(max_length=12, choices=Day.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="created_class_schedules")

    class Meta:
        ordering = ["day_of_week", "start_time", "course__code"]
        constraints = [models.UniqueConstraint(fields=["course", "day_of_week", "start_time"], name="unique_course_class_slot")]

    def __str__(self):
        return f"{self.course.code} ? {self.day_of_week} {self.start_time}"


class ExamSchedule(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        COMPLETED = "completed", "Completed"

    course = models.ForeignKey("courses.Course", on_delete=models.CASCADE, related_name="exam_schedules")
    room = models.ForeignKey(Room, on_delete=models.PROTECT, related_name="exam_schedules")
    title = models.CharField(max_length=120)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    invigilators = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="invigilated_exams")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="created_exam_schedules")

    class Meta:
        ordering = ["starts_at", "course__code"]

    def __str__(self):
        return f"{self.course.code} ? {self.title}"
