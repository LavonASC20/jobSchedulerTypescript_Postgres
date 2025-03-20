# jobSchedulerTypescript_Postgres
 Concurrent, multi-attempt job scheduler 

run by typing `npx ts-node src/index.ts` into the terminal. Navigate to `localhost:3000` and then go to `http://localhost:3000/admin/jobs
` to see jobs scheduled

if an error due to the data not being read occurs, fix this by reading in the data explicitly to postgres: `createdb job_queue` followed by `psql -U postgres -d job_queue -f create_jobs_table.sql` creates the database, and then run as above.

Stopping job processing is done using `SIGINT` (ctrl + c)

running locally in terminal can be done via `npx ts-node scripts/demo.ts`
