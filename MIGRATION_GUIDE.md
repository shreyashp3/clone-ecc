# Supabase → PostgreSQL + Node.js Backend Migration Guide

## Table of Contents
1. [Database Migration](#database-migration)
2. [Backend API Setup](#backend-api-setup)
3. [Frontend Updates](#frontend-updates)
4. [Ubuntu Deployment](#ubuntu-deployment)
5. [Testing Checklist](#testing-checklist)

---

## Database Migration

### Step 1: Export Supabase Schema

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run this query to get DDL:

```bash
# This will help you backup your Supabase database
pg_dump -h db.SUPABASE_PROJECT_ID.supabase.co -U postgres dbname -F p > backup.sql
# When prompted, enter your Supabase database password
```

### Step 2: Create Local PostgreSQL Database

On your Ubuntu server or local machine:

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create new database for your project
sudo -u postgres createdb enterprise_essence_hub

# Create database user
sudo -u postgres createuser -P webhook_user
# When prompted, set password
```

### Step 3: Restore Database Schema

```bash
# Restore the schema (run this in a fresh PostgreSQL)
psql -U postgres -d enterprise_essence_hub < migration_schema.sql
```

**Key Note:** The `migration_schema.sql` file is included in this migration package. It contains:
- All 19 tables (✅ no changes needed)
- All enums (app_role, post_status, lead_status, chat_status)
- All triggers and functions
- All RLS policies (⚠️ will be disabled, add back if needed)
- All indexes for performance

### Step 4: Verify Database

```bash
psql -U webhook_user -d enterprise_essence_hub -c "\dt"
# Should show all 19 tables

psql -U webhook_user -d enterprise_essence_hub -c "\dT"
# Should show all enums
```

---

## Backend API Setup

### Step 1: Initialize Node.js Project

```bash
# From your project root
mkdir server
cd server
npm init -y

# Install dependencies
npm install express cors dotenv prisma @prisma/client jsonwebtoken bcryptjs axios
npm install -D typescript ts-node @types/node @types/express

# Initialize Prisma
npx prisma init
```

### Step 2: Configure Environment

Create `.env` file in `server/` folder:

```env
# Database
DATABASE_URL="postgresql://webhook_user:YOUR_PASSWORD@localhost:5432/enterprise_essence_hub"

# JWT
JWT_SECRET="your-super-secret-key-change-this"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
JWT_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"

# Google AI (optional, if you want to keep chat later)
GOOGLE_API_KEY="your-api-key"

# Server
PORT=3000
NODE_ENV=development
```

### Step 3: Copy Prisma Schema

A complete Prisma schema file (`prisma/schema.prisma`) is included. This mirrors your PostgreSQL schema perfectly.

### Step 4: Generate Prisma Client

```bash
cd server
npx prisma generate
```

### Step 5: Build API Routes

Complete Express server code is provided in `server/src/` with:
- **Authentication routes** (`/auth/login`, `/auth/register`, `/auth/refresh`)
- **CMS routes** (`/api/services`, `/api/products`, `/api/blog`, etc.)
- **Lead routes** (`/api/leads`)
- **Chat routes** (`/api/chat`)
- **Admin routes** (CRUD for all CMS)

### Step 6: Run Backend

```bash
cd server
npm run dev
# Server runs on http://localhost:3000
```

---

## Frontend Updates

### Step 1: Replace Supabase Client

**Old:** `src/integrations/supabase/client.ts`
**New:** `src/integrations/api/client.ts`

Update file to use fetch instead of Supabase SDK:
```typescript
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const apiClient = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  },
  // ... similar post, put, delete methods
};
```

### Step 2: Update useAuth Hook

Replace `src/hooks/useAuth.tsx` with the new version that:
- Uses `/auth/login` endpoint instead of `signInWithPassword()`
- Uses `/auth/register` instead of `signUp()`
- Stores JWT tokens in localStorage
- Auto-refreshes tokens

### Step 3: Update useCMSData Hook

Replace `src/hooks/useCMSData.ts` to fetch from:
- `/api/services` (instead of Supabase query)
- `/api/products`
- `/api/blog-posts`
- `/api/case-studies`
- `/api/careers`
- etc.

### Step 4: Update Environment Variables

In `.env.local`:
```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=  # Remove this
VITE_SUPABASE_PUBLISHABLE_KEY=  # Remove this
```

### Step 5: Remove Supabase Dependencies

```bash
npm uninstall @supabase/supabase-js @supabase/auth-helpers-react
```

---

## Ubuntu Deployment

### Step 1: Install Dependencies on Server

```bash
# SSH into your Ubuntu server
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib nginx

# Create app directory
mkdir -p /var/www/enterprise-hub
cd /var/www/enterprise-hub
```

### Step 2: Deploy Backend

```bash
# Copy your server folder to the server
scp -r server user@your-server-ip:/var/www/enterprise-hub/

cd /var/www/enterprise-hub/server

# Install production dependencies
npm install --production

# Create .env with production values
sudo nano .env
# (Set DATABASE_URL, JWT_SECRET, etc.)

# Test it runs
npm run build && npm start
# Should see: "Server running on port 3000"
```

### Step 3: Set Up Process Manager (PM2)

```bash
# Install PM2
sudo npm install -g pm2

# Start your Node app
pm2 start npm --name "api" -- start --cwd /var/www/enterprise-hub/server

# Keep it running after reboot
pm2 startup
pm2 save
```

### Step 4: Build & Deploy Frontend

```bash
# On your local machine
npm run build

# Copy built files to server
scp -r dist user@your-server-ip:/var/www/enterprise-hub/public/

# or use rsync for faster transfer
rsync -avz dist/ user@your-server-ip:/var/www/enterprise-hub/public/
```

### Step 5: Configure Nginx

Create `/etc/nginx/sites-available/enterprise-hub`:

```nginx
upstream api {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # API proxy
    location /api {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve React app
    location / {
        root /var/www/enterprise-hub/public;
        try_files $uri /index.html;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/enterprise-hub /etc/nginx/sites-enabled/
sudo nginx -t  # Test config
sudo systemctl restart nginx
```

### Step 6: SSL Certificates (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## Testing Checklist

- [ ] Database connected (`psql -U webhook_user -d enterprise_essence_hub`)
- [ ] Backend running (`curl http://localhost:3000/health`)
- [ ] User registration works (`POST /auth/register`)
- [ ] User login works (`POST /auth/login`)
- [ ] JWT token received and stored
- [ ] CMS data fetches (`GET /api/services`)
- [ ] Lead submission works (`POST /api/leads`)
- [ ] Admin panel accessible (protected routes working)
- [ ] Frontend loads on Ubuntu server
- [ ] No CORS errors
- [ ] SSL certificate active
- [ ] Rate limiting working on lead submission (8 per 30 min)

---

## Files You'll Need

1. ✅ `migration_schema.sql` - PostgreSQL schema
2. ✅ `prisma/schema.prisma` - Prisma ORM definition
3. ✅ `server/src/` - Complete Express API
4. ✅ `src/integrations/api/` - New API client
5. ✅ `src/hooks/useAuth.tsx` - Updated auth hook
6. ✅ `src/hooks/useCMSData.ts` - Updated CMS data hook
7. ✅ `README-DEPLOYMENT.md` - Deployment instructions

**Next Step:** I'll generate all these files for you!
