from rest_framework import serializers
from .models import StudentProfile
from apps.accounts.serializers import UserSerializer


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    program_name = serializers.CharField(source="program.name", read_only=True)
    department_name = serializers.CharField(source="program.department.name", read_only=True)
    advisor_name = serializers.CharField(source="advisor.get_full_name", read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "id", "user", "university_id", "program", "program_name",
            "department_name", "advisor", "advisor_name", "enrollment_date",
            "cgpa", "credits_completed", "academic_standing", "financial_hold"
        ]
