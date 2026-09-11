import type { CreateJobInput } from "../api/jobs";
import type { Job } from "../types/jobs";

import { JobForm } from "./JobForm";

import "./JobCard.css";

interface AddJobCardProps {
    onSubmit: (values: CreateJobInput) => Promise<Job>;
    onCancel: () => void;
}

export function AddJobCard({
    onSubmit,
    onCancel,
}: AddJobCardProps) {
    return (
        <article className="job-card job-card--form">
            <JobForm
                mode="add"
                onSubmit={onSubmit}
                onCancel={onCancel}
            />
        </article>
    );
}