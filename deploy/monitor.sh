#!/bin/bash
# Monitoring Script for STR Operations Console

echo "📊 STR Operations Console - System Monitor"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Application Status
echo -e "${BLUE}Application Status:${NC}"
pm2 status str-console
echo ""

# Resource Usage
echo -e "${BLUE}Resource Usage:${NC}"
pm2 show str-console | grep -E "cpu|memory|restarts|uptime"
echo ""

# Recent Errors (last 20 lines)
echo -e "${BLUE}Recent Error Logs:${NC}"
pm2 logs str-console --err --lines 20 --nostream
echo ""

# Nginx Status
echo -e "${BLUE}Nginx Status:${NC}"
systemctl status nginx --no-pager | head -10
echo ""

# Disk Usage
echo -e "${BLUE}Disk Usage:${NC}"
df -h / | tail -1
echo ""

# Memory Usage
echo -e "${BLUE}Memory Usage:${NC}"
free -h | grep -E "Mem|Swap"
echo ""

# Port 3000 Listening
echo -e "${BLUE}Port 3000 Status:${NC}"
if sudo lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Application listening on port 3000${NC}"
else
    echo -e "${RED}✗ No process listening on port 3000${NC}"
fi
echo ""

# SSL Certificate (if exists)
if [ -d "/etc/letsencrypt/live" ]; then
    echo -e "${BLUE}SSL Certificate:${NC}"
    DOMAIN=$(ls /etc/letsencrypt/live/ | grep -v README | head -1)
    if [ ! -z "$DOMAIN" ]; then
        EXPIRY=$(sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN/cert.pem 2>/dev/null | cut -d= -f2)
        echo "Domain: $DOMAIN"
        echo "Expires: $EXPIRY"
    fi
fi

echo ""
echo "For live monitoring, run: pm2 monit"
echo ""
