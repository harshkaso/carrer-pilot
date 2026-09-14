
import type { Application, JobStatus, Job } from "../types/jobs";
import { apiFetch } from "./client";

export async function getApplications(
    token: string,
    status?: JobStatus,
): Promise<Application[]> {
    const url = status
        ? `/api/applications/?status=${encodeURIComponent(status)}`
        : "/api/applications/";

    const response = await apiFetch(url,token);

    if (!response.ok) {
        throw new Error("Failed to fetch applications");
    }

    return response.json();
}

export async function getJobs(token: string,): Promise<Job[]> {
    const response = await apiFetch("/api/jobs/",token);
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

export async function createJob(token: string, job: CreateJobInput,): Promise<Job> {
    const response = await apiFetch("/api/jobs/", token, {
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

export async function updateJob(token: string, id: number, updates: Partial<CreateJobInput>): Promise<Job> {
    const response = await apiFetch(`api/jobs/${id}/`,token, {
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

export async function deleteJob(token: string, id: number): Promise<void> {
    const response = await apiFetch(`/api/jobs/${id}/`, token, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error("Failed to delete job");
    }
}