# VPS Deployment Quick Reference

## 🚀 One-Command Deployment

On your fresh Ubuntu VPS:

```bash
# 1. Setup VPS
curl -fsSL https://raw.githubusercontent.com/your-username/str-console/main/deploy/vps-setup.sh | sudo bash

# 2. Clone and deploy
cd /var/www/str-console
git clone https://github.com/your-username/str-console.git .
cp .env.production.example .env.production
nano .env.production  # Add your credentials
bash deploy/vps-deploy.sh

# 3. Setup Nginx + SSL
sudo bash deploy/nginx-setup.sh
```

**Done!** Your app is live at https://your-domain.com

---

## 📋 Requirements

- Ubuntu 22.04+ VPS
- 2GB RAM minimum
- Domain name pointed to VPS IP
- Neon PostgreSQL database
- Clerk account
- OpenAI API key (optional)

---

## 📁 Script Overview

| Script | Purpose | Run As |
|--------|---------|--------|
| `vps-setup.sh` | Install Node, PM2, Nginx | `sudo` |
| `vps-deploy.sh` | Deploy application | Normal user |
| `nginx-setup.sh` | Configure Nginx + SSL | `sudo` |
| `update.sh` | Update deployment | Normal user |
| `backup.sh` | Create backup | `sudo` |
| `monitor.sh` | Check system status | Normal user |

---

## 🔧 Common Commands

```bash
# View logs
pm2 logs str-console

# Restart app
pm2 restart str-console

# Check status
pm2 status

# Monitor live
pm2 monit

# Update app
bash deploy/update.sh

# Create backup
sudo bash deploy/backup.sh

# Check health
bash deploy/monitor.sh
```

---

## 🆘 Quick Troubleshooting

**App not starting?**
```bash
pm2 logs str-console --lines 50
```

**Port 3000 busy?**
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

**Nginx error?**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

**Database issues?**
```bash
cat .env.production | grep DATABASE_URL
npx prisma db push
```

---

## 📞 Need Help?

See full documentation:
- [deploy/README.md](deploy/README.md) - Complete deployment guide
- [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) - Detailed instructions
- [OPERATIONS-MANUAL.md](OPERATIONS-MANUAL.md) - Day-to-day operations

---

**Ready to deploy? Run the scripts in order! 🎉**
