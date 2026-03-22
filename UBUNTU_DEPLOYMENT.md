# Enterprise Essence Hub - Ubuntu Deployment Guide

## Prerequisites
- Ubuntu 20.04 LTS or newer
- SSH access to your server
- Domain name (optional for production)

## Architecture Overview
```
┌─────────────────┐
│   React Frontend │ (Built & served by Nginx)
└────────┬────────┘
         │
┌────────▼────────┐
│  Nginx Reverse  │ (Port 80/443)
│     Proxy       │
└────────┬────────┘
         │
├─────────┴────────────┐
│                      │
│  /api/*              │  /
│  /admin/*            │  (static files)
│  /auth/*             │
│        │             │
│   ┌────▼───┐    ┌────▼───┐
│   │ Node.js│    │ Static │
│   │ API    │    │  HTML  │
│   │(3000)  │    │(Nginx) │
│   └────┬───┘    └────────┘
│        │
│   ┌────▼──────────┐
│   │  PostgreSQL   │
│   │  (5432)       │
│   └───────────────┘
```

## Step 1: SSH into Your Ubuntu Server

```bash
ssh username@your_server_ip
```

## Step 2: Update System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git htop
```

## Step 3: Install Node.js

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 4: Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE enterprise_essence_hub;
CREATE USER webhook_user WITH PASSWORD 'your_secure_password_here';
ALTER ROLE webhook_user SET client_encoding TO 'utf8';
ALTER ROLE webhook_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE webhook_user SET default_transaction_devel TO 'on';
ALTER ROLE webhook_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE enterprise_essence_hub TO webhook_user;
\c enterprise_essence_hub
ALTER SCHEMA public OWNER TO webhook_user;
\quit
EOF
```

## Step 5: Apply Database Schema

```bash
# Option A: Using the provided schema file
psql -U webhook_user -d enterprise_essence_hub -f /path/to/schema.sql

# Option B: Using Prisma migrations (after Node.js setup)
cd /var/www/enterprise-hub/server
npx prisma migrate deploy
```

## Step 6: Deploy Backend API

```bash
# Create application directory
mkdir -p /var/www/enterprise-hub
cd /var/www/enterprise-hub

# Clone your repository (or upload the files)
# Option A: Git clone
git clone <your-repo-url> .

# Option B: Upload files manually (from local machine)
# scp -r ./server username@server:/var/www/enterprise-hub/

# Navigate to server directory
cd server

# Create .env file with production values
cat > .env << 'EOF'
DATABASE_URL="postgresql://webhook_user:your_secure_password@localhost:5432/enterprise_essence_hub"
JWT_SECRET="$(openssl rand -base64 32)"
REFRESH_TOKEN_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"
PORT=3000
NODE_ENV=production
FRONTEND_URL="https://yourdomain.com"
EOF

# Install dependencies
npm install --production

# Build TypeScript
npm run build

# Generate Prisma client
npx prisma generate
```

## Step 7: Setup PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the Node.js application
cd /var/www/enterprise-hub/server
pm2 start npm --name "api" -- start --cwd $(pwd)

# Make PM2 start on boot
pm2 startup
pm2 save

# Verify it's running
pm2 list
pm2 logs api
```

## Step 8: Build & Deploy Frontend

```bash
# On your local machine
npm run build

# Copy to server
rsync -avz dist/ username@server:/var/www/enterprise-hub/public/

# Or use SCP
scp -r dist/* username@server:/var/www/enterprise-hub/public/
```

## Step 9: Install Nginx

```bash
sudo apt install -y nginx

# Create Nginx config
sudo tee /etc/nginx/sites-available/enterprise-hub > /dev/null << 'EOF'
upstream api {
    server localhost:3000;
}

server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    # Redirect to HTTPS (after SSL is configured)
    # return 301 https://$server_name$request_uri;

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

    location /auth {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /admin {
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
        
        # Cache busting: don't cache HTML
        location ~* \.html?$ {
            expires 0;
            add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0";
        }
        
        # Cache assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/enterprise-hub /etc/nginx/sites-enabled/

# Disable default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 10: Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your_domain.com -d www.your_domain.com

# Auto-renewal is set up automatically
# Verify renewal:
sudo certbot renew --dry-run
```

## Step 11: Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# List rules
sudo ufw status numbered
```

## Step 12: Monitor & Maintain

```bash
# Check PM2 logs
pm2 logs api

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Monitor system resources
htop

# Restart services if needed
pm2 restart api
sudo systemctl restart nginx
```

## Environment Variables Checklist

### Backend (.env)
- [ ] DATABASE_URL - PostgreSQL connection string
- [ ] JWT_SECRET - Strong random string
- [ ] REFRESH_TOKEN_SECRET - Strong random string
- [ ] NODE_ENV - Set to "production"
- [ ] PORT - 3000 (keep as backend port)
- [ ] FRONTEND_URL - Your production domain

### Frontend (.env.local)
- [ ] VITE_API_URL - https://your_domain.com (no trailing slash)

## Testing After Deployment

```bash
# Test API health check
curl https://yourdomain.com/health

# Test login endpoint
curl -X POST https://yourdomain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test services endpoint
curl https://yourdomain.com/api/services

# Monitor in real-time
pm2 monit
```

## Backup Strategy

```bash
# Backup database weekly
0 2 * * 0 pg_dump -U webhook_user enterprise_essence_hub | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Keep backups for 30 days
find /backups -name "db_*.sql.gz" -mtime +30 -delete
```

## Troubleshooting

### Node.js app not starting
```bash
pm2 logs api
pm2 restart api
```

### Database connection error
```bash
psql -U webhook_user -d enterprise_essence_hub -c "SELECT 1"
```

### Nginx returning 404
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```

### SSL certificate renewal failing
```bash
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

## Performance Optimization

```bash
# Enable Gzip in Nginx (already in config)
# Enable caching (already in config)
# Monitor database connections
psql -U webhook_user -d enterprise_essence_hub -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"
```

## Next Steps

1. ✅ Database created and schema applied
2. ✅ Node.js backend deployed with PM2
3. ✅ React frontend deployed to Nginx
4. ✅ SSL certificate installed
5. ✅ Firewall configured
6. Now: Set up monitoring, backups, and alerts

## Support & Documentation

- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-performance-monitoring/)
