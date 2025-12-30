# Butji.com

A curated collection of anti-AI tools, websites, and resources to help organize the effort against the machines.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Set up the database:

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations to create the database
npm run db:migrate

# Seed the database with initial data
npm run db:seed
```

Create a `.env.local` file (see `.env.example` for reference):

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js app directory with pages and layouts
- `components/` - React components (ResourceCard, SearchBar, CategoryFilter, SubmissionForm)
- `lib/` - Utility functions for managing resources and submissions (Prisma client)
- `prisma/` - Prisma schema, migrations, and seed files
- `types/` - TypeScript type definitions
- `app/api/` - API routes for submissions and resources
- `data/` - Legacy folder (no longer used - data now stored in database)

## Adding Resources

### Method 1: Direct Edit (Admin)
Edit `data/resources.ts` to add new resources directly. Each resource should have:
- `id`: Unique identifier
- `title`: Resource name
- `description`: Brief description
- `url`: Link to the resource
- `category`: One of: tool, website, article, community, service, extension, other
- `tags`: Array of tags (detection, protection, privacy, verification, education, advocacy, research, legal)
- `featured`: Optional boolean for featured resources
- `approved`: Set to `true` for resources to appear on the site

### Method 2: Submission System (Public)
Users can submit resources through the `/submit` page. Submissions are stored in the database and require admin approval before appearing on the site.

## Admin Panel

Access the admin panel at `/admin` to:
- Review pending submissions
- Approve or reject submissions
- View all submissions (pending, approved, rejected)
- Delete submissions

**Note:** In production, you should add authentication to protect the admin panel. The current implementation is open to anyone who knows the URL.

## Deployment

**Quick Deploy:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Recommended: Railway (AI-Neutral, All-in-One)

1. Push code to GitHub
2. Sign up at [Railway](https://railway.app)
3. Deploy from GitHub (auto-detects Next.js)
4. Add PostgreSQL database (built-in)
5. Configure environment variables
6. Connect your domain (butji.com)

**Why Railway:** Independent platform, not AI-focused, includes database, easy setup.

### Other AI-Neutral Options

- [Render](https://render.com) - Independent platform, free tier
- [Fly.io](https://fly.io) - Developer-friendly, global edge
- [DigitalOcean App Platform](https://digitalocean.com) - Traditional, reliable
- Self-hosted VPS - Maximum control and independence

**Important:** You'll need to switch from SQLite to PostgreSQL for production. See DEPLOYMENT.md for details.

## Database

This project uses **Prisma** with **SQLite** for data storage. The database schema includes:
- `Resource` - Approved resources displayed on the site
- `Submission` - User-submitted resources awaiting review

### Database Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database:
   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Run migrations
   npm run db:migrate

   # Seed the database with initial data
   npm run db:seed
   ```

3. Environment variables (`.env.local`):
   ```env
   DATABASE_URL="file:./dev.db"
   ```

### Database Commands

- `npm run db:migrate` - Create and run migrations
- `npm run db:generate` - Generate Prisma Client
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio (database GUI)

### Migrating to PostgreSQL (Production)

To use PostgreSQL in production:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Set `DATABASE_URL` to your PostgreSQL connection string

3. Run migrations:
   ```bash
   npm run db:migrate
   ```

## Authentication

The admin panel is protected with NextAuth.js. To set up authentication:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root directory:
   ```env
   NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production
   NEXTAUTH_URL=http://localhost:3000
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password
   ```

3. Generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```

4. Access the admin panel at `/admin` - you'll be redirected to `/login` if not authenticated.

**Default credentials (development only):**
- Username: `admin`
- Password: `admin`

**⚠️ Important:** Change the default credentials in production by setting `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables.

## Features

- ✅ Resource listing with search and filtering
- ✅ Public submission form
- ✅ Admin review queue with authentication
- ✅ Approval/rejection workflow
- ✅ Responsive design with cyberpunk theme
- ✅ Category and tag filtering

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React** - UI library


