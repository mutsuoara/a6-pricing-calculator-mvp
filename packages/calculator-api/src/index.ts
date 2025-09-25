/**
 * Main API server entry point
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import passport from 'passport';
import session from 'express-session';
import dotenv from 'dotenv';
import { ModelManager } from './models';
import { MigrationRunner } from './migrations/migrate';
import { AuthService } from './services/auth.service';
import authRoutes from './routes/auth.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_MAX'] || '100', 10), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter as any);

// CORS configuration
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}) as any);

// Session configuration for OAuth
app.use(session({
  secret: process.env['JWT_SECRET'] || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env['NODE_ENV'] === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}) as any);

// Initialize Passport
app.use(passport.initialize() as any);
app.use(passport.session() as any);

// Body parsing with size limits
app.use(express.json({ 
  limit: '10mb',
  verify: (_req, _res, buf) => {
    // Basic JSON validation
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      // JSON is invalid, but we'll let express handle it
      return;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request validation middleware
app.use((_req, _res, next) => {
  // Log all requests for audit purposes
  console.log(`${new Date().toISOString()} - ${_req.method} ${_req.path} - IP: ${_req.ip}`);
  next();
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request entity too large' });
  }

  return res.status(500).json({
    error: 'Internal server error',
    ...(process.env['NODE_ENV'] === 'development' && { details: err.message })
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env['API_VERSION'] || 'v1'
  });
});

// API routes
app.get('/api', (_req, res) => {
  res.json({
    message: 'Pricing Calculator API',
    version: process.env['API_VERSION'] || 'v1',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      projects: '/api/projects (coming soon)',
      calculations: '/api/calculations (coming soon)'
    }
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: ['/health', '/api']
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔄 Starting server...');

    // Initialize database
    console.log('🔄 Initializing database...');
    await MigrationRunner.initialize();
    await MigrationRunner.runMigrations();
    await ModelManager.initializeModels();
    console.log('✅ Database initialization completed');

    // Initialize authentication
    console.log('🔄 Initializing authentication...');
    AuthService.initializePassport();
    console.log('✅ Authentication initialized');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Pricing Calculator API running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env['NODE_ENV'] || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`🗄️  Database: Connected and ready`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await ModelManager.closeConnection();
  await MigrationRunner.close();
  process.exit(0);
});

// Start the server
startServer();

export default app;
