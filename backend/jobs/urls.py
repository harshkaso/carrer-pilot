from django.urls import path  # type: ignore
from .views import JobApplicationListView, JobPostingListCreateView

urlpatterns = [
    path(
        "job-postings/",  # route
        JobPostingListCreateView.as_view(),  # view
        name="job-posting-list-create",
    ),
    path(
        "applications/",
        JobApplicationListView.as_view(),
        name="job-application-list",
    ),
]
