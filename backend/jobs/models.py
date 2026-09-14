from django.contrib.auth.models import User  # type: ignore
from django.db import models  # type: ignore


class Job(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="jobs",
    )
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    url = models.URLField()
    description = models.TextField()

    def __str__(self) -> str:
        return f"{self.company} — {self.title}"


class Application(models.Model):
    class JobStatus(models.TextChoices):
        SAVED = "saved", "Saved"
        APPLIED = "applied", "Applied"
        INTERVIEW = "interview", "Interview"
        OFFER = "offer", "Offer"
        REJECTED = "rejected", "Rejected"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="applications",
    )

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,  # If a Job is deleted, delete its related Application records.
        related_name="applications",
    )

    status = models.CharField(
        max_length=20,
        choices=JobStatus.choices,
        default=JobStatus.SAVED,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.job} — {self.status}"
