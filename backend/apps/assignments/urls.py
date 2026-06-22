from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AssignmentViewSet, SubmissionViewSet

router = DefaultRouter()
router.register("assignments", AssignmentViewSet, basename="assignments")
router.register("submissions", SubmissionViewSet, basename="submissions")

urlpatterns = [path("", include(router.urls))]
