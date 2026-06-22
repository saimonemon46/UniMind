from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/", include("apps.accounts.user_urls")),
    path("api/v1/", include("apps.departments.urls")),
    path("api/v1/", include("apps.courses.urls")),
    path("api/v1/", include("apps.attendance.urls")),
    path("api/v1/", include("apps.assignments.urls")),
    path("api/v1/", include("apps.grades.urls")),
    path("api/v1/", include("apps.messaging.urls")),
]
