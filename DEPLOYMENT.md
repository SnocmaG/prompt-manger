# Deployment Guide - Prompt Manager

## 🎯 Quick Start Deployment

Follow these steps in order to get your app live on Render.com.

---

## Step 1: Push to GitHub (5 minutes)

### Option A: Using the Script (Easiest)

```bash
chmod +x scripts/setup-github.sh
./scripts/setup-github.sh
```

### Option B: Manual Setup

1. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Name: `prompt-manager`
   - Visibility: Public or Private (your choice)
   - **Don't** initialize with README
   - Click "Create repository"

2. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/prompt-manager.git
   git branch -M main
   git push -u origin main
   ```

✅ **Checkpoint**: Your code should now be visible on GitHub

---

## Step 2: Set Up Clerk Authentication (5 minutes)

1. **Sign up for Clerk**:
   - Go to https://clerk.com
   - Click "Start Building for Free"
   - Sign up with GitHub or email

2. **Create an application**:
   - Click "Add application"
   - Name it "Prompt Manager"
   - Select "Next.js" as the framework
   - Click "Create application"

3. **Enable Google OAuth**:
   - In your Clerk dashboard, go to "User & Authentication" → "Social Connections"
   - Toggle ON "Google"
   - Click "Save"

4. **Copy your API keys**:
   - Go to "API Keys" in the sidebar
   - Copy these two values (you'll need them for Render):
     ```
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
     CLERK_SECRET_KEY=sk_test_...
     ```

✅ **Checkpoint**: You have your Clerk API keys copied

---

## Step 3: Deploy to Render.com (10 minutes)

### 3.1 Sign Up for Render

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended - easier integration)

### 3.2 Create PostgreSQL Database

1. In Render dashboard, click "New +"
2. Select "PostgreSQL"
3. Configure:
   - **Name**: `prompt-manager-db`
   - **Database**: `prompt_manager`
   - **User**: `prompt_manager`
   - **Region**: Choose closest to you
   - **Plan**: Free (or paid if you prefer)
4. Click "Create Database"
5. **Wait** for it to be created (takes ~2 minutes)
6. Once ready, copy the **Internal Database URL** (you'll need this)

### 3.3 Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository:
   - Click "Connect account" if needed
   - Select your `prompt-manager` repository
3. Configure the service:
   - **Name**: `prompt-manager`
   - **Region**: Same as your database
   - **Branch**: `main`
   - **Root Directory**: (leave empty)
   - **Runtime**: `Node`
   - **Build Command**:
     ```
     npm install && npx prisma generate && npx prisma migrate deploy
     ```
   - **Start Command**:
     ```
     npm start
     ```
   - **Plan**: Free (or paid if you prefer)

4. **Add Environment Variables** (click "Advanced" or scroll down):

   Click "Add Environment Variable" for each of these:

   ```
   DATABASE_URL=<paste Internal Database URL from step 3.2>
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<from Clerk>
   CLERK_SECRET_KEY=<from Clerk>
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   API_SECRET_KEY=<generate a random string, e.g., use: openssl rand -base64 32>
   ```

   **Optional - for AI testing**:
   ```
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   ```

5. Click "Create Web Service"

6. **Wait for deployment** (~5-10 minutes)
   - Render will build and deploy your app
   - You can watch the logs in real-time

✅ **Checkpoint**: Your app is deploying!

---

## Step 4: Configure Clerk Domain (2 minutes)

1. Go back to your Clerk dashboard
2. Navigate to "Domains"
3. Add your Render URL:
   - Click "Add domain"
   - Enter: `https://your-app-name.onrender.com`
   - Click "Add domain"

4. Update allowed redirect URLs:
   - Go to "Paths" in Clerk dashboard
   - Add your Render URL to allowed origins

✅ **Checkpoint**: Clerk is configured for your deployed app

---

## Step 5: Seed Demo Data (Optional, 2 minutes)

1. In Render dashboard, go to your web service
2. Click "Shell" tab
3. Run:
   ```bash
   npm run db:seed
   ```

Or connect to your database directly and run the seed script.

✅ **Checkpoint**: You have demo data to test with

---

## 🎉 You're Live!

Your app is now deployed at: `https://your-app-name.onrender.com`

### Test It Out:

1. Visit your Render URL
2. Click "Sign in with Google"
3. Create a branch
4. Edit a prompt
5. Test with AI (if you added API keys)
6. Deploy to live
7. Test the external API:
   ```bash
   curl -H "x-api-key: YOUR_API_SECRET_KEY" \
     "https://your-app.onrender.com/api/prompts/live?clientId=demo-client&name=welcome_email"
   ```

---

## 🔧 Troubleshooting

### Build Fails
- Check the build logs in Render
- Ensure all environment variables are set
- Verify DATABASE_URL is correct

### Can't Sign In
- Check Clerk domain configuration
- Verify Clerk API keys in Render
- Check browser console for errors

### Database Connection Issues
- Verify DATABASE_URL is the Internal URL (not External)
- Check database is running in Render
- Try restarting the web service

### Need Help?
- Check Render logs for errors
- Verify all environment variables
- Ensure GitHub repo is up to date

---

## 📱 Using the External API (for n8n)

Once deployed, you can call the live prompt API from n8n or any other service:

```
GET https://your-app.onrender.com/api/prompts/live?clientId=demo-client&name=welcome_email
Headers: x-api-key: YOUR_API_SECRET_KEY
```

This returns the current live prompt content for use in your automations!

---

## 🚀 Next Steps

- Add more prompts
- Create branches and test
- Integrate with n8n
- Add AI API keys for real testing
- Invite team members (via Clerk)
