import { useEffect, useState } from "react";
import { getSavedApplications } from "../api/jobs";
import type{ JobApplication } from "../types/jobs";

export function SavedApplicationsPage() {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadApplications() {
            try {
                const data = await getSavedApplications();
                setApplications(data);
            } catch {
                setError("Unable to load saved applications.");
            } finally {
                setLoading(false);
            }
        }

        loadApplications();
    }, []); // Runs once after the initial render

    if (loading) {
        return <p>Loading applications ...</p>
    }

    if (error) {
        return <p>{error}</p>
    }

    return (
        <section>
            <h1>Saved Applications</h1>
            {applications.length === 0 ? (
                <p>No Saved Applications.</p>
            ) : (
                <ul>
                    {applications.map((application) => (
                        <li key={application.id}>
                            <h2>{application.job_posting.title}</h2>
                            <p>{application.job_posting.company}</p>
                            <a href={application.job_posting.url} target="_blank" rel="noreferrer">View job posting</a>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}