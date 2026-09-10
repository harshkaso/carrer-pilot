export type JobStatus =
  | "saved"
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

export interface Job {
  id: number;
  title: string;
  company: string;
  url: string;
  description: string;
}

export interface Application {
  id: number;
  job: Job;
  status: JobStatus;
  created_at: string;
  updated_at: string;
}