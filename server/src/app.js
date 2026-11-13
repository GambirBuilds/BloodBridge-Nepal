import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from './config/index.js';
import { errorHandler } from './middleware/index.js';
import { adminRouter } from './routes/adminRoutes.js';
import { authRouter } from './routes/authRoutes.js';
import { coordinationRouter } from './routes/coordinationRoutes.js';
import { donorRouter } from './routes/donorRoutes.js';
import { hospitalRouter } from './routes/hospitalRoutes.js';
import { locationRouter } from './routes/locationRoutes.js';
import { notificationRouter } from './routes/notificationRoutes.js';
import { reportRouter } from './routes/reportRoutes.js';
import { requestRouter } from './routes/requestRoutes.js';

export function createApp() {
  const app = express();

  // Security headers with Helmet (configured for AI Studio iFrame preview)
  app.use(helmet({
    contentSecurityPolicy: false, // Vite inline preview support
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    xFrameOptions: false,
  }));

  // CORS configuration
  app.use(cors({
    origin: true,
    credentials: true,
  }));

  // Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.rateLimit.authMaxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' },
  });

  // Body parsers
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'BLOODBRIDGE Nepal Backend API',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API Routers
  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api/donors', apiLimiter, donorRouter);
  app.use('/api/requests', apiLimiter, requestRouter);
  app.use('/api', apiLimiter, coordinationRouter);
  app.use('/api/hospitals', apiLimiter, hospitalRouter);
  app.use('/api/admin', apiLimiter, adminRouter);
  app.use('/api/notifications', apiLimiter, notificationRouter);
  app.use('/api/reports', apiLimiter, reportRouter);
  app.use('/api/locations', locationRouter);

  // Fallback 404 handler for API routes
  app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: `API endpoint ${req.method} ${req.originalUrl} not found.` });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
