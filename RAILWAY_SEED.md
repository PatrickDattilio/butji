# Seeding Railway Production Database

Your production database on Railway has the tables (migrations ran), but it's empty because the seed script hasn't been executed yet.

## Option 1: Using Railway Dashboard Terminal (Recommended)

The `railway run` command runs locally but tries to connect to Railway's internal database address, which isn't accessible from your local machine. Use Railway's web terminal instead:

1. Go to your Railway project dashboard: https://railway.app
2. Click on your **Next.js service** (not the database service)
3. Go to the **Deployments** tab
4. Click on the most recent deployment (or any deployment)
5. Click the **"View Logs"** button or look for a **"Shell"** / **"Terminal"** button
6. Alternatively, go to your service → **Settings** → **Service** → Look for **"Open Shell"** or similar
7. In the terminal, run:
   ```bash
   npm run db:seed
   ```

   This runs the command directly on Railway's infrastructure where the database is accessible.

## Option 2: Using Railway CLI with Public Database URL

If Railway CLI is failing because it can't reach the internal database address, you can temporarily use the public database connection string:

1. In Railway dashboard, go to your **PostgreSQL database service**
2. Go to the **Variables** tab
3. Find the `DATABASE_URL` - it might have both internal and public versions
4. Look for `PUBLIC_DATABASE_URL` or copy the connection string
5. If you only see the internal URL, you'll need to use Option 1 instead

1. Go to your Railway project dashboard
2. Click on your service (the Next.js app, not the database)
3. Go to the **Deployments** tab
4. Click on the most recent deployment
5. Click **"Run Command"** or **"Shell"** button
6. Run:
   ```bash
   npm run db:seed
   ```

## Option 3: Add Seed to Build Process (Future Deployments)

You can modify the `package.json` build script to automatically seed on first deploy, but be careful - you probably don't want to re-seed on every deploy since it could overwrite data.

## Verify It Worked

After running the seed script, check your production website - you should now see:
- 7 companies (OpenAI, Anthropic, Midjourney, etc.)
- 4 resources (Cara.app, r/antiai, Butlerian Jihad, Nightshade)

If you still see 0 items, check the Railway logs for any errors.
