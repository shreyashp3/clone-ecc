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

// Helper function to hash IP for rate limiting
function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

// Helper function to check rate limit
async function checkRateLimit(
  bucket: string,
  key: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);

  const count = await prisma.rateLimitEvent.count({
    where: {
      bucket,
      key,
      createdAt: {
        gte: windowStart
      }
    }
  });

  return count < maxAttempts;
}

// Helper function to record rate limit event
async function recordRateLimitEvent(bucket: string, key: string): Promise<void> {
  await prisma.rateLimitEvent.create({
    data: {
      bucket,
      key
    }
  });
}

// POST /api/leads - Submit a lead (form submission)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, company, message, interest, form_type, source_page, honeypot } = req.body;

    // Honeypot check (bot prevention)
    if (honeypot) {
      console.warn('Honeypot field filled - likely spam');
      res.status(400).json({ error: 'Invalid submission' });
      return;
    }

    // Validate required fields
    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Validate message length
    if (message && message.length > 4000) {
      res.status(400).json({ error: 'Message is too long (max 4000 characters)' });
      return;
    }

    // Rate limiting: 8 submissions per 30 minutes (1800 seconds) per IP
    const clientIp = getClientIp(req);
    const ipHash = hashIp(clientIp);
    const canSubmit = await checkRateLimit('leads', ipHash, 8, 1800);

    if (!canSubmit) {
      res.status(429).json({
        error: 'Too many submissions. Please try again later.',
        retryAfter: 1800
      });
      return;
    }

    // Record rate limit event
    await recordRateLimitEvent('leads', ipHash);

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        company: company?.trim(),
        message: message?.trim(),
        interest: interest?.trim(),
        formType: form_type || 'contact',
        sourcePage: source_page || req.headers.referer
      }
    });

    res.status(201).json({
      success: true,
      message: 'Lead submitted successfully',
      leadId: lead.id
    });
  } catch (error) {
    console.error('Lead submission error:', error);
    res.status(500).json({ error: 'Failed to submit lead' });
  }
});

// Protect all routes below
router.use(authMiddleware);
router.use(staffMiddleware);

// GET /api/leads - Get all leads (admin only)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20', q } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (q) {
      const term = String(q);
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { company: { contains: term, mode: 'insensitive' } }
      ];
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.lead.count({ where })
    ]);

    res.json({
      data: leads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// PATCH /api/leads/bulk - Bulk update leads (admin only)
router.patch('/bulk', async (req: Request, res: Response) => {
  try {
    const { ids, status, assigned_to } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'ids is required' });
      return;
    }

    await prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: {
        ...(status && { status }),
        ...(assigned_to !== undefined && { assignedTo: assigned_to })
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Bulk update leads error:', error);
    res.status(500).json({ error: 'Failed to update leads' });
  }
});

// DELETE /api/leads/bulk - Bulk delete leads (admin only)
router.delete('/bulk', async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'ids is required' });
      return;
    }

    await prisma.lead.deleteMany({
      where: { id: { in: ids } }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Bulk delete leads error:', error);
    res.status(500).json({ error: 'Failed to delete leads' });
  }
});

// GET /api/leads/:id - Get single lead (admin only)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    res.json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// PATCH /api/leads/:id - Update lead status (admin only)
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { status, notes, assigned_to } = req.body;

    const updated = await prisma.lead.update({
      where: {
        id: req.params.id
      },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(assigned_to !== undefined && { assignedTo: assigned_to })
      }
    });

    res.json({
      success: true,
      lead: updated
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// DELETE /api/leads/:id - Delete lead (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.lead.delete({
      where: {
        id: req.params.id
      }
    });

    res.json({
      success: true,
      message: 'Lead deleted'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});


// Cleanup old rate limit events (run periodically)
async function cleanupOldRateLimitEvents(): Promise<void> {
  try {
    const cutoffTime = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago

    await prisma.rateLimitEvent.deleteMany({
      where: {
        createdAt: {
          lt: cutoffTime
        }
      }
    });
  } catch (error) {
    console.error('Cleanup rate limit events error:', error);
  }
}

// Run cleanup every hour
setInterval(cleanupOldRateLimitEvents, 60 * 60 * 1000);

export default router;
