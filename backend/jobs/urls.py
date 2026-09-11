from django.urls import path  # type: ignore
from .views import ApplicationListView, JobListView, JobDetailView

urlpatterns = [
    path(
        "jobs/",  # route
        JobListView.as_view(),  # view
        name="job-list-create",
    ),
    path(
        "jobs/<int:pk>/",  # /<integer:primary_key>
        JobDetailView.as_view(),
        name="job-detail",
    ),
    path(
        "applications/",
        ApplicationListView.as_view(),
        name="job-application-list",
    ),
]
