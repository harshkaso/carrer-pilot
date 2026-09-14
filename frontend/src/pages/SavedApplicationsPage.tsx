import { useEffect, useState } from "react";
import { getApplications } from "../api/jobs";
import type{ Application } from "../types/jobs";

export function SavedApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadApplications() {
            try {
                const data = await getApplications();
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
                            <h2>{application.job.title}</h2>
                            <p>{application.job.company}</p>
                            <a href={application.job.url} target="_blank" rel="noreferrer">View job posting</a>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}