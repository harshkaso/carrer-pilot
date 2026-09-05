from django.db import models  # type: ignore


class JobPosting(models.Model):
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    url = models.URLField()
    description = models.TextField()

    def __str__(self) -> str:
        return f"{self.company} — {self.title}"


class JobApplication(models.Model):
    class Status(models.TextChoices):
        SAVED = "saved", "Saved"
        APPLIED = "applied", "Applied"
        INTERVIEW = "interview", "Interview"
        OFFER = "offer", "Offer"
        REJECTED = "rejected", "Rejected"

    job_posting = models.ForeignKey(
        JobPosting,
        on_delete=models.CASCADE,  # If I delete Job application to a job positing, it will delete the job posting as well.
        related_name="applications",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SAVED,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.job_posting} — {self.status}"
