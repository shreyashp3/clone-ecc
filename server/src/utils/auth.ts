import jwt, { SignOptions } from 'jsonwebtoken';
// @ts-ignore - bcryptjs types issue
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-this';
const REFRESH_SECRET: string = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret';
const JWT_EXPIRY: string = process.env.JWT_EXPIRY || '15m';
const REFRESH_EXPIRY: string = process.env.REFRESH_TOKEN_EXPIRY || '7d';

// Types for JWT payload
export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

// Generate JWT token
export function generateJWT(userId: string, email: string, role?: string): string {
  const options: any = { expiresIn: JWT_EXPIRY };
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    options
  );
}

// Generate refresh token
export function generateRefreshToken(userId: string): string {
  const options: any = { expiresIn: REFRESH_EXPIRY };
  return jwt.sign(
    { userId },
    REFRESH_SECRET,
    options
  );
}

// Verify JWT token
export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Middleware to verify JWT token from Authorization header
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyJWT(token);

    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Attach user info to request
    (req as any).user = payload;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

// Middleware to verify admin role
export async function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = (req as any).user;

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      res.status(403).json({ error: 'Insufficient permissions for this action' });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(403).json({ error: 'Permission check failed' });
  }
}

// Middleware to verify staff role (any non-public user)
export async function staffMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = (req as any).user;

    if (!user || !user.role) {
      res.status(403).json({ error: 'Staff access required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Staff middleware error:', error);
    res.status(403).json({ error: 'Permission check failed' });
  }
}
