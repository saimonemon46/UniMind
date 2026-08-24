from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AssignmentViewSet, SubmissionViewSet, AttachmentUploadView

router = DefaultRouter()
router.register("assignments", AssignmentViewSet, basename="assignments")
router.register("submissions", SubmissionViewSet, basename="submissions")

urlpatterns = [
    path("assignments/upload-attachment/", AttachmentUploadView.as_view(), name="upload-attachment"),
    path("", include(router.urls)),
]
