export type JobStatus = 'queued' | 'running' | 'success' | 'failed';

const jobs = new Map<string, { status: JobStatus; result?: unknown }>();

export function setStatus(id: string, status: JobStatus, result?: unknown) {
  jobs.set(id, { status, result });
}

export function getStatus(id: string) {
  return jobs.get(id);
}
