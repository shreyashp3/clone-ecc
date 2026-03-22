import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import crypto from 'crypto';
import axios from 'axios';
import { authMiddleware, staffMiddleware, verifyJWT } from '../utils/auth.js';

const router = Router();

const SYSTEM_PROMPT = `You are ECC Technologies' AI assistant. You help visitors learn about ECC Technologies' cloud services, DevOps consulting, AI solutions, and products.

Key information:
- ECC Technologies is an AWS Advanced Partner specializing in cloud migration, DevOps, and AI
- Services: AWS Cloud Services, Azure Cloud Services, DevOps Consulting, AI & Automation, Managed IT Services
- Products: AI Cloud Insights (cloud cost optimization), GPU on Cloud (GPU infrastructure), Ticketly Support (IT helpdesk)
- Contact: info@ecctechnologies.ai

Be helpful, professional, and concise. If someone has a complex technical question or wants to discuss a project, suggest they book a free assessment at /contact. If someone asks to speak to a human, let them know an agent will be connected.

Keep responses under 150 words unless detailed explanation is needed.`;

const ADMIN_SYSTEM_PROMPT = `You are assisting ECC Technologies support staff. Draft a concise, professional reply to the visitor based on the conversation history.

Rules:
- Do not invent completed actions, pricing, or commitments.
- If more investigation is needed, say so clearly.
- Keep the tone human, direct, and helpful.
- Keep the response under 120 words unless more detail is necessary.`;

type SenderType = 'visitor' | 'ai' | 'agent' | string;

interface ChatRequestBody {
  action?: string;
  conversation_id?: string;
  message?: string;
  session_id?: string;
  visitor_message?: string;
  visitor_name?: string;
  visitor_email?: string | null;
}

interface StoredMessage {
  id?: string;
  content: string;
  sender_type?: SenderType;
  senderType?: SenderType;
  created_at?: string;
  createdAt?: Date;
}

interface GatewayMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GatewayResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
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

function getFallbackReply(message?: string) {
  const lowerMessage = message?.toLowerCase() ?? '';

  if (
    ['human', 'agent', 'real person', 'someone from your team'].some((phrase) =>
      lowerMessage.includes(phrase)
    )
  ) {
    return "I've shared your request with our team. A human agent will follow up shortly.";
  }

  return 'Thanks for your message. Our team is reviewing it and will follow up shortly. You can also reach us at info@ecctechnologies.ai.';
}

function mapHistoryToGatewayMessages(history: StoredMessage[]) {
  return history.map((entry) => ({
    role: (entry.sender_type || entry.senderType) === 'visitor' ? 'user' : 'assistant',
    content: entry.content
  })) satisfies GatewayMessage[];
}

function formatMessage(message: any) {
  return {
    id: message.id,
    content: message.content,
    sender_type: message.senderType ?? message.sender_type,
    created_at: message.createdAt ?? message.created_at
  };
}

async function generateGatewayReply(
  apiKey: string | undefined,
  messages: GatewayMessage[],
  fallbackReply: string
) {
  if (!apiKey) {
    return fallbackReply;
  }

  try {
    const response = await axios.post(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        model: 'google/gemini-3-flash-preview',
        messages,
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiData = response.data as GatewayResponse;
    return aiData.choices?.[0]?.message?.content?.trim() || fallbackReply;
  } catch (error) {
    console.error('AI gateway request error:', error);
    return fallbackReply;
  }
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
  const msg = await prisma.chatMessage.create({
    data: {
      conversationId,
      senderType: 'ai',
      content
    }
  });

  return msg;
}

async function requireStaff(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }

  const token = authHeader.substring(7);
  const payload = verifyJWT(token);

  if (!payload) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }

  if (!payload.role) {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }

  (req as any).user = payload;
  return true;
}

// POST /api/chat - Start or continue chat
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as ChatRequestBody;
    const { action, conversation_id, session_id } = body;
    const message = body.message?.trim();
    const legacyAdminRequest = typeof body.visitor_message === 'string' && !session_id;
    const ipKey = hashKey(`chat:${getClientIp(req)}`);

    // Start a new chat conversation (creates conversation + welcome message)
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
        "Hi there! I'm ECC's AI assistant. I can help with cloud services, DevOps consulting, AI solutions, and products. How can I help you today?";

      let welcomeMsg = null;
      try {
        welcomeMsg = await prisma.chatMessage.create({
          data: {
            conversationId: newConversationId,
            content: welcomeContent,
            senderType: 'ai'
          }
        });
      } catch (error) {
        console.error('Failed to insert welcome message:', error);
      }

      res.json({
        success: true,
        conversation_id: newConversationId,
        welcome_message: welcomeMsg
          ? formatMessage(welcomeMsg)
          : {
              id: crypto.randomUUID(),
              content: welcomeContent,
              sender_type: 'ai',
              created_at: new Date().toISOString()
            }
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

    if (action === 'generate_admin_reply' || legacyAdminRequest) {
      if (!conversation_id) {
        res.status(400).json({ error: 'Missing conversation_id' });
        return;
      }

      if (!(await requireStaff(req, res))) {
        return;
      }

      const history = await prisma.chatMessage.findMany({
        where: { conversationId: conversation_id },
        orderBy: { createdAt: 'asc' },
        take: 20
      });

      if (!history || history.length === 0) {
        res.status(400).json({ error: 'No messages available for this conversation' });
        return;
      }

      const fallbackReply = getFallbackReply();
      const reply = await generateGatewayReply(
        process.env.LOVABLE_API_KEY,
        [
          { role: 'system', content: ADMIN_SYSTEM_PROMPT },
          ...mapHistoryToGatewayMessages(history),
          {
            role: 'user',
            content: 'Draft the next ECC reply to the visitor based on the conversation above.'
          }
        ],
        fallbackReply
      );

      const replyMessage = await insertAiMessage(conversation_id, reply);

      await prisma.chatConversation.updateMany({
        where: { id: conversation_id, status: 'open' },
        data: { status: 'assigned' }
      });

      res.json({
        success: true,
        reply,
        reply_message: formatMessage(replyMessage)
      });
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
    const wantsHuman = [
      'speak to a human',
      'talk to agent',
      'human agent',
      'real person',
      'speak to someone'
    ].some((phrase) => lowerMessage.includes(phrase));

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

    const history = await prisma.chatMessage.findMany({
      where: { conversationId: conversation_id },
      orderBy: { createdAt: 'asc' },
      take: 20
    });

    const fallbackReply = getFallbackReply(message);
    const reply = await generateGatewayReply(
      process.env.LOVABLE_API_KEY,
      [{ role: 'system', content: SYSTEM_PROMPT }, ...mapHistoryToGatewayMessages(history || [])],
      fallbackReply
    );

    const replyMessage = await insertAiMessage(conversation_id, reply);

    res.json({
      success: true,
      reply,
      visitor_message: formatMessage(visitorMsg),
      reply_message: formatMessage(replyMessage)
    });
  } catch (error) {
    console.error('Chat AI error:', error);
    res.status(500).json({ error: 'Internal server error' });
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

// POST /api/chat/ai-reply - Generate AI reply
router.post('/ai-reply', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.body;
    if (!conversationId) {
      res.status(400).json({ error: 'conversationId is required' });
      return;
    }

    const history = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 20
    });

    if (!history || history.length === 0) {
      res.status(400).json({ error: 'No messages available for this conversation' });
      return;
    }

    const fallbackReply = getFallbackReply();
    const reply = await generateGatewayReply(
      process.env.LOVABLE_API_KEY,
      [
        { role: 'system', content: ADMIN_SYSTEM_PROMPT },
        ...mapHistoryToGatewayMessages(history),
        {
          role: 'user',
          content: 'Draft the next ECC reply to the visitor based on the conversation above.'
        }
      ],
      fallbackReply
    );

    const replyMessage = await insertAiMessage(conversationId, reply);

    await prisma.chatConversation.updateMany({
      where: { id: conversationId, status: 'open' },
      data: { status: 'assigned' }
    });

    res.status(201).json({ reply_message: formatMessage(replyMessage) });
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
