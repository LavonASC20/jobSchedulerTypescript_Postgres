import {Pool} from 'pg';
import {config} from './config';

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export default pool;