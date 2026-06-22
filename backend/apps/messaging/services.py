from django.utils import timezone

from .models import Announcement, Notification


class NotificationService:
    @staticmethod
    def queryset_for(user):
        qs = Notification.objects.select_related("recipient")
        if user.role == "admin":
            return qs
        return qs.filter(recipient=user)

    @staticmethod
    def mark_read(notification):
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save(update_fields=["is_read", "read_at", "updated_at"])
        return notification


class AnnouncementService:
    @staticmethod
    def queryset_for(user):
        return Announcement.objects.select_related("created_by").filter(audience__in=[Announcement.Audience.ALL, user.role])

    @staticmethod
    def create(serializer, user):
        return serializer.save(created_by=user)
