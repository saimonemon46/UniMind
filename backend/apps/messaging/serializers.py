from rest_framework import serializers

from .models import Announcement, Notification


class NotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source="recipient.get_full_name", read_only=True)

    class Meta:
        model = Notification
        fields = ["id", "recipient", "recipient_name", "title", "message", "kind", "is_read", "read_at", "created_at", "updated_at"]
        read_only_fields = ["recipient", "is_read", "read_at", "created_at", "updated_at"]


class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)

    class Meta:
        model = Announcement
        fields = ["id", "title", "body", "audience", "created_by", "created_by_name", "published_at", "created_at", "updated_at"]
        read_only_fields = ["created_by", "published_at", "created_at", "updated_at"]
