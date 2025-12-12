# 🚀 Prompt Manager - Complete Deployment Checklist

Use this checklist to deploy your app step-by-step.

## ☐ Step 1: GitHub Setup (5 min)

- [ ] Go to https://github.com/new
- [ ] Create repository named `prompt-manager`
- [ ] Run the setup script:
  ```bash
  ./scripts/setup-github.sh
  ```
- [ ] Verify code is on GitHub

## ☐ Step 2: Clerk Setup (5 min)

- [ ] Sign up at https://clerk.com
- [ ] Create new application "Prompt Manager"
- [ ] Enable Google OAuth in Social Connections
- [ ] Copy API keys:
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - [ ] `CLERK_SECRET_KEY`
- [ ] Save keys somewhere safe (you'll need them for Render)

## ☐ Step 3: Render.com Setup (10 min)

### Database:
- [ ] Sign up at https://render.com
- [ ] Create new PostgreSQL database
  - [ ] Name: `prompt-manager-db`
  - [ ] Plan: Free
- [ ] Copy Internal Database URL

### Web Service:
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Configure:
  - [ ] Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
  - [ ] Start command: `npm start`
- [ ] Add environment variables (see ENV_SETUP.md)
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (~5-10 min)

## ☐ Step 4: Configure Clerk Domain (2 min)

- [ ] Go back to Clerk dashboard
- [ ] Add your Render URL to allowed domains
- [ ] Update redirect URLs

## ☐ Step 5: Test Your App (5 min)

- [ ] Visit your Render URL
- [ ] Sign in with Google
- [ ] Create a test branch
- [ ] Edit and save a version
- [ ] Test the AI feature
- [ ] Deploy a branch to live

## ☐ Step 6: Test External API (2 min)

```bash
curl -H "x-api-key: YOUR_API_SECRET_KEY" \
  "https://your-app.onrender.com/api/prompts/live?clientId=demo-client&name=welcome_email"
```

- [ ] Verify API returns prompt content

## ✅ Done!

Your app is live and ready to use!

---

## 📝 Optional Steps

### Add AI Testing:
- [ ] Get OpenAI API key from platform.openai.com
- [ ] Get Anthropic API key from console.anthropic.com
- [ ] Add keys to Render environment variables
- [ ] Restart web service

### Seed Demo Data:
- [ ] Open Render Shell
- [ ] Run: `npm run db:seed`

### Custom Domain:
- [ ] Purchase domain
- [ ] Add to Render
- [ ] Update Clerk allowed domains

---

## 🆘 Need Help?

See DEPLOYMENT.md for detailed instructions and troubleshooting.
