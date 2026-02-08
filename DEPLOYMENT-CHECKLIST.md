# STR Operations Console - Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Fill in all production environment variables
- [ ] Verify `DATABASE_URL` points to production Neon database
- [ ] Verify Clerk production keys (`pk_live_*` and `sk_live_*`)
- [ ] Verify OpenAI API key is production-ready with appropriate limits
- [ ] Set `NODE_ENV=production`

### 2. Database Setup
- [ ] Create production database on Neon
- [ ] Run `npm run db:push` to sync Prisma schema to production DB
- [ ] Run `npm run db:seed` to populate initial test data (optional)
- [ ] Verify all tables created successfully
- [ ] Check database indexes for performance

### 3. Code Quality
- [ ] Run `npm run lint` and fix all errors
- [ ] Run `npm run build` locally to test production build
- [ ] Check for TypeScript errors (`tsc --noEmit`)
- [ ] Review console warnings in dev mode
- [ ] Test all critical workflows (authentication, approval, messaging)

### 4. Security Review
- [ ] Verify all API routes use Clerk `auth()` middleware
- [ ] Check no sensitive data in client-side code
- [ ] Verify `.env` files are in `.gitignore`
- [ ] Review role-based access controls
- [ ] Test unauthorized access scenarios
- [ ] Ensure CORS is properly configured

### 5. Performance Optimization
- [ ] Enable Next.js production optimizations
- [ ] Verify image optimization is working
- [ ] Check bundle size with `npm run build`
- [ ] Test loading times on slow connections
- [ ] Verify proper caching headers
- [ ] Check for memory leaks in long-running pages

### 6. Third-Party Services
- [ ] Verify Clerk webhook endpoints (if any)
- [ ] Test OpenAI API connectivity
- [ ] Verify database connection pooling
- [ ] Check rate limits on all external APIs
- [ ] Set up monitoring/logging (e.g., Sentry)

## Deployment Steps

### Option 1: Vercel Deployment (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Initial Deployment**
   ```bash
   vercel --prod
   ```

3. **Environment Variables**
   - Go to Vercel dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env.production.example`
   - Ensure variables are set for "Production" environment

4. **Database Migration**
   - In Vercel dashboard, set `DATABASE_URL` environment variable
   - Trigger redeployment to run migrations

5. **Custom Domain (Optional)**
   - Go to Project → Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

### Option 2: Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t str-operations-console .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="your_db_url" \
     -e CLERK_SECRET_KEY="your_key" \
     str-operations-console
   ```

### Option 3: Self-Hosted

1. **Build Application**
   ```bash
   npm install
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm run start
   ```

3. **Configure Reverse Proxy (Nginx/Apache)**
   - Set up SSL certificate (Let's Encrypt)
   - Configure proxy pass to port 3000
   - Enable gzip compression

## Post-Deployment Verification

### 1. Functional Testing
- [ ] Test sign in/sign up flow
- [ ] Create a test user
- [ ] Create a test client
- [ ] Add a test property
- [ ] Send a test message
- [ ] Verify AI analysis works
- [ ] Approve/reject a message
- [ ] Check audit logs
- [ ] Test all CRUD operations (Templates, Auto Rules, Users)
- [ ] Verify KB search functionality

### 2. Performance Testing
- [ ] Test page load times (should be < 3 seconds)
- [ ] Verify mobile responsiveness
- [ ] Test with slow 3G connection
- [ ] Check lighthouse scores (aim for > 90)
- [ ] Monitor server response times

### 3. Security Testing
- [ ] Test unauthorized access (should redirect to sign-in)
- [ ] Verify role-based access (staff shouldn't access admin pages)
- [ ] Test SQL injection protection
- [ ] Verify XSS protection
- [ ] Check HTTPS enforcement

### 4. Monitoring Setup
- [ ] Set up error tracking (Sentry/Datadog)
- [ ] Configure uptime monitoring (Uptime Robot/Pingdom)
- [ ] Set up database performance monitoring
- [ ] Configure alert notifications
- [ ] Set up logging aggregation

## Rollback Plan

If deployment fails:

1. **Vercel**: Use Vercel dashboard → Deployments → Promote previous deployment
2. **Docker**: Revert to previous image tag
3. **Self-Hosted**: 
   ```bash
   git checkout <previous-commit>
   npm run build
   pm2 restart str-console
   ```

## Maintenance

### Regular Tasks
- Weekly: Review error logs and fix critical issues
- Monthly: Update dependencies (`npm audit fix`, `npm update`)
- Quarterly: Review database performance and optimize indexes
- Yearly: Rotate API keys and secrets

### Monitoring Metrics
- Error rate (should be < 1%)
- Response time (should be < 500ms p95)
- Database query time (should be < 100ms p95)
- User sign-up rate
- Message processing rate
- Approval turnaround time

## Support Contacts

- **Infrastructure**: [Your Team]
- **Database Issues**: [DB Admin]
- **Clerk Support**: https://clerk.com/support
- **Neon Support**: https://neon.tech/docs
- **OpenAI Support**: https://platform.openai.com/support

## Notes

- Always test in staging environment before production
- Keep backups of production database (Neon has automated backups)
- Document any manual database changes
- Communicate maintenance windows to users
