import { useState } from "react";

import type { CreateJobInput } from "../api/jobs";
import type { Job } from "../types/jobs";

import { JobForm } from "./JobForm";

import "./JobCard.css";

interface JobCardProps {
    job: Job;
    onUpdate: (
        id: number,
        updates: Partial<CreateJobInput>,
    ) => Promise<Job>;
    onDelete: (id: number) => Promise<void>;
}

export function JobCard({
    job,
    onUpdate,
    onDelete,
}: JobCardProps) {
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function handleUpdate(
        values: CreateJobInput,
    ): Promise<Job> {
        const updates: Partial<CreateJobInput> = {};

        if (values.title !== job.title) {
            updates.title = values.title;
        }

        if (values.company !== job.company) {
            updates.company = values.company;
        }

        if (values.url !== job.url) {
            updates.url = values.url;
        }

        if (values.description !== job.description) {
            updates.description = values.description;
        }

        if (Object.keys(updates).length === 0) {
            setEditing(false);
            return job;
        }

        const updatedJob = await onUpdate(job.id, updates);

        setEditing(false);

        return updatedJob;
    }

    async function handleDelete() {
        const confirmed = window.confirm(
            `Delete "${job.title}" at ${job.company}?`,
        );

        if (!confirmed) {
            return;
        }

        setDeleting(true);

        try {
            await onDelete(job.id);
        } finally {
            setDeleting(false);
        }
    }

    if (editing) {
        return (
            <article className="job-card job-card--form">
                <JobForm
                    mode="edit"
                    initialValues={{
                        title: job.title,
                        company: job.company,
                        url: job.url,
                        description: job.description,
                    }}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditing(false)}
                />
            </article>
        );
    }

    return (
        <article className="job-card">
            <div className="job-card__content">
                <div className="job-card__header">
                    <div>
                        <h2>{job.title}</h2>

                        <p className="job-card__company">
                            {job.company}
                        </p>
                    </div>
                </div>

                <p className="job-card__description">
                    {job.description}
                </p>

                <a
                    className="job-card__link"
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                >
                    View job posting
                </a>
            </div>

            <div className="job-card__actions">
                <button
                    type="button"
                    className="button button--secondary"
                    onClick={() => setEditing(true)}
                >
                    Edit
                </button>

                <button
                    type="button"
                    className="button button--danger"
                    onClick={handleDelete}
                    disabled={deleting}
                >
                    {deleting ? "Deleting..." : "Delete"}
                </button>
            </div>
        </article>
    );
}