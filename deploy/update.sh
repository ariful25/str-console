#!/bin/bash
# Update Script for STR Operations Console
# Run this script to deploy updates to production

set -e

echo "🔄 Updating STR Operations Console"
echo "==================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

APP_NAME="str-console"

echo -e "${GREEN}Step 1: Pulling latest code...${NC}"
git pull origin main

echo -e "${GREEN}Step 2: Installing dependencies...${NC}"
npm ci --production=false

echo -e "${GREEN}Step 3: Running database migrations...${NC}"
npx prisma generate
npx prisma db push --skip-generate

echo -e "${GREEN}Step 4: Building application...${NC}"
NODE_ENV=production npm run build

echo -e "${GREEN}Step 5: Restarting application...${NC}"
pm2 restart $APP_NAME

echo ""
echo -e "${GREEN}✅ Update complete!${NC}"
echo ""
pm2 status
echo ""
echo "View logs: pm2 logs $APP_NAME"
echo ""
