# STR Operations Console - Deployment Guide

## Quick Start

This guide will help you deploy the STR Operations Console to production.

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database (Neon recommended)
- Clerk account for authentication
- OpenAI API key (optional, for AI features)
- Git installed

## Deployment Options

### Option 1: Vercel (Recommended for Quick Deployment)

**Step 1: Prepare Your Repository**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

**Step 2: Import to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Framework Preset: Next.js will be auto-detected

**Step 3: Configure Environment Variables**
In Vercel dashboard, add these environment variables:

```
DATABASE_URL=postgresql://user:password@your-db.neon.tech/str_console
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxx
CLERK_SECRET_KEY=sk_live_xxxx
OPENAI_API_KEY=sk-xxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

**Step 4: Deploy**
Click "Deploy" and wait for the build to complete (usually 2-3 minutes).

**Step 5: Run Database Migrations**
After first deployment:
```bash
# Install Vercel CLI
npm install -g vercel

# Link your project
vercel link

# Run migrations
vercel env pull .env.production
DATABASE_URL="<your-production-db-url>" npm run db:push
```

---

### Option 2: Docker Deployment

**Step 1: Build Image**
```bash
# Build the Docker image
docker build -t str-operations-console .

# Verify image was created
docker images | grep str-operations-console
```

**Step 2: Run with Docker Compose**
```bash
# Copy environment file
cp .env.production.example .env.production

# Edit .env.production with your values
nano .env.production

# Start services
docker-compose up -d

# View logs
docker-compose logs -f app
```

**Step 3: Run Migrations**
```bash
# Access container
docker-compose exec app sh

# Run migrations
npx prisma db push

# Exit container
exit
```

**Step 4: Access Application**
Open browser to `http://localhost:3000`

---

### Option 3: Self-Hosted (VPS/Dedicated Server)

**Step 1: Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx certbot python3-certbot-nginx
```

**Step 2: Clone and Setup Application**
```bash
# Create application directory
sudo mkdir -p /var/www/str-console
cd /var/www/str-console

# Clone repository
git clone <your-repo-url> .

# Install dependencies
npm install

# Copy and configure environment
cp .env.production.example .env.production
nano .env.production  # Edit with your values

# Generate Prisma client
npx prisma generate

# Run database migrations
npm run db:push

# Build application
npm run build
```

**Step 3: Configure PM2**
```bash
# Start application with PM2
pm2 start npm --name "str-console" -- start

# Configure PM2 to start on boot
pm2 startup
pm2 save
```

**Step 4: Configure Nginx**
Create file `/etc/nginx/sites-available/str-console`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and get SSL:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/str-console /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

---

## Database Setup (Neon - Recommended)

**Step 1: Create Neon Project**
1. Go to [neon.tech](https://neon.tech)
2. Sign up/Login
3. Click "Create Project"
4. Choose region closest to your users
5. Project name: "STR Operations Console"

**Step 2: Get Connection String**
1. Go to project dashboard
2. Click "Connection Details"
3. Copy the connection string (starts with `postgresql://`)
4. Add to your `.env.production` as `DATABASE_URL`

**Step 3: Run Migrations**
```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://..."

# Push schema to database
npm run db:push

# Verify tables created
npm run db:studio
```

---

## Clerk Setup (Authentication)

**Step 1: Create Clerk Application**
1. Go to [clerk.com](https://clerk.com)
2. Create account/Login
3. Click "Add Application"
4. Name: "STR Operations Console"
5. Choose authentication methods (Email, Google, etc.)

**Step 2: Get API Keys**
1. Go to application dashboard
2. Navigate to "API Keys"
3. Copy "Publishable Key" (starts with `pk_live_` or `pk_test_`)
4. Copy "Secret Key" (starts with `sk_live_` or `sk_test_`)

**Step 3: Configure Clerk**
1. Go to "Paths" section
2. Set "Sign in URL": `/sign-in`
3. Set "Sign up URL": `/sign-up`
4. Set "After sign in": `/dashboard`
5. Set "After sign up": `/dashboard`

**Step 4: Configure Production Domain**
1. Go to "Domains" section
2. Add your production domain
3. Set as primary domain

---

## OpenAI Setup (Optional - For AI Features)

**Step 1: Get API Key**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account/Login
3. Navigate to "API Keys"
4. Click "Create new secret key"
5. Copy key (starts with `sk-`)

**Step 2: Configure Billing**
1. Go to "Billing" section
2. Add payment method
3. Set usage limits (recommended: $50/month)

**Step 3: Test Integration**
```bash
# Set environment variable
export OPENAI_API_KEY="sk-..."

# Start dev server
npm run dev

# Test by sending a message in Inbox
```

---

## Post-Deployment Testing

### 1. Smoke Tests
```bash
# Health check
curl https://your-domain.com/api/health

# Authentication test
# - Visit your-domain.com
# - Should redirect to sign-in
# - Sign up with test user
# - Should redirect to /dashboard
```

### 2. Functional Tests
- [ ] Sign in/Sign up works
- [ ] Dashboard loads
- [ ] Create a client
- [ ] Add a property
- [ ] Send a test message
- [ ] Verify AI analysis (if OpenAI configured)
- [ ] Approve/reject a message
- [ ] Check audit logs
- [ ] Test all CRUD pages (Templates, Auto Rules, Users)
- [ ] Verify dark mode toggle

### 3. Performance Tests
```bash
# Lighthouse test (aim for >90 score)
npx lighthouse https://your-domain.com --view

# Load test (optional)
npm install -g artillery
artillery quick --count 10 -n 20 https://your-domain.com
```

---

## Monitoring & Maintenance

### Setup Monitoring (Recommended)

**1. Error Tracking - Sentry**
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**2. Uptime Monitoring - UptimeRobot**
- Sign up at [uptimerobot.com](https://uptimerobot.com)
- Add HTTP monitor for your domain
- Set alert email

**3. Database Monitoring**
- Neon dashboard shows query performance
- Set up alerts for high CPU/memory usage

### Regular Maintenance

**Weekly:**
- Check error logs in Vercel/PM2
- Review database size and performance
- Monitor API usage (OpenAI, Clerk)

**Monthly:**
- Update dependencies: `npm update`
- Security audit: `npm audit fix`
- Review and optimize slow queries

**Quarterly:**
- Rotate API keys and secrets
- Review and optimize database indexes
- Performance audit with Lighthouse

---

## Troubleshooting

### Build Fails

**Error: Prisma Client not generated**
```bash
npx prisma generate
npm run build
```

**Error: Module not found**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database Connection Issues

**Error: Connection timeout**
- Check DATABASE_URL format
- Verify Neon database is running
- Check connection pooling settings
- Ensure SSL is enabled: `?sslmode=require`

**Error: Too many connections**
- Use connection pooling in Neon
- Configure max connections in Prisma schema

### Clerk Authentication Issues

**Error: Clerk keys invalid**
- Verify using production keys (`pk_live_`, `sk_live_`)
- Check domain is added in Clerk dashboard
- Ensure environment variables are set correctly

**Error: Redirect loop**
- Check NEXT_PUBLIC_CLERK_* URLs match your domain
- Verify middleware.ts is configured correctly

### OpenAI API Issues

**Error: Rate limit exceeded**
- Check OpenAI usage dashboard
- Increase rate limits or add billing
- Implement request queuing/throttling

**Error: Invalid API key**
- Verify key starts with `sk-`
- Check key hasn't been rotated
- Ensure key has proper permissions

---

## Rollback Procedure

### Vercel
```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

### Docker
```bash
# Stop current container
docker-compose down

# Restore previous image
docker tag str-operations-console:backup str-operations-console:latest
docker-compose up -d
```

### Self-Hosted
```bash
# Stop application
pm2 stop str-console

# Rollback code
git log  # Find previous commit
git checkout <commit-hash>

# Rebuild
npm run build
pm2 restart str-console
```

---

## Support & Resources

- **Documentation**: `README.md` in project root
- **Deployment Checklist**: `DEPLOYMENT-CHECKLIST.md`
- **Workflow Testing**: `WORKFLOW-TEST-GUIDE.md`
- **Clerk Docs**: https://clerk.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Rotate keys quarterly
3. **Database**: Enable SSL connections
4. **Authentication**: Use Clerk's MFA features
5. **CORS**: Configure allowed origins
6. **Rate Limiting**: Implement for public APIs
7. **Monitoring**: Set up Sentry for error tracking
8. **Backups**: Neon auto-backs up, but export manually too

---

## Need Help?

If you encounter issues not covered in this guide:

1. Check `DEPLOYMENT-CHECKLIST.md` for detailed steps
2. Review application logs
3. Check service status (Vercel, Neon, Clerk)
4. Contact your infrastructure team

**Happy Deploying! 🚀**
