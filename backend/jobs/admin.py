from django.contrib import admin  # type: ignore

# Register your models here.
from .models import Application, Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "company", "url")  # data fields to show in admin


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("job", "status", "created_at", "updated_at")
    list_filter = ("status",)  # allow filtering entries by status
