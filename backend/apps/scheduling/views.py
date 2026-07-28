from apps.accounts.permissions import IsAdmin
from apps.departments.views import AlmaModelViewSet

from .models import ClassSchedule, ExamSchedule, Room
from .serializers import ClassScheduleSerializer, ExamScheduleSerializer, RoomSerializer
from .services import SchedulingService


class AdminWriteViewSet(AlmaModelViewSet):
    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return super().get_permissions()


class RoomViewSet(AdminWriteViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class ClassScheduleViewSet(AdminWriteViewSet):
    serializer_class = ClassScheduleSerializer

    def get_queryset(self):
        return SchedulingService.class_schedule_queryset(self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ExamScheduleViewSet(AdminWriteViewSet):
    serializer_class = ExamScheduleSerializer

    def get_queryset(self):
        return SchedulingService.exam_schedule_queryset(self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
