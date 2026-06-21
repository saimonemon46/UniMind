from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Alma profile", {"fields": ("role", "phone", "avatar_url", "department")}),
    )
    list_display = ("username", "email", "role", "department", "is_staff")
    list_filter = ("role", "department", "is_staff", "is_active")
