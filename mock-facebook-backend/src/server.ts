import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { postsRouter } from './routes/posts';
import { reactionsRouter } from './routes/reactions';
import { commentsRouter } from './routes/comments';
import { debugRouter } from './routes/debug';
import { prisma } from './prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration supporting Vite dev server, frontend, and browser extension origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Check against explicit local origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Chrome extension origins (chrome-extension://<extension_id>)
      if (origin.startsWith('chrome-extension://') || origin.startsWith('moz-extension://')) {
        return callback(null, true);
      }

      // In development mode, permit all origins for easy plugin and tunnel testing
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

// Logging and parsing middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health check & API metadata
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'Mock Facebook REST API',
    status: 'online',
    version: '1.0.0',
    documentation: {
      feed: 'GET /api/posts',
      createPost: 'POST /api/posts',
      singlePost: 'GET /api/posts/:id',
      postReactions: 'POST /api/posts/:id/reactions',
      deleteReaction: 'DELETE /api/posts/:id/reactions',
      postComments: 'GET /api/posts/:id/comments',
      createComment: 'POST /api/posts/:id/comments',
      debugReset: 'POST /api/debug/reset',
      debugWebhooks: 'GET /api/debug/webhooks',
      debugUsers: 'GET /api/debug/users',
    },
    webhookSync: {
      targetUrl: process.env.THIRD_PARTY_API_URL || 'Not configured',
    },
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount modular sub-routers
app.use('/api/posts', postsRouter);
app.use('/api/posts/:id/reactions', reactionsRouter);
app.use('/api/posts/:id/comments', commentsRouter);
app.use('/api/debug', debugRouter);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]:', err);
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  res.status(500).json({ success: false, error: message });
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Mock Facebook REST API is running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`📡 Outbound Webhooks: ${process.env.THIRD_PARTY_API_URL || 'None'}`);
  console.log(`====================================================`);
});

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('[Server] Prisma disconnected. Process exiting.');
    process.exit(0);
  });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default app;
