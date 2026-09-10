import { useEffect, useState } from "react";
import { getJobs } from "../api/jobs";
import type { JobPosting } from "../types/jobs";

export function JobsPage() {
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);  

    useEffect(() => {
        async function loadJobs() {
            try {
                const data = await getJobs();
                setJobs(data);
            } catch {
                setError("Unable to load jobs");
            } finally {
                setLoading(false);
            }
        }

        loadJobs();
    }, []);

    if (loading) {
        return <p>Loading jobs ...</p>;
    }

    if (error) {
        return <p>{error}</p>
    }

    return (
        <section>
            <h1>Jobs</h1>
            {jobs.length === 0 ? (
                <p>No jobs have been added yet.</p>
            ) : (
                <ul>
                    {jobs.map((job) => (
                        <li key={job.id}>
                            <h2>{job.title}</h2>
                            <p>{job.company}</p>
                            <a
                                href={job.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                View job posting
                            </a>
                            <p>{job.description}</p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}