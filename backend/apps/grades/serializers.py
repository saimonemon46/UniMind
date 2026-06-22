from rest_framework import serializers

from .models import Grade


class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)
    course_code = serializers.CharField(source="course.code", read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)
    credits = serializers.DecimalField(source="course.credits", max_digits=4, decimal_places=1, read_only=True)
    graded_by_name = serializers.CharField(source="graded_by.get_full_name", read_only=True)

    class Meta:
        model = Grade
        fields = ["id", "student", "student_name", "course", "course_code", "course_title", "credits", "graded_by", "graded_by_name", "letter", "points", "percentage", "remarks", "created_at", "updated_at"]
        read_only_fields = ["graded_by", "created_at", "updated_at"]
