import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import crypto from 'crypto';
import { authMiddleware, staffMiddleware } from '../utils/auth.js';

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

const normalizeText = (text: string) => text.toLowerCase();
const containsAny = (text: string, keywords: string[]) => keywords.some((k) => text.includes(k));
const truncate = (text: string, max = 140) => {
  if (!text) return '';
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}...`;
};

async function buildAssistantReply(message: string) {
  const text = normalizeText(message || '');
  const wantsProducts = containsAny(text, ['product', 'platform', 'saas', 'ai cloud insights', 'gpu', 'ticketly']);
  const wantsServices = containsAny(text, ['service', 'consulting', 'aws', 'azure', 'devops', 'managed', 'cloud']);
  const wantsPricing = containsAny(text, ['price', 'pricing', 'cost', 'budget', 'quote']);
  const wantsDemo = containsAny(text, ['demo', 'meeting', 'call', 'schedule']);
  const wantsCaseStudies = containsAny(text, ['case study', 'case studies', 'success story', 'client story']);
  const wantsCareers = containsAny(text, ['career', 'job', 'hiring', 'apply', 'opening']);
  const wantsSupport = containsAny(text, ['support', 'help', 'issue', 'ticket']);

  const fallbackOverview = !wantsProducts && !wantsServices && !wantsPricing && !wantsDemo && !wantsCaseStudies && !wantsCareers && !wantsSupport;
  const sections: string[] = [];

  if (wantsProducts || fallbackOverview) {
    const products = await prisma.product.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' }
    });

    if (products.length > 0) {
      const productLines = products.slice(0, 3).map((p) => {
        const summary = truncate(p.description || p.tagline || '');
        const link = p.externalUrl ? ` (${p.externalUrl})` : '';
        return `- **${p.name}** - ${summary}${link}`;
      });
      sections.push(['**Products we offer:**', ...productLines].join('\n'));
    }
  }

  if (wantsServices || fallbackOverview) {
    const services = await prisma.service.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' }
    });

    if (services.length > 0) {
      const grouped = new Map<string, { title: string; description: string }[]>();
      services.forEach((s) => {
        const bucket = grouped.get(s.categoryName) || [];
        bucket.push({ title: s.title, description: s.description || '' });
        grouped.set(s.categoryName, bucket);
      });

      const serviceLines: string[] = [];
      Array.from(grouped.entries()).slice(0, 3).forEach(([category, items]) => {
        const sample = items[0];
        const summary = truncate(sample?.description || '');
        serviceLines.push(`- **${category}** - ${sample?.title}${summary ? `: ${summary}` : ''}`);
      });

      if (serviceLines.length > 0) {
        sections.push(['**Services we deliver:**', ...serviceLines].join('\n'));
      }
    }
  }

  if (wantsCaseStudies) {
    const caseStudies = await prisma.caseStudy.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      take: 3
    });
    if (caseStudies.length > 0) {
      const lines = caseStudies.map((c) => `- **${c.title}** - ${truncate(c.problem || c.solution || '')}`);
      sections.push(['**Recent case studies:**', ...lines].join('\n'));
    } else {
      sections.push('We can share relevant case studies on request. Tell me your industry and goal.');
    }
  }

  if (wantsCareers) {
    const roles = await prisma.career.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      take: 3
    });
    if (roles.length > 0) {
      const lines = roles.map((r) => `- **${r.title}** - ${truncate(r.location || r.department || '')}`);
      sections.push(['**Open roles:**', ...lines].join('\n'));
    } else {
      sections.push('We do not have open roles listed right now, but you can share your resume at info@ecctechnologies.ai.');
    }
  }

  if (wantsPricing) {
    sections.push('**Pricing:** We offer flexible pricing based on scope and usage. Share your requirements and timeline, and we can provide a tailored quote.');
  }

  if (wantsDemo) {
    sections.push('**Demo:** We can schedule a product demo. Please share your preferred time and contact email.');
  }

  if (wantsSupport) {
    sections.push('**Support:** If this is a support issue, please describe the problem and urgency. We can route it to the right team.');
  }

  if (sections.length === 0) {
    sections.push('Tell me a bit about your goal (cost optimization, modernization, security, or AI/ML enablement), and I will recommend the best path.');
  }

  return sections.join('\n\n');
}

async function getLatestVisitorMessage(conversationId: string) {
  const latest = await prisma.chatMessage.findFirst({
    where: { conversationId, senderType: 'visitor' },
    orderBy: { createdAt: 'desc' }
  });
  return latest?.content || '';
}

// POST /api/chat - Start or continue chat
router.post('/', async (req: Request, res: Response) => {
  try {
    const { action, session_id, visitor_name, visitor_email, message, conversation_id } = req.body;
    const clientIp = getClientIp(req);
    const ipHash = hashIp(clientIp);

    if (action === 'start_chat') {
      // Rate limiting: 5 chat starts per 10 minutes per IP
      const canStart = await checkRateLimit('chat_start', ipHash, 5, 600);
      if (!canStart) {
        res.status(429).json({
          error: 'Too many chat sessions started. Please try again later.',
          retryAfter: 600
        });
        return;
      }

      // Start new conversation
      const newSession = session_id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const conversation = await prisma.chatConversation.create({
        data: {
          visitorName: visitor_name,
          visitorEmail: visitor_email,
          sessionId: newSession,
          status: 'open'
        }
      });

      const welcomeMessage = await prisma.chatMessage.create({
        data: {
          conversationId: conversation.id,
          senderType: 'ai',
          content: 'Thanks for reaching out! A support agent will be with you shortly.'
        }
      });

      // Record rate limit event
      await recordRateLimitEvent('chat_start', ipHash);

      res.json({
        success: true,
        conversation_id: conversation.id,
        session_id: newSession,
        status: 'open',
        welcome_message: welcomeMessage
      });
    } else if (action === 'send_message') {
      // Rate limiting: 30 messages per 10 minutes per IP
      const canSend = await checkRateLimit('chat_message', ipHash, 30, 600);
      if (!canSend) {
        res.status(429).json({
          error: 'Too many messages. Please try again later.',
          retryAfter: 600
        });
        return;
      }

      // Send message and get response

      if (!conversation_id || !message) {
        res.status(400).json({ error: 'conversation_id and message are required' });
        return;
      }

      // Get conversation
      const conversation = await prisma.chatConversation.findUnique({
        where: {
          id: conversation_id
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      });

      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      // Record rate limit event
      await recordRateLimitEvent('chat_message', ipHash);

      // Save visitor message
      const visitorMessage = await prisma.chatMessage.create({
        data: {
          conversationId: conversation_id,
          senderType: 'visitor',
          content: message
        }
      });

      const assistantContent = await buildAssistantReply(message);

      // AI reply
      const replyMessage = await prisma.chatMessage.create({
        data: {
          conversationId: conversation_id,
          senderType: 'ai',
          content: assistantContent
        }
      });

      // Get updated messages
      const updatedConversation = await prisma.chatConversation.findUnique({
        where: {
          id: conversation_id
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      });

      res.json({
        success: true,
        conversation_id,
        messages: updatedConversation?.messages || [],
        visitor_message: visitorMessage,
        reply_message: replyMessage,
        message: 'Message received. A support agent will respond shortly.'
      });
    } else if (action === 'fetch_messages') {
      // Get conversation history

      if (!conversation_id) {
        res.status(400).json({ error: 'conversation_id is required' });
        return;
      }

      const conversation = await prisma.chatConversation.findUnique({
        where: {
          id: conversation_id
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      });

      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      res.json({
        success: true,
        conversation_id,
        messages: conversation.messages,
        status: conversation.status
      });
    } else {
      res.status(400).json({ error: 'Invalid action. Use: start_chat, send_message, or fetch_messages' });
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat operation failed' });
  }
});

// Protect admin-only routes below
router.use(authMiddleware);
router.use(staffMiddleware);

// GET /api/chat - List conversations (admin only)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, limit = '50' } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const conversations = await prisma.chatConversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: parseInt(limit as string, 10) || 50
    });

    res.json(conversations);
  } catch (error) {
    console.error('List conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// POST /api/chat/messages - Add admin message
router.post('/messages', async (req: Request, res: Response) => {
  try {
    const { conversationId, message } = req.body;
    if (!conversationId || !message) {
      res.status(400).json({ error: 'conversationId and message are required' });
      return;
    }

    const msg = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderType: 'agent',
        content: message
      }
    });

    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { status: 'assigned' }
    });

    res.status(201).json(msg);
  } catch (error) {
    console.error('Add admin message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// POST /api/chat/ai-reply - Generate AI reply (placeholder)
router.post('/ai-reply', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.body;
    if (!conversationId) {
      res.status(400).json({ error: 'conversationId is required' });
      return;
    }

    const lastMessage = await getLatestVisitorMessage(conversationId);
    const assistantContent = await buildAssistantReply(lastMessage);

    const reply = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderType: 'ai',
        content: assistantContent
      }
    });

    res.status(201).json({ reply_message: reply });
  } catch (error) {
    console.error('AI reply error:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

// GET /api/chat/:id - Get conversation (admin only)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const conversation = await prisma.chatConversation.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// PATCH /api/chat/:id - Update conversation (admin only)
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { status, assigned_agent } = req.body;

    const updated = await prisma.chatConversation.update({
      where: {
        id: req.params.id
      },
      data: {
        ...(status && { status }),
        ...(assigned_agent && { assignedAgent: assigned_agent })
      },
      include: {
        messages: true
      }
    });

    res.json({
      success: true,
      conversation: updated
    });
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

export default router;
