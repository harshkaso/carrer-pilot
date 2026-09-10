from django.urls import path  # type: ignore
from .views import JobApplicationListView, JobListCreateView, JobDetailView

urlpatterns = [
    path(
        "jobs/",  # route
        JobListCreateView.as_view(),  # view
        name="job-list-create",
    ),
    path(
        "jobs/<int:pk>/",  # /<integer:primary_key>
        JobDetailView.as_view(),
        name="job-detail",
    ),
    path(
        "applications/",
        JobApplicationListView.as_view(),
        name="job-application-list",
    ),
]
