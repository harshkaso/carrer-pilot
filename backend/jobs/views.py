# from django.shortcuts import render

from rest_framework import generics  # type: ignore
from .models import JobApplication, JobPosting
from .serializers import JobApplicationSerializer, JobPostingSerializer


# GET | POST /api/job
class JobListView(generics.ListCreateAPIView):
    # ListCreateAPIView provides the GET (list) and POST (create)
    # behavior, so we only need to configure the queryset and serializer.
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer


# GET | PATCH | DELETE /api/job/<id>/
class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer


# GET /api/applications/
class ApplicationListView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer

    def get_queryset(self):
        queryset = JobApplication.objects.select_related("job_posting")
        # Fetch the related JobPosting in the same database query to avoid
        # additional queries when the serializer accesses job_posting.
        status = self.request.query_params.get("status")
        if status:
            # If ?status= is provided, return only applications
            # matching that status.
            queryset = queryset.filter(status=status)
        return queryset
