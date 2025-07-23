#!/bin/bash

# 🚀 SBV Professional App - Railway Deployment Script
# Automatisches Setup für Cloud-Deployment

set -e

echo "🚀 Starting SBV Professional App Railway Deployment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway whoami 2>/dev/null || {
    echo "🔐 Please login to Railway..."
    railway login
}

# Initialize Railway project
echo "🎯 Initializing Railway project..."
railway init sbv-professional-app --detach || echo "Project might already exist"

# Add PostgreSQL database
echo "🐘 Adding PostgreSQL database..."
railway add postgresql || echo "PostgreSQL might already be added"

# Set environment variables
echo "⚙️ Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="sbv-railway-production-secret-2025-ultra-secure"
railway variables set UPLOAD_PATH="/app/uploads"
railway variables set MAX_FILE_SIZE="10485760"
railway variables set ADMIN_EMAIL="superadmin@digitale-rakete.ch"
railway variables set ADMIN_PASSWORD="admin2025"
railway variables set DB_POOL_MIN="2"
railway variables set DB_POOL_MAX="10"
railway variables set DB_POOL_IDLE_TIMEOUT="30000"

# Create persistent volume for uploads
echo "📁 Creating persistent volume for file uploads..."
railway volume create uploads --mount-path /app/uploads || echo "Volume might already exist"

# Deploy the application
echo "🚀 Deploying application..."
railway deploy

# Show deployment info
echo "✅ Deployment completed!"
echo ""
echo "🌐 Your app should be available at:"
railway status
echo ""
echo "🔗 To get the exact URL, run: railway status"
echo "📊 To view logs, run: railway logs"
echo "⚙️ To manage environment variables, run: railway variables"
echo ""
echo "🔑 Test Login Credentials:"
echo "   Email: superadmin@digitale-rakete.ch"
echo "   Password: admin2025"
echo ""
echo "🎉 Deployment successful! Your SBV app is now live in the cloud!"
