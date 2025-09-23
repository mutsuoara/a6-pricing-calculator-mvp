/**
 * Configuration and environment types
 */
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
    pool: {
        min: number;
        max: number;
        acquireTimeoutMillis: number;
        createTimeoutMillis: number;
        destroyTimeoutMillis: number;
        idleTimeoutMillis: number;
        reapIntervalMillis: number;
        createRetryIntervalMillis: number;
    };
}
export interface AuthConfig {
    googleClientId: string;
    googleClientSecret: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshTokenExpiresIn: string;
    domainRestriction: string;
}
export interface SecurityConfig {
    corsOrigin: string | string[];
    rateLimitWindowMs: number;
    rateLimitMax: number;
    helmetConfig: {
        contentSecurityPolicy: boolean;
        hsts: boolean;
    };
}
export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db: number;
    retryDelayOnFailover: number;
    maxRetriesPerRequest: number;
}
export interface AppConfig {
    nodeEnv: 'development' | 'staging' | 'production';
    port: number;
    apiVersion: string;
    baseUrl: string;
    database: DatabaseConfig;
    auth: AuthConfig;
    security: SecurityConfig;
    redis: RedisConfig;
    logging: {
        level: 'error' | 'warn' | 'info' | 'debug';
        format: 'json' | 'simple';
    };
}
export interface EnvironmentVariables {
    NODE_ENV: string;
    PORT: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    JWT_SECRET: string;
    CORS_ORIGIN: string;
    RATE_LIMIT_WINDOW_MS: string;
    RATE_LIMIT_MAX: string;
}
//# sourceMappingURL=config.d.ts.map