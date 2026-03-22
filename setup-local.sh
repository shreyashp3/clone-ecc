#!/bin/bash

# Enterprise Essence Hub - Local Development Setup Script
# This script automates the local development environment setup

set -e

echo "=================================================="
echo "Enterprise Essence Hub - Local Setup"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo "✓ NPM version: $(npm --version)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✓ PostgreSQL installed"

# Create database
echo ""
echo "📦 Setting up PostgreSQL database..."

DB_NAME="enterprise_essence_hub"
DB_USER="webhook_user"
DB_PASSWORD="postgres_local_dev_password"

# Create database and user
psql -U postgres << EOF
-- Drop existing if needed
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;

-- Create user and database
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

echo "✓ Database created: $DB_NAME"
echo "✓ Database user created: $DB_USER"

# Setup backend
echo ""
echo "📦 Setting up backend..."

cd server

# Create .env file
echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME\"" > .env
echo "JWT_SECRET=\"dev-secret-key-change-this-in-prod\"" >> .env
echo "REFRESH_TOKEN_SECRET=\"dev-refresh-secret\"" >> .env
echo "JWT_EXPIRY=\"15m\"" >> .env
echo "REFRESH_TOKEN_EXPIRY=\"7d\"" >> .env
echo "PORT=3000" >> .env
echo "NODE_ENV=development" >> .env
echo "FRONTEND_URL=\"http://localhost:5173\"" >> .env

echo "✓ Backend .env created"

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Run Prisma migrations
echo "Applying database schema..."
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

echo "✓ Backend setup complete"

# Setup frontend
echo ""
echo "📦 Setting up frontend..."

cd ..

# Create .env.local file
echo "VITE_API_URL=http://localhost:3000" > .env.local

echo "✓ Frontend .env.local created"

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

echo "✓ Frontend setup complete"

# Summary
echo ""
echo "=================================================="
echo "✅ Setup Complete!"
echo "=================================================="
echo ""
echo "To start developing:"
echo ""
echo "Terminal 1 - Backend API:"
echo "  cd server"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "Database credentials (for reference):"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo "To view the database:"
echo "  psql -U $DB_USER -d $DB_NAME"
echo ""
echo "=================================================="
