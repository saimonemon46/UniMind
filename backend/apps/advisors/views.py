from rest_framework import viewsets, permissions
from .models import InterventionPlan, CounselingLog
from .serializers import InterventionPlanSerializer, CounselingLogSerializer


class InterventionPlanViewSet(viewsets.ModelViewSet):
    queryset = InterventionPlan.objects.select_related("advisor", "student").all()
    serializer_class = InterventionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(advisor=self.request.user)


class CounselingLogViewSet(viewsets.ModelViewSet):
    queryset = CounselingLog.objects.select_related("advisor", "student").all()
    serializer_class = CounselingLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(advisor=self.request.user)
