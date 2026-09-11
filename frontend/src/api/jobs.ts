
import type { Application, JobStatus, Job } from "../types/jobs";

export async function getApplications(): Promise<Application[]> {
    const response = await fetch("/api/applications/");

    if (!response.ok) {
        throw new Error("Failed to fetch applications");
    }

    return response.json();
}

export async function getFilteredApplications(
    status: JobStatus,
): Promise<Application[]> {
    const response = await fetch(
        `/api/applications/?status=${encodeURIComponent(status)}`,
    );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch filtered applications",
        );
    }

    return response.json();
}
export async function getJobs(): Promise<Job[]> {
    const response = await fetch("/api/jobs/");
    if (!response.ok) {
        throw new Error("Failed to fetch jobs")
    }
    return response.json();
}


export interface CreateJobInput {
    title: string;
    company: string;
    url: string;
    description: string;
}

export async function createJob(job: CreateJobInput): Promise<Job> {
    const response = await fetch("/api/jobs/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(job),
    });

    if (!response.ok) {
        throw new Error("Failed to create job");
    }

    return response.json();
}

export async function updateJob(id: number, updates: Partial<CreateJobInput>): Promise<Job> {
    const response = await fetch(`api/jobs/${id}/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updates),
    });

    if (!response.ok) {
        throw new Error("Failed to update job");
    }

    return response.json();
}

export async function deleteJob(id: number): Promise<void> {
    const response = await fetch(`/api/jobs/${id}/`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error("Failed to delete job");
    }
}