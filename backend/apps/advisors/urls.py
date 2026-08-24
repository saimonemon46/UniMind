from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InterventionPlanViewSet, CounselingLogViewSet

router = DefaultRouter()
router.register(r"advisors/interventions", InterventionPlanViewSet, basename="advisor-interventions")
router.register(r"advisors/logs", CounselingLogViewSet, basename="advisor-logs")

urlpatterns = [
    path("", include(router.urls)),
]
