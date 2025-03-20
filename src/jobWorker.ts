import {JobQueue} from './jobQueue';
import {query} from './database';
import {Job} from './models/job';
import {config} from './config';

export class JobWorker {
    private isRunning = false;
    private jobQueue: JobQueue;

    constructor(jobQueue: JobQueue) {
        this.jobQueue = jobQueue;
    }

    async processJob(job: Job): Promise<void> {
        try{
            await query(`
                UPDATE jobs 
                SET status = 'in-progress', updated_at = NOW() 
                WHERE id = $1`, [job.id]);
            console.log(`Processing job ${job.id}`);

            await new Promise((resolve) => setTimeout(resolve, 2000)); // this would be actual business logic, but I am simulating a delay here to mimic processing since it's a general project
            
            await query(`
                UPDATE jobs 
                SET status = 'completed', updated_at = NOW() 
                WHERE id = $1`, [job.id]);
            console.log(`Job ${job.id} completed`);
        } catch(e) {
            console.error(`Error processing job ${job.id} due to error. ${job.maxRetries} - ${job.retries} attempts remaining: \n`, e);
            if (job.maxRetries - job.retries == 0){
                await query(`
                    UPDATE jobs 
                    SET status = 'failed', updated_at = NOW()
                    WHERE id = $1`, [job.id])
            } else {
            await query(`
                UPDATE jobs SET retries = retries + 1, updated_at = NOW()
                WHERE id = $1`, [job.id]);
            }
        }
    }

    async start() {
        this.isRunning = true;
        while (this.isRunning) {
            const jobs = await this.jobQueue.fetchReadyJobs(config.worker.concurrency);
            if(jobs.length === 0) {
                await new Promise(resolve => setTimeout(resolve, config.worker.pollInterval)); // wait for some poll interval to check again for more jobs
                continue;
            }

            await Promise.all(jobs.map(job => this.processJob(job))); // process all the fetched jobs concurrently 
        }
    }

    stop() {
        this.isRunning = false; //to stop polling for jobs
    }
}

