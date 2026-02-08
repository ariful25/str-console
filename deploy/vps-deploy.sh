#!/bin/bash
# STR Operations Console - Application Deployment Script
# Run this script from the application directory

set -e

echo "🚀 Deploying STR Operations Console"
echo "===================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

APP_DIR=$(pwd)
APP_NAME="str-console"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}Error: .env.production file not found!${NC}"
    echo "Please create .env.production file with required variables:"
    echo "  - DATABASE_URL"
    echo "  - CLERK_SECRET_KEY"
    echo "  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    echo "  - OPENAI_API_KEY"
    exit 1
fi

echo -e "${GREEN}Step 1: Installing dependencies...${NC}"
npm ci --production=false

echo -e "${GREEN}Step 2: Generating Prisma client...${NC}"
npx prisma generate

echo -e "${GREEN}Step 3: Pushing database schema...${NC}"
npx prisma db push --skip-generate

echo -e "${GREEN}Step 4: Building Next.js application...${NC}"
NODE_ENV=production npm run build

echo -e "${GREEN}Step 5: Configuring PM2...${NC}"
if pm2 list | grep -q $APP_NAME; then
    echo "Restarting existing PM2 process..."
    pm2 restart $APP_NAME
else
    echo "Starting new PM2 process..."
    pm2 start npm --name $APP_NAME -- start
    pm2 save
fi

# Setup PM2 startup script
pm2 startup systemd -u $USER --hp $HOME

echo -e "${GREEN}Step 6: Installing PM2 log rotation...${NC}"
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Application status:"
pm2 status
echo ""
echo "View logs: pm2 logs $APP_NAME"
echo "Monitor: pm2 monit"
echo ""
echo -e "${YELLOW}Next step: Configure Nginx${NC}"
echo "Run: sudo bash deploy/nginx-setup.sh"
echo ""
