from rest_framework import viewsets

from apps.accounts.permissions import IsAdmin

from .serializers import DepartmentSerializer, ProgramSerializer, SemesterSerializer
from .services import DepartmentService, ProgramService, SemesterService


class AlmaModelViewSet(viewsets.ModelViewSet):
    def finalize_response(self, request, response, *args, **kwargs):
        if 200 <= response.status_code < 300 and isinstance(response.data, (dict, list)):
            if not (isinstance(response.data, dict) and {"data", "message", "success"} <= set(response.data)):
                response.data = {"data": response.data, "message": "Request completed.", "success": True}
        return super().finalize_response(request, response, *args, **kwargs)


class DepartmentViewSet(AlmaModelViewSet):
    serializer_class = DepartmentSerializer

    def get_queryset(self):
        return DepartmentService.queryset()

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return super().get_permissions()


class ProgramViewSet(AlmaModelViewSet):
    serializer_class = ProgramSerializer

    def get_queryset(self):
        return ProgramService.queryset()

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return super().get_permissions()


class SemesterViewSet(AlmaModelViewSet):
    serializer_class = SemesterSerializer

    def get_queryset(self):
        return SemesterService.queryset()

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return super().get_permissions()
