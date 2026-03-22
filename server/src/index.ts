import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import cmsRoutes from './routes/cms.js';
import leadsRoutes from './routes/leads.js';
import chatRoutes from './routes/chat.js';
import analyticsRoutes from './routes/analytics.js';
import adminRoutes from './routes/admin.js';
import uploadsRoutes from './routes/uploads.js';

// Initialize Prisma
export const prisma = new PrismaClient();

// Initialize Express
const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
const envOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082'
];
const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultOrigins]));
const allowAllOrigins = envOrigins.includes('*');

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowAllOrigins || allowedOrigins.includes(origin)) {
      cb(null, true);
      return;
    }
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/api', cmsRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/page-views', analyticsRoutes);
app.use('/admin/uploads', uploadsRoutes);
app.use('/admin', adminRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$executeRawUnsafe('SELECT 1');
    console.log('✓ Database connected');

    // Import and initialize test user
    try {
      const { TEST_USER_EMAIL, TEST_USER_PASSWORD } = await import('./routes/auth.js');
      const { hashPassword } = await import('./utils/auth.js');

      let user = await prisma.user.findUnique({
        where: { email: TEST_USER_EMAIL }
      });

      if (!user) {
        const passwordHash = await hashPassword(TEST_USER_PASSWORD);
        user = await prisma.user.create({
          data: {
            email: TEST_USER_EMAIL,
            passwordHash
          }
        });
      }

      const existingRole = await prisma.userRole.findFirst({
        where: { userId: user.id, role: 'admin' }
      });

      if (!existingRole) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            role: 'admin'
          }
        });
      }

      const existingProfile = await prisma.profile.findUnique({
        where: { userId: user.id }
      });

      if (!existingProfile) {
        await prisma.profile.create({
          data: {
            userId: user.id,
            displayName: 'Test User'
          }
        });
      }

      console.log('✓ Test user ready (email: test@example.com, password: TestPassword123)');
    } catch (testUserError) {
      console.error('Note: Could not initialize test user:', testUserError);
      // Don't fail the server startup if test user can't be created
    }

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
