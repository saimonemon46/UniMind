from rest_framework import decorators, response

from apps.accounts.permissions import IsAdminOrFaculty
from apps.departments.views import AlmaModelViewSet

from .serializers import GradeSerializer
from .services import GradeService


class GradeViewSet(AlmaModelViewSet):
    serializer_class = GradeSerializer

    def get_queryset(self):
        return GradeService.queryset_for(self.request.user)

    def perform_create(self, serializer):
        GradeService.save(serializer, self.request.user)

    def perform_update(self, serializer):
        GradeService.save(serializer, self.request.user)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminOrFaculty()]
        return super().get_permissions()

    @decorators.action(detail=False, methods=["get"], url_path="student/(?P<student_id>[^/.]+)")
    def student(self, request, student_id=None):
        grades = GradeService.student_grades(request.user, student_id)
        return response.Response({"data": self.get_serializer(grades, many=True).data, "message": "Student grades loaded.", "success": True})

    @decorators.action(detail=False, methods=["get"], url_path="student/(?P<student_id>[^/.]+)/gpa")
    def gpa(self, request, student_id=None):
        return response.Response({"data": GradeService.gpa_for(request.user, student_id), "message": "Student GPA calculated.", "success": True})

    @decorators.action(detail=False, methods=["get"], url_path="student/(?P<student_id>[^/.]+)/transcript")
    def transcript(self, request, student_id=None):
        return response.Response({"data": GradeService.transcript_for(request.user, student_id), "message": "Student transcript loaded.", "success": True})
