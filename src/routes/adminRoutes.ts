import express from 'express';
import {query} from '../database';

// list the jobs 
const router = express.Router();
router.get('/jobs', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  try {
    const result = await query(`
        SELECT * FROM jobs 
        ORDER BY scheduled_time DESC LIMIT $1 OFFSET $2`, [limit, offset]
    );
    res.json({ page, limit, data: result.rows });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Error fetching jobs' });
  }
});

// retry failed jobs manually
router.post('/jobs/:id/retry', async (req, res) => {
  const jobId = req.params.id;
  try {
    // Reset the job status to 'waiting' and reset its retry counter.
    await query(`
        UPDATE jobs 
        SET status = 'waiting', retries = 0, updated_at = NOW() 
        WHERE id = $1`, [jobId]
    );
    res.json({ message: `Job ${jobId} is set to retry.` });
  } catch (error) {
    console.error(`Error retrying job ${jobId}:`, error);
    res.status(500).json({ error: 'Error retrying job' });
  }
});

// cancel pending jobs
router.post('/jobs/:id/cancel', async (req, res) => {
  const jobId = req.params.id;
  try {
    // Mark the job as 'failed' to indicate it's canceled. might want to include another option for status...
    await query(
      `UPDATE jobs SET status = 'failed', updated_at = NOW() WHERE id = $1`,
      [jobId]
    );
    res.json({ message: `Job ${jobId} has been canceled.` });
  } catch (error) {
    console.error(`Error canceling job ${jobId}:`, error);
    res.status(500).json({ error: 'Error canceling job' });
  }
});

export default router;
