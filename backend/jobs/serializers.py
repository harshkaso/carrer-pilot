from rest_framework import serializers  # type: ignore
from .models import JobApplication, JobPosting


class JobPostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = [
            "id",  # Django automatically adds a primary-key field `id` in the model if you haven't define one yourself.
            "title",
            "company",
            "url",
            "description",
        ]


class JobApplicationSerializer(serializers.ModelSerializer):
    job_posting = JobPostingSerializer(read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "job_posting",
            "status",
            "created_at",
            "updated_at",
        ]
