/**
 * Database configuration and connection setup
 */

import { Sequelize } from 'sequelize';
import { DatabaseConfig } from '@pricing-calculator/types';

export class DatabaseService {
  private static instance: DatabaseService;
  private sequelize: Sequelize;

  private constructor() {
    this.sequelize = this.createConnection();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private createConnection(): Sequelize {
    const config: DatabaseConfig = {
      host: process.env['DB_HOST'] || 'localhost',
      port: parseInt(process.env['DB_PORT'] || '5432'),
      database: process.env['DB_NAME'] || 'pricing_calculator',
      username: process.env['DB_USER'] || 'postgres',
      password: process.env['DB_PASSWORD'] || 'password',
      ssl: process.env['DB_SSL'] === 'true',
      pool: {
        min: 0,
        max: 10,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 100
      }
    };

    const sequelize = new Sequelize(
      process.env['DATABASE_URL'] || 
      `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`,
      {
        dialect: 'postgres',
        logging: process.env['NODE_ENV'] === 'development' ? console.log : false,
        pool: config.pool,
        dialectOptions: {
          ssl: config.ssl ? {
            require: true,
            rejectUnauthorized: false
          } : false
        },
        define: {
          timestamps: true,
          underscored: false, // Use camelCase field names
          paranoid: true, // Enable soft deletes
          createdAt: 'createdAt',
          updatedAt: 'updatedAt',
          deletedAt: 'deletedAt'
        }
      }
    );

    return sequelize;
  }

  public getSequelize(): Sequelize {
    return this.sequelize;
  }

  public async connect(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      console.log('✅ Database connection established successfully');
    } catch (error) {
      console.error('❌ Unable to connect to the database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.sequelize.close();
      console.log('✅ Database connection closed');
    } catch (error) {
      console.error('❌ Error closing database connection:', error);
      throw error;
    }
  }

  public async sync(force: boolean = false): Promise<void> {
    try {
      await this.sequelize.sync({ force });
      console.log('✅ Database synchronized successfully');
    } catch (error) {
      console.error('❌ Error synchronizing database:', error);
      throw error;
    }
  }
}

// Export sequelize instance for direct use in models
export const sequelize = DatabaseService.getInstance().getSequelize();
