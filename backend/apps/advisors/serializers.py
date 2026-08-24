from rest_framework import serializers
from .models import InterventionPlan, CounselingLog


class InterventionPlanSerializer(serializers.ModelSerializer):
    advisor_name = serializers.CharField(source="advisor.get_full_name", read_only=True)
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)

    class Meta:
        model = InterventionPlan
        fields = ["id", "advisor", "advisor_name", "student", "student_name", "focus", "next_step", "status", "created_at", "updated_at"]
        read_only_fields = ["advisor", "created_at", "updated_at"]


class CounselingLogSerializer(serializers.ModelSerializer):
    advisor_name = serializers.CharField(source="advisor.get_full_name", read_only=True)
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)

    class Meta:
        model = CounselingLog
        fields = ["id", "advisor", "advisor_name", "student", "student_name", "met_at", "notes", "follow_up_at", "created_at"]
        read_only_fields = ["advisor", "created_at"]
