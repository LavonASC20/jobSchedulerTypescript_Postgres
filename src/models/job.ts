export type JobStatus = 'waiting' | 'in-progress' | 'completed' | 'failed';

export interface Job {
    id?: number;
    payload: any;
    status: JobStatus;
    scheduledTime: Date;
    retries: number;
    maxRetries: number;
    createdAt?: Date;
    updatedAt?: Date;
}
