import {query} from './database';
import {Job} from './models/job';

export class JobQueue {
   async fetchReadyJobs(limit: number): Promise<Job[]> {
    const sql = `
    SELECT *
    FROM jobs
    WHERE status = 'waiting' 
        AND scheduled_time <= NOW()
    ORDER BY scheduled_time ASC
    LIMIT $1
    FOR UPDATE SKIP LOCKED`; //final line avoids retrying queued jobs (concurrency)

    const result = await query(sql, [limit]);

    return result.rows;
   }
}