from rest_framework import serializers

from .models import ClassSchedule, ExamSchedule, Room


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ["id", "code", "name", "building", "capacity", "is_active"]


class ClassScheduleSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source="course.code", read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)
    room_name = serializers.CharField(source="room.name", read_only=True)

    class Meta:
        model = ClassSchedule
        fields = ["id", "course", "course_code", "course_title", "room", "room_name", "day_of_week", "start_time", "end_time", "created_by"]
        read_only_fields = ["created_by"]

    def validate(self, attrs):
        if attrs["end_time"] <= attrs["start_time"]:
            raise serializers.ValidationError({"end_time": "End time must be after start time."})
        return attrs


class ExamScheduleSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source="course.code", read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)
    room_name = serializers.CharField(source="room.name", read_only=True)
    invigilator_names = serializers.SerializerMethodField()

    class Meta:
        model = ExamSchedule
        fields = ["id", "course", "course_code", "course_title", "room", "room_name", "title", "starts_at", "ends_at", "status", "invigilators", "invigilator_names", "created_by"]
        read_only_fields = ["created_by"]

    def get_invigilator_names(self, obj):
        return [user.get_full_name() or user.username for user in obj.invigilators.all()]

    def validate(self, attrs):
        if attrs["ends_at"] <= attrs["starts_at"]:
            raise serializers.ValidationError({"ends_at": "End time must be after start time."})
        return attrs
