from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DepartmentViewSet, ProgramViewSet, SemesterViewSet

router = DefaultRouter()
router.register("departments", DepartmentViewSet, basename="departments")
router.register("programs", ProgramViewSet, basename="programs")
router.register("semesters", SemesterViewSet, basename="semesters")

urlpatterns = [path("", include(router.urls))]
