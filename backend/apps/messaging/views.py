from rest_framework import decorators, response

from apps.accounts.permissions import IsAdmin, IsAdminOrFaculty, IsAdminOrAdvisor
from apps.departments.views import AlmaModelViewSet

from .serializers import AnnouncementSerializer, NotificationSerializer
from .services import AnnouncementService, NotificationService


class NotificationViewSet(AlmaModelViewSet):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return NotificationService.queryset_for(self.request.user)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return super().get_permissions()

    @decorators.action(detail=True, methods=["patch"])
    def read(self, request, pk=None):
        notification = NotificationService.mark_read(self.get_object())
        return response.Response({"data": self.get_serializer(notification).data, "message": "Notification marked read.", "success": True})


class AnnouncementViewSet(AlmaModelViewSet):
    serializer_class = AnnouncementSerializer

    def get_queryset(self):
        return AnnouncementService.queryset_for(self.request.user)

    def perform_create(self, serializer):
        AnnouncementService.create(serializer, self.request.user)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminOrFaculty()]
        return super().get_permissions()
