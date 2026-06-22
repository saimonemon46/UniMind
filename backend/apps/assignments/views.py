from rest_framework import decorators, response, status, viewsets
from rest_framework.exceptions import ValidationError

from apps.accounts.permissions import IsAdminOrFaculty, IsStudent
from apps.departments.views import AlmaModelViewSet

from .models import Assignment
from .serializers import AssignmentSerializer, SubmissionSerializer
from .services import AssignmentService, SubmissionService


class AssignmentViewSet(AlmaModelViewSet):
    serializer_class = AssignmentSerializer

    def get_queryset(self):
        return AssignmentService.queryset_for(self.request.user)

    def perform_create(self, serializer):
        AssignmentService.create(serializer, self.request.user)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminOrFaculty()]
        if self.action == "submit":
            return [IsStudent()]
        return super().get_permissions()

    @decorators.action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        submission = SubmissionService.submit(self.get_object(), request.user, request.data)
        return response.Response({"data": SubmissionSerializer(submission).data, "message": "Assignment submitted.", "success": True}, status=status.HTTP_201_CREATED)


class SubmissionViewSet(AlmaModelViewSet):
    serializer_class = SubmissionSerializer

    def get_queryset(self):
        return SubmissionService.queryset_for(self.request.user)

    @decorators.action(detail=True, methods=["patch"])
    def grade(self, request, pk=None):
        if request.user.role not in ["admin", "faculty"]:
            raise ValidationError({"message": "Only faculty or admins can grade submissions."})
        score = request.data.get("score")
        if score is None:
            raise ValidationError({"message": "Score is required."})
        submission = SubmissionService.grade(self.get_object(), request.user, score, request.data.get("feedback", ""))
        return response.Response({"data": self.get_serializer(submission).data, "message": "Submission graded.", "success": True})
