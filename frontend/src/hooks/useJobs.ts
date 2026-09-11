import { useCallback, useEffect, useState } from "react";
import { 
    createJob, 
    getJobs, 
    updateJob as updateJobApi,
    deleteJob as deleteJobApi,
    type CreateJobInput 
} from "../api/jobs";
import type { Job } from "../types/jobs";

export function useJobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadJobs = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getJobs();
            setJobs(data);
        } catch {
            setError("Unable to load jobs.");
        } finally {
            setLoading(false);
        }
    }, []);

    const addJob = useCallback(async (job: CreateJobInput) => {
        const createdJob = await createJob(job);

        setJobs((currentJobs) => [
            ...currentJobs,
            createdJob,
        ]);
        return createdJob;
    }, []);

    const updateJob = useCallback(async (id: number, updates: Partial<CreateJobInput>): Promise<Job> => {
        const updatedJob = await updateJobApi(id, updates);

        setJobs((currentJobs) => 
            currentJobs.map((job) => 
                job.id === id ? updatedJob : job
            )
        )
        return updatedJob;
    }, []);

    const deleteJob = useCallback(async (id: number): Promise<void> => {
        await deleteJobApi(id);

        setJobs((currentJobs) => 
            currentJobs.filter((job) => job.id !== id)
        );
    }, []);

    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    return {
        jobs,
        loading,
        error,
        addJob,
        updateJob,
        deleteJob,
        reload: loadJobs,
    }
}
