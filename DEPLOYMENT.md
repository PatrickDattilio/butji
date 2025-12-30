# Deployment Guide - Butji.com

## Recommended Hosting Options (AI-Neutral)

For an anti-AI website, here are better alternatives to AI-focused platforms:

### Option 1: Railway (Recommended - All-in-One)

Railway is independent, developer-friendly, and not AI-focused. Perfect for hosting both your app and database.

**Why Railway:**
- ✅ Independent platform, not owned by AI companies
- ✅ Simple deployment from GitHub
- ✅ Built-in PostgreSQL database
- ✅ Easy custom domain setup
- ✅ Free tier available
- ✅ No AI features pushed on you

### Prerequisites

1. **GitHub/GitLab/Bitbucket account** - Your code needs to be in a git repository
2. **Hosting account** - Choose from options below
3. **PostgreSQL database** - SQLite won't work on serverless platforms (or use Railway which includes it)

### Railway Deployment Steps

1. **Sign up at [railway.app](https://railway.app)**
   - Free tier: $5 credit/month
   - Pay-as-you-go pricing

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add PostgreSQL Database:**
   - In your project, click "New" → "Database" → "Add PostgreSQL"
   - Railway automatically creates `DATABASE_URL` environment variable

4. **Configure Environment Variables:**
   - Go to your service → Variables
   - Add:
     ```
     NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
     NEXTAUTH_URL=https://butji.com
     ADMIN_USERNAME=your-admin-username
     ADMIN_PASSWORD=your-secure-password
     ```

5. **Update Prisma Schema for PostgreSQL:**
   - Update `prisma/schema.prisma`:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```

6. **Deploy:**
   - Railway auto-detects Next.js
   - Build command is already configured in `package.json`
   - First deployment will run migrations automatically

7. **Add Custom Domain:**
   - Go to Settings → Networking
   - Add custom domain: `butji.com`
   - Railway provides DNS instructions
   - SSL certificate is automatic

8. **Run Migrations (if needed):**
   ```bash
   # Via Railway CLI
   railway run npx prisma migrate deploy
   
   # Or via Railway dashboard → Deployments → Run Command
   ```

### Option 2: Render

Render is another independent platform, good alternative.

**Why Render:**
- ✅ Independent company
- ✅ Free tier available
- ✅ Simple deployment
- ✅ PostgreSQL included

**Deployment Steps:**
1. Sign up at [render.com](https://render.com)
2. New → Web Service → Connect GitHub
3. Auto-detects Next.js
4. Add PostgreSQL database (separate service)
5. Configure environment variables
6. Add custom domain in settings

### Option 3: Fly.io

Fly.io is developer-friendly and not AI-focused.

**Why Fly.io:**
- ✅ Developer-first platform
- ✅ Global edge deployment
- ✅ PostgreSQL available
- ✅ Good free tier

**Deployment Steps:**
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Sign up: `fly auth signup`
3. Launch: `fly launch` (in your project directory)
4. Add PostgreSQL: `fly postgres create`
5. Attach database: `fly postgres attach <db-name>`
6. Deploy: `fly deploy`

### Option 4: DigitalOcean App Platform

More traditional, straightforward hosting.

**Why DigitalOcean:**
- ✅ Well-established, reliable
- ✅ No AI focus
- ✅ Managed PostgreSQL available
- ✅ Predictable pricing

**Deployment Steps:**
1. Sign up at [digitalocean.com](https://digitalocean.com)
2. Create → App Platform → GitHub
3. Select your repository
4. Add managed PostgreSQL database
5. Configure environment variables
6. Add custom domain

### Option 5: Self-Hosted (Most Control)

For maximum independence, self-host on a VPS.

**Recommended VPS Providers:**
- [Hetzner](https://hetzner.com) - European, privacy-focused
- [DigitalOcean Droplets](https://digitalocean.com) - Simple VPS
- [Linode](https://linode.com) - Developer-friendly

**Self-Hosting Setup:**
1. Rent a VPS (Ubuntu recommended)
2. Install Docker and Docker Compose
3. Use docker-compose for Next.js + PostgreSQL
4. Set up Nginx reverse proxy
5. Configure SSL with Let's Encrypt
6. Point DNS to your server IP

## Quick Comparison

| Platform | AI Focus | Ease | Cost | Database | Best For |
|----------|----------|------|------|----------|----------|
| **Railway** | None | ⭐⭐⭐⭐⭐ | $5/mo credit | Built-in | **Recommended** |
| **Render** | None | ⭐⭐⭐⭐ | Free tier | Separate | Good alternative |
| **Fly.io** | None | ⭐⭐⭐ | Free tier | Separate | Global edge |
| **DigitalOcean** | None | ⭐⭐⭐ | $5/mo+ | Managed | Traditional |
| **Self-Hosted** | None | ⭐⭐ | $5-10/mo | Self-managed | Maximum control |
| ~~Vercel~~ | Heavy | ⭐⭐⭐⭐⭐ | Free tier | Separate | Not recommended |

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Environment variables configured
- [ ] Domain connected and SSL active
- [ ] Test admin login works
- [ ] Test resource submission works
- [ ] Test admin panel functionality
- [ ] Update NEXTAUTH_URL to production domain
- [ ] Set up database backups

## Important Notes

1. **Never commit `.env` files** - Use environment variables in hosting platform
2. **Change default admin credentials** - Use strong passwords
3. **Generate secure NEXTAUTH_SECRET** - Use `openssl rand -base64 32`
4. **Database backups** - Set up regular backups for production data
5. **Monitoring** - Consider adding error tracking (Sentry, etc.)

## Quick Start Commands

```bash
# Generate secure secret
openssl rand -base64 32

# Test production build locally
npm run build
npm start

# Run migrations
npm run db:migrate
```

