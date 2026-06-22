from rest_framework import serializers

from .models import AttendanceRecord


class AttendanceRecordSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source="course.code", read_only=True)
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)
    marked_by_name = serializers.CharField(source="marked_by.get_full_name", read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = ["id", "course", "course_code", "student", "student_name", "marked_by", "marked_by_name", "class_date", "status", "notes", "created_at", "updated_at"]
        read_only_fields = ["marked_by", "created_at", "updated_at"]
