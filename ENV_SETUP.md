# Quick Reference - Environment Variables

Copy these to Render.com when deploying:

## Required Variables

```bash
# Database (auto-filled by Render when you connect the database)
DATABASE_URL=postgresql://...

# Clerk Authentication (get from clerk.com dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# API Security (generate with: openssl rand -base64 32)
API_SECRET_KEY=your-random-secure-key
```

## Optional Variables (for AI Testing)

```bash
# OpenAI (get from platform.openai.com)
OPENAI_API_KEY=sk-...

# Anthropic (get from console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-...
```

---

## How to Get Each Key:

### Clerk Keys
1. Go to https://clerk.com
2. Create account and application
3. Go to "API Keys" in dashboard
4. Copy both keys

### OpenAI Key (Optional)
1. Go to https://platform.openai.com
2. Sign up / Sign in
3. Go to API keys section
4. Create new key
5. Copy it (you won't see it again!)

### Anthropic Key (Optional)
1. Go to https://console.anthropic.com
2. Sign up / Sign in
3. Go to API keys
4. Create new key
5. Copy it

### API Secret Key
Generate a secure random string:
```bash
openssl rand -base64 32
```
Or use any random string generator.
