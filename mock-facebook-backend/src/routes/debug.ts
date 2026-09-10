import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { seedDatabase } from '../seed';

export const debugRouter = Router();

/**
 * POST /api/debug/reset
 * Drops and reseeds the database with 10 rich mock posts, reactions, and comments
 */
debugRouter.post('/reset', async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log('[Debug API] Triggering full database reset and re-seed...');
    const stats = await seedDatabase();

    res.json({
      success: true,
      message: 'Database reset and re-seeded successfully',
      stats,
    });
  } catch (error) {
    console.error('Error during database reset:', error);
    res.status(500).json({ success: false, error: 'Failed to reset database' });
  }
});

/**
 * GET /api/debug/webhooks
 * Retrieves the latest outbound webhook event logs for auditing
 */
debugRouter.get('/webhooks', async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));

    const logs = await prisma.webhookLog.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
    });

    const formattedLogs = logs.map((log) => {
      let parsedPayload = log.payload;
      try {
        parsedPayload = JSON.parse(log.payload);
      } catch {
        // keep string
      }
      return {
        ...log,
        payload: parsedPayload,
      };
    });

    res.json({
      success: true,
      count: formattedLogs.length,
      data: formattedLogs,
    });
  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

/**
 * GET /api/debug/users
 * Returns list of mock users (helpful for tests and frontend clients)
 */
debugRouter.get('/users', async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
