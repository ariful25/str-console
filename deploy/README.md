# VPS Deployment Scripts

This directory contains scripts to deploy the STR Operations Console to a VPS.

## Quick Start

### 1. Initial VPS Setup

On your VPS, run as root:

```bash
wget https://raw.githubusercontent.com/your-repo/str-console/main/deploy/vps-setup.sh
chmod +x vps-setup.sh
sudo ./vps-setup.sh
```

Or manually:
```bash
sudo bash vps-setup.sh
```

This installs:
- Node.js 20
- PM2
- Nginx
- Certbot
- Firewall configuration

### 2. Clone Repository

```bash
cd /var/www/str-console
git clone https://github.com/your-username/str-console.git .
```

### 3. Configure Environment

```bash
cp .env.production.example .env.production
nano .env.production
```

Fill in:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `CLERK_SECRET_KEY` - Clerk secret key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `OPENAI_API_KEY` - OpenAI API key

### 4. Deploy Application

```bash
bash deploy/vps-deploy.sh
```

This will:
- Install dependencies
- Generate Prisma client
- Push database schema
- Build Next.js app
- Start with PM2

### 5. Configure Nginx

```bash
sudo bash deploy/nginx-setup.sh
```

Enter your domain when prompted. This will:
- Create Nginx configuration
- Setup SSL with Let's Encrypt
- Enable HTTPS

---

## Scripts Reference

### `vps-setup.sh`
Initial server setup. Installs all required software.

**Usage:**
```bash
sudo bash deploy/vps-setup.sh
```

**What it does:**
- Updates system packages
- Installs Node.js 20
- Installs PM2
- Installs Nginx
- Installs Certbot
- Configures firewall

---

### `vps-deploy.sh`
Deploys the application.

**Usage:**
```bash
bash deploy/vps-deploy.sh
```

**What it does:**
- Installs npm packages
- Generates Prisma client
- Pushes database schema
- Builds Next.js
- Starts/restarts PM2

---

### `nginx-setup.sh`
Configures Nginx reverse proxy and SSL.

**Usage:**
```bash
sudo bash deploy/nginx-setup.sh
```

**What it does:**
- Creates Nginx config
- Enables site
- Tests configuration
- Optionally installs SSL certificate

---

### `update.sh`
Updates deployed application.

**Usage:**
```bash
bash deploy/update.sh
```

**What it does:**
- Pulls latest code from git
- Installs dependencies
- Runs migrations
- Rebuilds app
- Restarts PM2

**Run this after:** Pushing changes to your repository

---

### `backup.sh`
Creates backup of application.

**Usage:**
```bash
sudo bash deploy/backup.sh
```

**What it does:**
- Creates tar.gz backup
- Stores in `/root/backups/str-console/`
- Keeps last 7 days
- Shows backup size

**Schedule with cron:**
```bash
sudo crontab -e
# Add: 0 2 * * * /var/www/str-console/deploy/backup.sh
```

---

### `monitor.sh`
Shows system and application status.

**Usage:**
```bash
bash deploy/monitor.sh
```

**Shows:**
- PM2 status
- Resource usage
- Recent errors
- Nginx status
- Disk/memory usage
- SSL certificate expiry

---

### `ecosystem.config.js`
PM2 cluster configuration.

**Usage with PM2:**
```bash
pm2 start deploy/ecosystem.config.js
```

**Features:**
- Runs 2 instances
- Cluster mode
- Auto-restart
- Log rotation
- Memory limits

---

## Common Tasks

### View Application Logs
```bash
pm2 logs str-console
```

### Restart Application
```bash
pm2 restart str-console
```

### Stop Application
```bash
pm2 stop str-console
```

### Check Status
```bash
pm2 status
```

### Monitor in Real-time
```bash
pm2 monit
```

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/str-console-access.log
sudo tail -f /var/log/nginx/str-console-error.log
```

### Test Nginx Configuration
```bash
sudo nginx -t
```

### Reload Nginx
```bash
sudo systemctl reload nginx
```

### Renew SSL Certificate
```bash
sudo certbot renew
```

---

## Troubleshooting

### Application Won't Start

**Check logs:**
```bash
pm2 logs str-console --lines 50
```

**Check if port 3000 is in use:**
```bash
sudo lsof -i :3000
```

**Restart:**
```bash
pm2 delete str-console
bash deploy/vps-deploy.sh
```

### Nginx Configuration Error

**Test config:**
```bash
sudo nginx -t
```

**Check syntax:**
```bash
cat /etc/nginx/sites-available/str-console
```

**Restart Nginx:**
```bash
sudo systemctl restart nginx
```

### Database Connection Failed

**Check environment variables:**
```bash
cat .env.production | grep DATABASE_URL
```

**Test Prisma connection:**
```bash
npx prisma db pull
```

**Verify Neon database is accessible:**
```bash
psql $DATABASE_URL -c "SELECT 1;"
```

### SSL Certificate Issues

**Check certificate status:**
```bash
sudo certbot certificates
```

**Renew manually:**
```bash
sudo certbot renew --force-renewal
```

---

## Security Checklist

- [ ] Firewall enabled (UFW)
- [ ] SSH key-based authentication
- [ ] Strong passwords
- [ ] SSL certificate installed
- [ ] Environment variables secured
- [ ] Regular backups scheduled
- [ ] PM2 log rotation enabled
- [ ] Nginx security headers configured
- [ ] Database uses SSL connection

---

## Maintenance Schedule

**Daily:**
- Check application status: `pm2 status`
- Review error logs: `pm2 logs str-console --err --lines 20`

**Weekly:**
- Run monitor script: `bash deploy/monitor.sh`
- Check disk space: `df -h`
- Review Nginx logs

**Monthly:**
- Update system packages: `sudo apt update && sudo apt upgrade`
- Update npm packages: `npm update`
- Review SSL certificate expiry
- Clean old PM2 logs

**Quarterly:**
- Full backup before updates
- Review and optimize PM2 configuration
- Database performance review
- Security audit

---

## Support

For detailed deployment information, see:
- [DEPLOYMENT-GUIDE.md](../DEPLOYMENT-GUIDE.md)
- [DEPLOYMENT-CHECKLIST.md](../DEPLOYMENT-CHECKLIST.md)
- [OPERATIONS-MANUAL.md](../OPERATIONS-MANUAL.md)
