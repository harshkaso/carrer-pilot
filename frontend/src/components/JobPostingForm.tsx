import { useState, type SubmitEvent } from "react";
import { createJobPosting } from "../api/jobs";

export function JobPostingForm() {
    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");

    const [message, setMessage] = useState<string | null>(null);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        try {
            const jobPosting = await createJobPosting({
                title,
                company,
                url,
                description,
            });
            setMessage(`Created ${jobPosting.title}`);
            // reset form data after submiting 
            setTitle("");
            setCompany("");
            setUrl("");
            setDescription("");
        } catch {
            setMessage("Unable to create job posting.");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add Job Posting</h2>

            <div>
                <label htmlFor="title">Title</label>
                <input id="title" value={title} onChange={(event) => setTitle(event.target.value)} required/>
            </div>
            <div>
                <label htmlFor="company">Company</label>
                <input id="company" value={company} onChange={(event) => setCompany(event.target.value)} required/>
            </div>
            <div>
                <label htmlFor="url">URL</label>
                <input id="url" value={url} onChange={(event) => setUrl(event.target.value)} required/>
            </div>
            <div>
                <label htmlFor="description">Description</label>
                <textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} required/>
            </div>
            <button type="submit">Add Job</button>

            {message && <p>{message}</p>}
        </form>
    );
}