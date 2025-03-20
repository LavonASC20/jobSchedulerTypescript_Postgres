CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  payload JSON NOT NULL,
  status VARCHAR(20) NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  retries INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
