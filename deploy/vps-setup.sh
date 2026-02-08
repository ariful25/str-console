#!/bin/bash
# VPS Setup Script for STR Operations Console
# Run this script on your Ubuntu VPS as root or with sudo

set -e

echo "🚀 STR Operations Console - VPS Setup Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root or with sudo${NC}" 
   exit 1
fi

echo -e "${GREEN}Step 1: Updating system packages...${NC}"
apt update && apt upgrade -y

echo -e "${GREEN}Step 2: Installing Node.js 20...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    echo "Node.js version: $(node --version)"
    echo "NPM version: $(npm --version)"
else
    echo "Node.js already installed: $(node --version)"
fi

echo -e "${GREEN}Step 3: Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo "PM2 version: $(pm2 --version)"
else
    echo "PM2 already installed: $(pm2 --version)"
fi

echo -e "${GREEN}Step 4: Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    echo "Nginx installed and started"
else
    echo "Nginx already installed"
fi

echo -e "${GREEN}Step 5: Installing Certbot for SSL...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
    echo "Certbot installed"
else
    echo "Certbot already installed"
fi

echo -e "${GREEN}Step 6: Setting up firewall...${NC}"
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'
echo "Firewall configured"

echo -e "${GREEN}Step 7: Creating application directory...${NC}"
APP_DIR="/var/www/str-console"
mkdir -p $APP_DIR

echo -e "${YELLOW}Application directory created: $APP_DIR${NC}"
echo ""
echo -e "${GREEN}✅ System setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. cd $APP_DIR"
echo "2. Clone your repository: git clone <your-repo-url> ."
echo "3. Run the deployment script: bash deploy/vps-deploy.sh"
echo ""
