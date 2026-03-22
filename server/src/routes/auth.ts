import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import {
  generateJWT,
  generateRefreshToken,
  verifyRefreshToken,
  authMiddleware,
  hashPassword,
  comparePassword
} from '../utils/auth.js';

const router = Router();

export const TEST_USER_EMAIL = 'test@example.com';
export const TEST_USER_PASSWORD = 'TestPassword123';

const ROLE_PRIORITY = [
  'super_admin',
  'admin',
  'content_manager',
  'support_agent',
  'marketing_manager'
] as const;

type AppRole = typeof ROLE_PRIORITY[number];

function pickPrimaryRole(roles: AppRole[]): AppRole {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return role;
  }
  return 'content_manager';
}

async function getUserRoles(userId: string): Promise<AppRole[]> {
  const rows = await prisma.userRole.findMany({
    where: { userId }
  });
  return rows.map(r => r.role as AppRole);
}

// POST /auth/register - Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash
      }
    });

    await prisma.userRole.create({
      data: {
        userId: user.id,
        role: 'content_manager'
      }
    });

    await prisma.profile.create({
      data: {
        userId: user.id,
        displayName: full_name || normalizedEmail.split('@')[0]
      }
    });

    const roles: AppRole[] = ['content_manager'];
    const primaryRole = pickPrimaryRole(roles);

    const tokens = {
      accessToken: generateJWT(user.id, normalizedEmail, primaryRole),
      refreshToken: generateRefreshToken(user.id)
    };

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: primaryRole,
        roles
      },
      ...tokens
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /auth/login - Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const roles = await getUserRoles(user.id);
    const primaryRole = pickPrimaryRole(roles);

    const tokens = {
      accessToken: generateJWT(user.id, normalizedEmail, primaryRole),
      refreshToken: generateRefreshToken(user.id)
    };

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: primaryRole,
        roles
      },
      ...tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /auth/refresh - Refresh access token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const roles = await getUserRoles(user.id);
    const primaryRole = pickPrimaryRole(roles);

    const newAccessToken = generateJWT(user.id, user.email, primaryRole);

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: generateRefreshToken(user.id)
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// GET /auth/me - Get current user info
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const profile = await prisma.profile.findUnique({
      where: { userId: user.userId }
    });

    const roles = await getUserRoles(user.userId);
    const primaryRole = pickPrimaryRole(roles);

    res.json({
      id: user.userId,
      email: user.email,
      role: primaryRole,
      roles,
      profile
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /auth/logout - Logout (client-side token cleanup mainly)
router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
