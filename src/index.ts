import express from 'express';
import {config} from './config';
import adminRoutes from './routes/adminRoutes';
import {JobQueue} from './jobQueue';
import {JobWorker} from './jobWorker';
import pool from './database';

const app = express();
app.use(express.json());
app.use('/admin', adminRoutes);

// Start the HTTP server
const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

const jobQueue = new JobQueue();
const jobWorker = new JobWorker(jobQueue);
jobWorker.start();

// Graceful shutdown 
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  
  // Stop the job worker loop so no new jobs are picked up
  jobWorker.stop();
  setTimeout(() => {
    server.close(() => {
      console.log('HTTP server closed.');
      pool.end(() => {
        console.log('Database connection pool closed.');
        process.exit(0);
      });
    });
  }, 3000); // Wait for 3 seconds before shutting down
};

// Listen for termination signals to trigger graceful shutdown
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
