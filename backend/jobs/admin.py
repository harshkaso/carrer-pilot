from django.contrib import admin  # type: ignore

# Register your models here.
from .models import JobApplication, JobPosting


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ("title", "company", "url")  # data fields to show in admin


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("job_posting", "status", "created_at", "updated_at")
    list_filter = ("status",)  # allow filtering entries by status
