from rest_framework import serializers

from .models import Department, Program, Semester


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name", "code", "description", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class ProgramSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = Program
        fields = ["id", "department", "department_name", "name", "code", "degree_level", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = ["id", "name", "code", "starts_on", "ends_on", "status", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]
