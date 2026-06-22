from rest_framework import decorators, response, viewsets

from apps.accounts.permissions import IsAdmin, IsAdminOrFaculty
from apps.departments.views import AlmaModelViewSet
from apps.accounts.serializers import UserSerializer

from .models import Course
from .serializers import CourseSerializer, EnrollmentSerializer
from .services import CourseService, EnrollmentService


class CourseViewSet(AlmaModelViewSet):
    serializer_class = CourseSerializer

    def get_queryset(self):
        return CourseService.queryset_for(self.request.user)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return super().get_permissions()

    @decorators.action(detail=True, methods=["get"])
    def students(self, request, pk=None):
        enrollments = CourseService.students(self.get_object())
        users = [enrollment.student for enrollment in enrollments]
        return response.Response({"data": UserSerializer(users, many=True).data, "message": "Course students loaded.", "success": True})

    @decorators.action(detail=True, methods=["get"])
    def analytics(self, request, pk=None):
        return response.Response({"data": CourseService.analytics(self.get_object()), "message": "Course analytics loaded.", "success": True})


class EnrollmentViewSet(AlmaModelViewSet):
    serializer_class = EnrollmentSerializer

    def get_queryset(self):
        return EnrollmentService.queryset_for(self.request.user)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminOrFaculty()]
        return super().get_permissions()
