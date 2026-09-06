export interface JobPosting {
  id: number;
  title: string;
  company: string;
  url: string;
  description: string;
}

export interface JobApplication {
  id: number;
  job_posting: JobPosting;
  status: string;
  created_at: string;
  updated_at: string;
}