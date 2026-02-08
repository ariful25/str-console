#!/bin/bash
# Nginx Configuration Script for STR Operations Console

set -e

echo "🌐 Configuring Nginx"
echo "===================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root or with sudo${NC}" 
   exit 1
fi

# Get domain name
read -p "Enter your domain name (e.g., str.example.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Domain name is required!${NC}"
    exit 1
fi

echo -e "${GREEN}Creating Nginx configuration for $DOMAIN...${NC}"

# Create Nginx config
cat > /etc/nginx/sites-available/str-console << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # Client body size limit
    client_max_body_size 10M;

    # Access logs
    access_log /var/log/nginx/str-console-access.log;
    error_log /var/log/nginx/str-console-error.log;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/str-console /etc/nginx/sites-enabled/

# Remove default site if exists
rm -f /etc/nginx/sites-enabled/default

# Test configuration
echo -e "${GREEN}Testing Nginx configuration...${NC}"
nginx -t

# Reload Nginx
echo -e "${GREEN}Reloading Nginx...${NC}"
systemctl reload nginx

echo ""
echo -e "${GREEN}✅ Nginx configured successfully!${NC}"
echo ""
echo -e "${YELLOW}Next step: Setup SSL certificate${NC}"
echo ""
read -p "Do you want to setup SSL with Let's Encrypt now? (y/n): " SETUP_SSL

if [[ $SETUP_SSL =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Setting up SSL certificate...${NC}"
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --register-unsafely-without-email
    
    echo ""
    echo -e "${GREEN}✅ SSL certificate installed!${NC}"
    echo "Your site is now accessible at: https://$DOMAIN"
else
    echo ""
    echo "To setup SSL later, run:"
    echo "sudo certbot --nginx -d $DOMAIN"
fi

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo "Visit: http://$DOMAIN (or https://$DOMAIN if SSL configured)"
echo ""
