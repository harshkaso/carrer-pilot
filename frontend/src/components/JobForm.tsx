import { useState, type SubmitEvent } from "react";

import type { CreateJobInput } from "../api/jobs";
import type { Job } from "../types/jobs";

import "./JobForm.css";

interface JobFormProps {
    mode: "add" | "edit";
    initialValues?: CreateJobInput;
    onSubmit: (values: CreateJobInput) => Promise<Job>;
    onCancel: () => void;
}

interface FormErrors {
    title?: string;
    company?: string;
    url?: string;
    description?: string;
    general?: string;
}

const EMPTY_VALUES: CreateJobInput = {
    title: "",
    company: "",
    url: "",
    description: "",
};

export function JobForm({
    mode,
    initialValues = EMPTY_VALUES,
    onSubmit,
    onCancel,
}: JobFormProps) {
    const [title, setTitle] = useState(initialValues.title);
    const [company, setCompany] = useState(initialValues.company);
    const [url, setUrl] = useState(initialValues.url);
    const [description, setDescription] = useState(
        initialValues.description,
    );

    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);

    const isEditing = mode === "edit";

    function validate(): FormErrors {
        const validationErrors: FormErrors = {};

        if (!title.trim()) {
            validationErrors.title = "Title is required.";
        }

        if (!company.trim()) {
            validationErrors.company = "Company is required.";
        }

        if (!url.trim()) {
            validationErrors.url = "URL is required.";
        }

        if (!description.trim()) {
            validationErrors.description =
                "Description is required.";
        }

        return validationErrors;
    }

    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (submitting) {
            return;
        }

        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setSubmitting(true);

        try {
            await onSubmit({
                title: title.trim(),
                company: company.trim(),
                url: url.trim(),
                description: description.trim(),
            });
        } catch {
            setErrors({
                general: isEditing
                    ? "Unable to update job."
                    : "Unable to create job.",
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className="job-form" onSubmit={handleSubmit}>
            <div className="job-form__header">
                <h2>
                    {isEditing ? "Edit Job" : "Add Job"}
                </h2>

                <button
                    type="button"
                    className="button button--ghost"
                    onClick={onCancel}
                    disabled={submitting}
                >
                    Cancel
                </button>
            </div>

            <div className="form-group">
                <label htmlFor="job-title">
                    Job title
                </label>

                <input
                    id="job-title"
                    value={title}
                    onChange={(event) =>
                        setTitle(event.target.value)
                    }
                    disabled={submitting}
                    aria-invalid={Boolean(errors.title)}
                />

                {errors.title && (
                    <p className="form-error">
                        {errors.title}
                    </p>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="job-company">
                    Company
                </label>

                <input
                    id="job-company"
                    value={company}
                    onChange={(event) =>
                        setCompany(event.target.value)
                    }
                    disabled={submitting}
                    aria-invalid={Boolean(errors.company)}
                />

                {errors.company && (
                    <p className="form-error">
                        {errors.company}
                    </p>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="job-url">
                    Job URL
                </label>

                <input
                    id="job-url"
                    type="url"
                    value={url}
                    onChange={(event) =>
                        setUrl(event.target.value)
                    }
                    disabled={submitting}
                    aria-invalid={Boolean(errors.url)}
                />

                {errors.url && (
                    <p className="form-error">
                        {errors.url}
                    </p>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="job-description">
                    Description
                </label>

                <textarea
                    id="job-description"
                    rows={6}
                    value={description}
                    onChange={(event) =>
                        setDescription(event.target.value)
                    }
                    disabled={submitting}
                    aria-invalid={Boolean(errors.description)}
                />

                {errors.description && (
                    <p className="form-error">
                        {errors.description}
                    </p>
                )}
            </div>

            {errors.general && (
                <p className="form-error">
                    {errors.general}
                </p>
            )}

            <button
                type="submit"
                className="button button--primary"
                disabled={submitting}
            >
                {submitting
                    ? isEditing
                        ? "Saving..."
                        : "Adding..."
                    : isEditing
                      ? "Save changes"
                      : "Add Job"}
            </button>
        </form>
    );
}