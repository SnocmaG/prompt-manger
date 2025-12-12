# Prompt Branch Manager

A production-ready SaaS application for managing AI prompts with a Git-like branching system. Built with Next.js, Prisma, Clerk, and deployed on Render.com.

## Features

- 🌿 **Git-like Branching**: Create branches from live, edit safely, and deploy when ready
- 📝 **Version History**: Full audit trail with immutable versions
- 🚀 **One-Click Deploy**: Switch live branches instantly
- 🧪 **Test Before Deploy**: Test prompts before making them live
- 🔐 **Secure Authentication**: Google OAuth via Clerk
- 🌐 **External API**: Fetch live prompts from n8n or other automations
- 💎 **Premium UI**: Modern dashboard with shadcn/ui components

## Tech Stack

- **Frontend & Backend**: Next.js 15 (App Router), TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Auth**: Clerk (Google OAuth)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Hosting**: Render.com

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Clerk account (free tier available)

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/prompt_manager?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# API Security
API_SECRET_KEY=your-secure-random-key-here
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed demo data
npx prisma db seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` and sign in with Google.

## Database Setup

### Local Development

```bash
# Create migration
npx prisma migrate dev --name your_migration_name

# Reset database (warning: deletes all data)
npx prisma migrate reset

# Seed demo data
npx prisma db seed
```

### Production

```bash
# Deploy migrations
npx prisma migrate deploy
```

## Deployment to Render.com

### 1. Create PostgreSQL Database

1. Go to Render Dashboard → New → PostgreSQL
2. Choose a name (e.g., `prompt-manager-db`)
3. Select free tier or paid plan
4. Click "Create Database"
5. Copy the **Internal Database URL**

### 2. Create Web Service

1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name**: `prompt-manager`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`

### 3. Add Environment Variables

In the Render dashboard, add these environment variables:

- `DATABASE_URL`: Your PostgreSQL Internal Database URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: From Clerk dashboard
- `CLERK_SECRET_KEY`: From Clerk dashboard
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: `/sign-up`
- `API_SECRET_KEY`: Generate a secure random string

### 4. Deploy

Click "Create Web Service" and Render will automatically deploy your app.

### 5. Seed Production Database (Optional)

```bash
# Connect to your Render database and run seed
DATABASE_URL="your-render-db-url" npx prisma db seed
```

## API Documentation

### External API (for n8n)

**Endpoint**: `GET /api/prompts/live`

**Headers**:
- `x-api-key`: Your API_SECRET_KEY

**Query Parameters**:
- `clientId`: Workspace identifier
- `name`: Prompt name

**Example**:
```bash
curl -H "x-api-key: your-secret-key" \
  "https://your-app.onrender.com/api/prompts/live?clientId=demo-client&name=welcome_email"
```

**Response**:
```json
{
  "content": "Your prompt content...",
  "branchLabel": "Main",
  "versionLabel": "v3 – shorter intro",
  "updatedAt": "2024-01-15T10:30:00Z",
  "updatedBy": "john@example.com"
}
```

### Internal API Routes

- `GET /api/prompts` - List all prompts
- `POST /api/prompts` - Create new prompt
- `GET /api/prompts/[id]` - Get prompt details
- `POST /api/branches/create` - Create new branch
- `POST /api/versions/create` - Save new version
- `POST /api/branches/deploy` - Deploy branch to live
- `POST /api/branches/test` - Test branch with input

## Architecture

### Data Model

```
Prompt
  ├── branches[]
  │   ├── versions[]
  │   └── headVersionId
  └── liveBranchId
```

### Branching Flow

1. **Create Branch**: Copies content from live branch's head version
2. **Edit**: Create new immutable versions as you edit
3. **Test**: Test the branch without affecting live
4. **Deploy**: Switch `liveBranchId` to make branch live

### Security

- **Authentication**: All routes protected by Clerk except `/api/prompts/live`
- **Data Isolation**: Users only see their own `clientId` data
- **API Key**: External endpoint requires `x-api-key` header
- **Audit Trail**: All changes tracked with user info and timestamps

## Development

### Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout with Clerk
│   ├── page.tsx          # Main dashboard
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── branch-list.tsx   # Branch sidebar
│   ├── prompt-editor.tsx # Main editor
│   ├── version-history.tsx
│   ├── test-panel.tsx
│   └── dialogs/
├── lib/
│   ├── auth.ts           # Clerk helpers
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utilities
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
└── middleware.ts         # Clerk middleware
```

### Adding New Features

1. Update Prisma schema if needed
2. Create migration: `npx prisma migrate dev`
3. Add API routes in `app/api/`
4. Create UI components in `components/`
5. Update main page to use new features

## Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Regenerate Prisma client
npx prisma generate

# Rebuild
npm run build
```

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is running
- Ensure IP is whitelisted (for cloud databases)

### Clerk Authentication Issues

- Verify environment variables are set
- Check Clerk dashboard for correct domain
- Ensure redirect URLs are configured

## License

MIT

## Support

For issues or questions, please open a GitHub issue.
