// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  data_sharing_consent: boolean;
}

export interface UserRegister {
  name: string;
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Job Types
export enum JobStatus {
  SAVED = "saved",
  APPLIED = "applied",
  INTERVIEWING = "interviewing",
  OFFER = "offer",
  REJECTED = "rejected",
  WITHDRAWN = "withdrawn"
}

export interface Job {
  id: number;
  user_id: number;
  company_name: string;
  position: string;
  job_description?: string;
  job_url?: string;
  location?: string;
  salary_range?: string;
  status: JobStatus;
  applied_date?: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface JobCreate {
  company_name: string;
  position: string;
  job_description?: string;
  job_url?: string;
  location?: string;
  salary_range?: string;
  status?: JobStatus;
  applied_date?: string;
  deadline?: string;
  notes?: string;
}

export interface JobUpdate {
  company_name?: string;
  position?: string;
  job_description?: string;
  job_url?: string;
  location?: string;
  salary_range?: string;
  status?: JobStatus;
  applied_date?: string;
  deadline?: string;
  notes?: string;
}

export interface CoverLetter {
  id: number;
  user_id: number;
  job_id: number | null;
  title: string;
  content: string;
  tone: string;
  created_at: string;
  updated_at: string;
}