import type { Application, Job } from "../types/jobs";

export async function getSavedApplications(): Promise<Application[]> {
    const response = await fetch("/api/applications/?status=saved");
    if (!response.ok) {
        throw new Error("Failed to fetch saved applications");
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


export interface CreateJobPostingInput {
    title: string;
    company: string;
    url: string;
    description: string;
}

export async function createJobPosting(jobPosting: CreateJobPostingInput): Promise<JobPosting> {
    const response = await fetch("/api/jobs/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(jobPosting),
    });

    if (!response.ok) {
        throw new Error("Failed to create job posting");
    }

    return response.json();
}