from rest_framework import serializers

from .models import Assignment, Submission


class AssignmentSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source="course.code", read_only=True)
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)

    class Meta:
        model = Assignment
        fields = ["id", "course", "course_code", "title", "description", "due_at", "points", "created_by", "created_by_name", "created_at", "updated_at"]
        read_only_fields = ["created_by", "created_at", "updated_at"]


class SubmissionSerializer(serializers.ModelSerializer):
    assignment_title = serializers.CharField(source="assignment.title", read_only=True)
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)
    graded_by_name = serializers.CharField(source="graded_by.get_full_name", read_only=True)

    class Meta:
        model = Submission
        fields = ["id", "assignment", "assignment_title", "student", "student_name", "content", "file_url", "submitted_at", "status", "score", "feedback", "graded_by", "graded_by_name", "graded_at", "created_at", "updated_at"]
        read_only_fields = ["student", "submitted_at", "status", "score", "feedback", "graded_by", "graded_at", "created_at", "updated_at"]
