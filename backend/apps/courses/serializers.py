from rest_framework import serializers

from .models import Course, Enrollment


class CourseSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    program_name = serializers.CharField(source="program.name", read_only=True)
    semester_name = serializers.CharField(source="semester.name", read_only=True)
    faculty_name = serializers.CharField(source="faculty.get_full_name", read_only=True)

    class Meta:
        model = Course
        fields = ["id", "department", "department_name", "program", "program_name", "semester", "semester_name", "faculty", "faculty_name", "code", "title", "description", "credits", "capacity", "is_active", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)
    course_code = serializers.CharField(source="course.code", read_only=True)

    class Meta:
        model = Enrollment
        fields = ["id", "student", "student_name", "course", "course_code", "course_title", "status", "enrolled_on", "created_at", "updated_at"]
        read_only_fields = ["enrolled_on", "created_at", "updated_at"]
