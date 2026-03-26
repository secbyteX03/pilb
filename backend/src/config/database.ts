import { Pool, PoolConfig } from 'pg';
import { env } from './environment';
import { logger } from '../utils/logger';

export class Database {
  private pool: Pool;

  constructor() {
    const config: PoolConfig = {
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    this.pool = new Pool(config);

    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
    });

    logger.info(`📦 Database connected: ${env.DB_NAME}@${env.DB_HOST}:${env.DB_PORT}`);
  }

  getPool(): Pool {
    return this.pool;
  }

  async query(text: string, params?: any[]) {
    const start = Date.now();
    const res = await this.pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
    return res;
  }

  async getClient() {
    return this.pool.connect();
  }

  async close() {
    await this.pool.end();
    logger.info('📦 Database connection closed');
  }
}

// Singleton instance
let database: Database | null = null;

export function getDatabase(): Database {
  if (!database) {
    database = new Database();
  }
  return database;
}