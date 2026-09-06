import type { JobApplication, JobPosting } from "../types/jobs";

export async function getSavedApplications(): Promise<JobApplication[]> {
    const response = await fetch("/api/applications/?status=saved");
    if (!response.ok) {
        throw new Error("Failed to fetch saved applications");
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
    const response = await fetch("/api/job-postings/", {
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