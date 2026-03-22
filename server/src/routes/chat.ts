import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import crypto from 'crypto';
import { authMiddleware, staffMiddleware } from '../utils/auth.js';

const router = Router();

type SenderType = 'visitor' | 'ai' | 'agent' | string;

interface ChatRequestBody {
  action?: string;
  conversation_id?: string;
  message?: string;
  session_id?: string;
  visitor_name?: string;
  visitor_email?: string | null;
}

interface StoredMessage {
  id: string;
  content: string;
  senderType?: SenderType;
  sender_type?: SenderType;
  createdAt?: Date;
  created_at?: string;
}

function formatMessage(message: StoredMessage) {
  return {
    id: message.id,
    content: message.content,
    sender_type: message.senderType ?? message.sender_type,
    created_at: message.createdAt ?? message.created_at
  };
}

function getClientIp(req: Request): string {
  const cf = req.headers['cf-connecting-ip'] as string | undefined;
  if (cf) return cf;
  const forwarded = req.headers['x-forwarded-for'] as string | undefined;
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers['x-real-ip'] as string | undefined;
  return realIp || req.socket.remoteAddress || 'unknown';
}

function hashKey(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function checkRateLimit(
  bucket: string,
  key: string,
  maxCount: number,
  windowSeconds: number
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowSeconds * 1000);

  const count = await prisma.rateLimitEvent.count({
    where: {
      bucket,
      key,
      createdAt: {
        gte: windowStart
      }
    }
  });

  if (count >= maxCount) {
    return true;
  }

  try {
    await prisma.rateLimitEvent.create({
      data: {
        bucket,
        key
      }
    });
  } catch (error) {
    console.error('Rate limit insert failed:', error);
  }

  return false;
}

const HUMAN_PHRASES = [
  'human',
  'agent',
  'real person',
  'someone from your team',
  'talk to agent',
  'speak to a human',
  'speak to someone'
];

const PRODUCT_KEYWORDS = ['product', 'platform', 'saas', 'ai cloud insights', 'gpu', 'ticketly'];
const SERVICE_KEYWORDS = ['service', 'services', 'consulting', 'aws', 'azure', 'devops', 'managed', 'cloud'];
const PRICING_KEYWORDS = ['price', 'pricing', 'cost', 'budget', 'quote'];
const DEMO_KEYWORDS = ['demo', 'meeting', 'call', 'schedule'];
const CASE_STUDY_KEYWORDS = ['case study', 'case studies', 'success story', 'client story'];
const CAREER_KEYWORDS = ['career', 'job', 'hiring', 'apply', 'opening'];
const SUPPORT_KEYWORDS = ['support', 'help', 'issue', 'ticket'];

function containsAny(text: string, keywords: string[]) {
  return keywords.some((k) => text.includes(k));
}

function buildAssistantReply(message?: string) {
  const text = (message || '').toLowerCase();

  const wantsProducts = containsAny(text, PRODUCT_KEYWORDS);
  const wantsServices = containsAny(text, SERVICE_KEYWORDS);
  const wantsPricing = containsAny(text, PRICING_KEYWORDS);
  const wantsDemo = containsAny(text, DEMO_KEYWORDS);
  const wantsCaseStudies = containsAny(text, CASE_STUDY_KEYWORDS);
  const wantsCareers = containsAny(text, CAREER_KEYWORDS);
  const wantsSupport = containsAny(text, SUPPORT_KEYWORDS);

  const wantsSpecific =
    wantsProducts || wantsServices || wantsPricing || wantsDemo || wantsCaseStudies || wantsCareers || wantsSupport;

  const lines: string[] = [];

  lines.push("Hi there! I'm ECC's virtual assistant.");

  if (!wantsSpecific) {
    lines.push('ECC Technologies is an AWS Advanced Partner specializing in cloud migration, DevOps, and AI.');
    lines.push('Services: AWS Cloud Services, Azure Cloud Services, DevOps Consulting, AI & Automation, Managed IT Services.');
    lines.push('Products: AI Cloud Insights (cloud cost optimization), GPU on Cloud (GPU infrastructure), Ticketly Support (IT helpdesk).');
  } else {
    if (wantsServices) {
      lines.push('Services: AWS Cloud Services, Azure Cloud Services, DevOps Consulting, AI & Automation, Managed IT Services.');
    }
    if (wantsProducts) {
      lines.push('Products: AI Cloud Insights (cloud cost optimization), GPU on Cloud (GPU infrastructure), Ticketly Support (IT helpdesk).');
    }
  }

  if (wantsPricing) {
    lines.push('Pricing depends on scope and usage. We can provide a tailored quote once we understand your requirements.');
  }

  if (wantsDemo) {
    lines.push('We can schedule a product demo. Share your preferred time and contact email.');
  }

  if (wantsCaseStudies) {
    lines.push('We can share relevant case studies based on your industry and goals.');
  }

  if (wantsCareers) {
    lines.push('For careers, please visit /careers or email info@ecctechnologies.ai.');
  }

  if (wantsSupport) {
    lines.push('For support, please describe the issue and urgency and we will route it to the right team.');
  }

  lines.push('For a deeper discussion, book a free assessment at /contact or email info@ecctechnologies.ai.');
  lines.push('How can I help next?');

  return lines.join(' ');
}

function buildAdminReply(message?: string) {
  const text = (message || '').toLowerCase();
  const wantsPricing = containsAny(text, PRICING_KEYWORDS);
  const wantsDemo = containsAny(text, DEMO_KEYWORDS);

  if (wantsPricing) {
    return 'Thanks for reaching out. We can provide pricing once we understand scope, usage, and timeline. Please share requirements and we will follow up.';
  }

  if (wantsDemo) {
    return 'Thanks for your interest. Please share your preferred time and contact details, and we will schedule a demo.';
  }

  return 'Thanks for your message. We are reviewing it and will follow up shortly. If needed, share more details to help us respond faster.';
}

async function verifyOwnership(conversationId: string, visitorSessionId: string) {
  const match = await prisma.chatConversation.findFirst({
    where: {
      id: conversationId,
      sessionId: visitorSessionId
    },
    select: { id: true }
  });

  return Boolean(match);
}

async function insertAiMessage(conversationId: string, content: string) {
  return prisma.chatMessage.create({
    data: {
      conversationId,
      senderType: 'ai',
      content
    }
  });
}

// POST /api/chat - Start or continue chat
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as ChatRequestBody;
    const { action, conversation_id, session_id } = body;
    const message = body.message?.trim();

    if (action === 'start_chat') {
      const visitorName = body.visitor_name?.trim();
      const visitorEmail = body.visitor_email?.trim() || null;

      if (!session_id || !visitorName) {
        res.status(400).json({ error: 'Missing required fields (session_id, visitor_name)' });
        return;
      }

      const newConversationId = crypto.randomUUID();

      await prisma.chatConversation.create({
        data: {
          id: newConversationId,
          sessionId: session_id,
          visitorName,
          visitorEmail,
          status: 'open'
        }
      });

      const welcomeContent =
        "Hi there! I'm ECC's virtual assistant. I can help with cloud services, DevOps consulting, AI solutions, and products. How can I help you today?";

      const welcomeMsg = await prisma.chatMessage.create({
        data: {
          conversationId: newConversationId,
          content: welcomeContent,
          senderType: 'ai'
        }
      });

      res.json({
        success: true,
        conversation_id: newConversationId,
        welcome_message: formatMessage(welcomeMsg)
      });
      return;
    }

    if (action === 'fetch_messages') {
      if (!conversation_id || !session_id) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (!(await verifyOwnership(conversation_id, session_id))) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      const sessionKey = hashKey(`chat_fetch:${session_id}`);
      const limited = await checkRateLimit('chat_fetch', sessionKey, 120, 60);
      if (limited) {
        res.status(429).json({ error: 'rate_limited', message: 'Too many requests. Please wait a moment.' });
        return;
      }

      const messages = await prisma.chatMessage.findMany({
        where: { conversationId: conversation_id },
        orderBy: { createdAt: 'asc' },
        take: 100
      });

      res.json({ messages: messages.map(formatMessage) });
      return;
    }

    if (!conversation_id || !message || !session_id) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (message.length > 2000) {
      res.status(400).json({ error: 'Message too long (max 2000 characters)' });
      return;
    }

    if (!(await verifyOwnership(conversation_id, session_id))) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const sessionKey = hashKey(`chat_msg:${session_id}`);
    const ipKey = hashKey(`chat:${getClientIp(req)}`);
    const limitedBySession = await checkRateLimit('chat_message_session', sessionKey, 12, 60);
    const limitedByIp = await checkRateLimit('chat_message_ip', ipKey, 60, 3600);
    if (limitedBySession || limitedByIp) {
      res.status(429).json({ error: 'rate_limited', message: "You're sending messages too quickly. Please wait a moment." });
      return;
    }

    const visitorMsg = await prisma.chatMessage.create({
      data: {
        conversationId: conversation_id,
        content: message,
        senderType: 'visitor'
      }
    });

    const lowerMessage = message.toLowerCase();
    const wantsHuman = HUMAN_PHRASES.some((phrase) => lowerMessage.includes(phrase));

    if (wantsHuman) {
      await prisma.chatConversation.update({
        where: { id: conversation_id },
        data: { status: 'assigned' }
      });

      const escalationMessage = await insertAiMessage(
        conversation_id,
        "I've escalated your conversation to a human agent. Someone from our team will be with you shortly. In the meantime, feel free to continue asking questions."
      );

      res.json({
        success: true,
        escalated: true,
        visitor_message: formatMessage(visitorMsg),
        reply_message: formatMessage(escalationMessage)
      });
      return;
    }

    const replyContent = buildAssistantReply(message);
    const replyMessage = await insertAiMessage(conversation_id, replyContent);

    res.json({
      success: true,
      visitor_message: formatMessage(visitorMsg),
      reply_message: formatMessage(replyMessage)
    });
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

// POST /api/chat/ai-reply - Generate deterministic reply
router.post('/ai-reply', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.body;
    if (!conversationId) {
      res.status(400).json({ error: 'conversationId is required' });
      return;
    }

    const lastVisitor = await prisma.chatMessage.findFirst({
      where: { conversationId, senderType: 'visitor' },
      orderBy: { createdAt: 'desc' }
    });

    const replyContent = buildAdminReply(lastVisitor?.content);
    const replyMessage = await insertAiMessage(conversationId, replyContent);

    await prisma.chatConversation.updateMany({
      where: { id: conversationId, status: 'open' },
      data: { status: 'assigned' }
    });

    res.status(201).json({ reply_message: formatMessage(replyMessage) });
  } catch (error) {
    console.error('AI reply error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
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

    res.json({
      ...conversation,
      messages: conversation.messages.map(formatMessage)
    });
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
      conversation: {
        ...updated,
        messages: updated.messages.map(formatMessage)
      }
    });
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

export default router;
