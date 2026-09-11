import { useState } from "react";
import { AddJobCard } from "../components/AddJobCard";
import { JobCard } from "../components/JobCard";
import { useJobs } from "../hooks/useJobs";
import type { CreateJobInput } from "../api/jobs";

import "./JobsPage.css";

export function JobsPage() {
    const {
        jobs,
        loading,
        error,
        addJob,
        updateJob,
        deleteJob,
    } = useJobs();

    const [adding, setAdding] = useState(false);

    async function handleAddJob(values: CreateJobInput) {
        const createdJob = await addJob(values);

        setAdding(false);

        return createdJob;
    }

    function handleCancelAdd() {
        setAdding(false);
    }

    if (loading) {
        return (
            <main className="jobs-page">
                <div className="jobs-loading">
                    Loading jobs...
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="jobs-page">
                <div className="jobs-error">
                    {error}
                </div>
            </main>
        );
    }

    return (
        <main className="jobs-page">
            <header className="dashboard-header">
                <div>
                    <p className="dashboard-eyebrow">
                        CareerPilot
                    </p>

                    <h1>Job Dashboard</h1>

                    <p className="dashboard-description">
                        Track and manage the jobs you are
                        considering for your career search.
                    </p>
                </div>

                <div className="job-count">
                    <strong>{jobs.length}</strong>
                    <span>
                        {jobs.length === 1 ? "Job" : "Jobs"}
                    </span>
                </div>
            </header>

            <section className="jobs-section">
                <div className="section-header">
                    <div>
                        <h2>Your jobs</h2>

                        <p>
                            {jobs.length === 0
                                ? "No jobs saved yet."
                                : `${jobs.length} saved ${
                                      jobs.length === 1
                                          ? "job"
                                          : "jobs"
                                  }`}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="button button--primary add-job-button"
                        onClick={() => setAdding(true)}
                        disabled={adding}
                    >
                        <span
                            className="add-job-button__icon"
                            aria-hidden="true"
                        >
                            +
                        </span>

                        Add Job
                    </button>
                </div>

                <div className="jobs-list">
                    {adding && (
                        <AddJobCard
                            onSubmit={handleAddJob}
                            onCancel={handleCancelAdd}
                        />
                    )}

                    {jobs.map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onUpdate={updateJob}
                            onDelete={deleteJob}
                        />
                    ))}
                </div>

                {jobs.length === 0 && !adding && (
                    <div className="empty-state">
                        <h3>No jobs yet</h3>

                        <p>
                            Add your first job posting to start
                            building your CareerPilot workspace.
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}