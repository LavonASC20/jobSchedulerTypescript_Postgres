import {query} from '../src/database';
import {config} from '../src/config';
import {JobQueue} from '../src/jobQueue';
import {JobWorker} from '../src/jobWorker';
import pool from '../src/database';

async function insertJob(payload: any, scheduledTime: Date, maxRetries: number = 3): Promise<number> {
  const sql = `
    INSERT INTO jobs (payload, status, scheduled_time, retries, max_retries, created_at, updated_at)
    VALUES ($1, 'waiting', $2, 0, $3, NOW(), NOW())
    RETURNING id;
  `;
  const result = await query(sql, [payload, scheduledTime, maxRetries]);
  const id = result.rows[0].id;
  console.log(`Inserted job with id: ${id}`);
  return id;
}

async function runDemo() {
  console.log('Starting demo...');

  // Enqueue an immediate job.
  await insertJob({ task: 'Immediate Task' }, new Date());

  // Enqueue a job scheduled to run 5 seconds in the future.
  const futureTime = new Date(Date.now() + 5000);
  await insertJob({ task: 'Future Task' }, futureTime);

  const jobQueue = new JobQueue();
  const jobWorker = new JobWorker(jobQueue);
  jobWorker.start();

  // Let the demo run for 15 seconds before shutting down.
  setTimeout(() => {
    console.log('Stopping demo...');
    jobWorker.stop();
    setTimeout(() => {
      pool.end(() => {
        console.log('Database pool closed. Exiting demo.');
        process.exit(0);
      });
    }, 3000);
  }, 15000);
}

runDemo().catch((e) => {
  console.error('Demo encountered an error:', e);
  process.exit(1);
});