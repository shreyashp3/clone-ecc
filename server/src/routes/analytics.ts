import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, staffMiddleware } from '../utils/auth.js';
import crypto from 'crypto';

const router = Router();

// Helper function to get client IP
function getClientIp(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    (req.socket.remoteAddress || '');
}

// POST /api/page-views - Track page view
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      session_id,
      page_path,
      referrer,
      device_type,
      duration_seconds
    } = req.body;

    if (!page_path) {
      res.status(400).json({ error: 'page_path is required' });
      return;
    }

    const clientIp = getClientIp(req);
    const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex');

    const pageView = await prisma.pageView.create({
      data: {
        sessionId: session_id,
        pagePath: page_path,
        referrer: referrer || req.headers.referer,
        userAgent: req.headers['user-agent'],
        ipHash,
        deviceType: device_type,
        durationSeconds: duration_seconds
      }
    });

    res.status(201).json({
      success: true,
      pageViewId: pageView.id
    });
  } catch (error) {
    console.error('Page view tracking error:', error);
    res.status(500).json({ error: 'Failed to track page view' });
  }
});

// Protect all routes below
router.use(authMiddleware);
router.use(staffMiddleware);

// GET /api/page-views - Get analytics (admin only)
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page_path,
      start_date,
      end_date,
      page = '1',
      limit = '50'
    } = req.query;

    const where: any = {};

    if (page_path) {
      where.pagePath = page_path;
    }

    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) {
        where.createdAt.gte = new Date(start_date as string);
      }
      if (end_date) {
        where.createdAt.lte = new Date(end_date as string);
      }
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [pageViews, total] = await Promise.all([
      prisma.pageView.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.pageView.count({ where })
    ]);

    res.json({
      data: pageViews,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get page views error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/page-views/stats - Get analytics summary (admin only)
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalViews, uniqueSessions, topPages] = await Promise.all([
      prisma.pageView.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.pageView.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        distinct: ['sessionId'],
        select: {
          sessionId: true
        }
      }),
      prisma.pageView.groupBy({
        by: ['pagePath'],
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      })
    ]);

    res.json({
      period: 'last_30_days',
      totalViews,
      uniqueSessions: uniqueSessions.length,
      topPages: topPages.map(page => ({
        path: page.pagePath,
        views: page._count.id
      }))
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
