from rest_framework import decorators, response

from apps.accounts.permissions import IsAdminOrFaculty
from apps.departments.views import AlmaModelViewSet

from .serializers import AttendanceRecordSerializer
from .services import AttendanceService


class AttendanceRecordViewSet(AlmaModelViewSet):
    serializer_class = AttendanceRecordSerializer

    def get_queryset(self):
        return AttendanceService.queryset_for(self.request.user)

    def perform_create(self, serializer):
        AttendanceService.mark(serializer, self.request.user)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminOrFaculty()]
        return super().get_permissions()

    @decorators.action(detail=False, methods=["get"], url_path="student/(?P<student_id>[^/.]+)")
    def student(self, request, student_id=None):
        records = AttendanceService.student_records(request.user, student_id)
        return response.Response({"data": self.get_serializer(records, many=True).data, "message": "Student attendance loaded.", "success": True})

    @decorators.action(detail=False, methods=["get"], url_path="course/(?P<course_id>[^/.]+)")
    def course(self, request, course_id=None):
        records = AttendanceService.course_records(request.user, course_id)
        return response.Response({"data": self.get_serializer(records, many=True).data, "message": "Course attendance loaded.", "success": True})

    @decorators.action(detail=False, methods=["get"], url_path="course/(?P<course_id>[^/.]+)/summary")
    def course_summary(self, request, course_id=None):
        return response.Response({"data": AttendanceService.course_summary(request.user, course_id), "message": "Course attendance summary loaded.", "success": True})
