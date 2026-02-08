#!/bin/bash
# Backup Script for STR Operations Console

set -e

echo "💾 Creating Backup"
echo "=================="

# Configuration
APP_DIR="/var/www/str-console"
BACKUP_DIR="/root/backups/str-console"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="str-console-$DATE.tar.gz"

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Creating backup: $BACKUP_FILE"

# Backup application files (excluding node_modules and .next)
cd $APP_DIR
tar -czf $BACKUP_DIR/$BACKUP_FILE \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='*.log' \
    .

# Show backup info
BACKUP_SIZE=$(du -h $BACKUP_DIR/$BACKUP_FILE | cut -f1)
echo -e "${GREEN}✅ Backup created successfully!${NC}"
echo "Location: $BACKUP_DIR/$BACKUP_FILE"
echo "Size: $BACKUP_SIZE"

# Keep only last 7 days of backups
echo ""
echo "Cleaning old backups (keeping last 7 days)..."
find $BACKUP_DIR -name "str-console-*.tar.gz" -mtime +7 -delete

# List remaining backups
echo ""
echo "Available backups:"
ls -lh $BACKUP_DIR/str-console-*.tar.gz 2>/dev/null || echo "No backups found"

echo ""
echo "To restore from backup:"
echo "  1. Stop application: pm2 stop str-console"
echo "  2. cd $APP_DIR"
echo "  3. tar -xzf $BACKUP_DIR/$BACKUP_FILE"
echo "  4. npm install"
echo "  5. npm run build"
echo "  6. pm2 restart str-console"
echo ""
