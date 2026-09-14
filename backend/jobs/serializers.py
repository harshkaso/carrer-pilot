from rest_framework import serializers  # type: ignore
from .models import Application, Job


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            "id",  # Django automatically adds a primary-key field `id` in the model if you haven't define one yourself.
            "title",
            "company",
            "url",
            "description",
        ]

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")

    def validate_company(self, value):
        if not value.strip():
            raise serializers.ValidationError("Company cannot be empty.")


class ApplicationSerializer(serializers.ModelSerializer):
    Job = JobSerializer(read_only=True)

    class Meta:
        model = Application
        fields = [
            "id",
            "job",
            "status",
            "created_at",
            "updated_at",
        ]
