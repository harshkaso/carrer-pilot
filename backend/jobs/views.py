# from django.shortcuts import render

from rest_framework import generics  # type: ignore
from rest_framework.permissions import IsAuthenticated  # type: ignore
from rest_framework.exceptions import ValidationError
from .models import Application, Job
from .serializers import ApplicationSerializer, JobSerializer


# GET | POST /api/jobs/
class JobListView(generics.ListCreateAPIView):
    # ListCreateAPIView provides the GET (list) and POST (create)
    # behavior, so we only need to configure the queryset and serializer.
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Job.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# GET | PATCH | DELETE /api/jobs/<id>/
class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Job.objects.filter(user=self.request.user)


# GET /api/applications/
class ApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Application.objects.filter(user=self.request.user).select_related(
            "job"
        )
        # Fetch the related JobPosting in the same database query to avoid
        # additional queries when the serializer accesses job.
        status = self.request.query_params.get("status")
        if status:
            if status not in Application.JobStatus.values:
                raise ValidationError({"status": "Invalid application status."})
            # If ?status= is provided, return only applications
            # matching that status.
            queryset = queryset.filter(status=status)
        return queryset
