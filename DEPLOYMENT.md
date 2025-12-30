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
   - Click on your service (the Next.js app, not the database)
   - Go to the **Variables** tab
   - Railway automatically adds `DATABASE_URL` when you add a PostgreSQL database (you don't need to set this manually)
   - Click **+ New Variable** and add each of these:
     - **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32` (or use Railway's "Generate" button)
     - **NEXTAUTH_URL**: Your production URL (e.g., `https://butji.com` or Railway's preview URL initially)
     - **ADMIN_USERNAME**: Your admin username for login
     - **ADMIN_PASSWORD**: A strong password for admin access
   - **Note**: After adding variables, Railway will automatically redeploy your service

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

7. **Add Custom Domain & Configure DNS:**
   
   **In Railway:**
   - Go to your service → Settings → Networking
   - Click "Add Custom Domain"
   - Enter your domain: `butji.com` (and optionally `www.butji.com`)
   - Railway will provide you with a CNAME target (looks like: `xxxxx.railway.app`)
   
   **In Your DNS Provider (where you bought butji.com):**
   
   You have two options depending on what your DNS provider supports:
   
   **Option A: CNAME Record (Recommended)**
   - Type: `CNAME`
   - Name/Host: `@` (or root domain, or leave blank - depends on your DNS provider)
   - Value/Target: The CNAME target Railway provided (e.g., `xxxxx.railway.app`)
   - TTL: 3600 (or default)
   
   **Option B: A Record (If CNAME not supported for root domain)**
   - Type: `A`
   - Name/Host: `@` (root domain)
   - Value/Target: Railway's IP address (Railway will show this in the domain settings)
   - TTL: 3600
   
   **For www subdomain (optional):**
   - Type: `CNAME`
   - Name/Host: `www`
   - Value/Target: Same CNAME target from Railway
   - TTL: 3600
   
   **DNS Propagation:**
   - Changes can take 5 minutes to 48 hours to propagate
   - Usually takes 15-30 minutes
   - You can check propagation status at: https://dnschecker.org
   
   **SSL Certificate:**
   - Railway automatically provisions SSL certificates via Let's Encrypt
   - Certificate is issued automatically once DNS is configured correctly
   - No manual SSL setup required
   
   **Troubleshooting SSL Certificate Errors:**
   
   If you see `ERR_CERT_COMMON_NAME_INVALID` or similar SSL errors:
   
   1. **Verify DNS is pointing to Railway:**
      - Check DNS propagation: https://dnschecker.org
      - Make sure your domain resolves to Railway's servers
      - Wait 15-30 minutes after DNS changes
   
   2. **Verify domain is added in Railway:**
      - Go to Settings → Networking
      - Confirm `butji.com` is listed and shows "Active" or "Provisioning"
      - If it shows an error, check the error message
   
   3. **Use the correct URL:**
      - Access `https://butji.com` (not the Railway preview URL)
      - Make sure you're using `https://` not `http://`
      - Don't access via `xxxxx.railway.app` - that will show certificate errors
   
   4. **Wait for certificate provisioning:**
      - Railway needs DNS to be correct before issuing certificates
      - Can take 5-15 minutes after DNS is correct
      - Check Railway dashboard for certificate status
   
   5. **Clear browser cache:**
      - SSL errors can be cached by browsers
      - Try incognito/private mode
      - Clear SSL state: Chrome → Settings → Privacy → Clear browsing data → Cached images and files
   
   6. **Check Railway logs:**
      - Look for SSL/certificate errors in Railway deployment logs
      - Railway will show certificate provisioning status

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

