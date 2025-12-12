# 🚀 YOUR RENDER DEPLOYMENT - COPY & PASTE GUIDE

## Step 1: Create PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Fill in these exact values:

```
Name: prompt-manager-db
Database: prompt_manager
User: prompt_manager
Region: <choose closest to you>
Plan: Free
```

3. Click **"Create Database"**
4. **WAIT 2 minutes** for it to finish
5. Click on the database → Copy the **"Internal Database URL"**
6. Save it somewhere - you'll need it in Step 2!

---

## Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect GitHub (if not already) → Select **`prompt-manager`** repo
3. Fill in:

```
Name: prompt-manager
Region: <same as database>
Branch: main
Root Directory: <leave empty>
Runtime: Node
```

4. **Build Command** (copy exactly):
```
npm install && npx prisma generate && npx prisma migrate deploy
```

5. **Start Command** (copy exactly):
```
npm start
```

6. **Plan**: Free

---

## Step 3: Add Environment Variables

Click **"Advanced"** or scroll down to **"Environment Variables"**

Add these **6 variables** (click "Add Environment Variable" for each):

### Variable 1:
```
Key: DATABASE_URL
Value: <paste the Internal Database URL from Step 1>
```

### Variable 2:
```
Key: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
Value: pk_test_Z3JhdGVmdWwtY3Jhd2RhZC03MC5jbGVyay5hY2NvdW50cy5kZXYk
```

### Variable 3:
```
Key: CLERK_SECRET_KEY
Value: sk_test_l04uQOLpEYAEhPhZY2RzSy7HSaoF7b9x0ZWCNMSUyx
```

### Variable 4:
```
Key: NEXT_PUBLIC_CLERK_SIGN_IN_URL
Value: /sign-in
```

### Variable 5:
```
Key: NEXT_PUBLIC_CLERK_SIGN_UP_URL
Value: /sign-up
```

### Variable 6:
```
Key: API_SECRET_KEY
Value: <SEE BELOW - generated for you>
```

---

## Your Generated API_SECRET_KEY:

```
FQ302ZqTfBHG4MtWUIARAdGy9Aq57Qxw0hZxJxOVFA4=
```

**Copy the key above** and use it for Variable 6!

---

## Step 4: Deploy!

1. Click **"Create Web Service"**
2. **Wait 5-10 minutes** for deployment
3. Watch the logs - you'll see it building

---

## Step 5: Configure Clerk Domain

Once deployed, Render will give you a URL like: `https://prompt-manager-xxxx.onrender.com`

1. Copy that URL
2. Go back to Clerk dashboard
3. Go to **"Domains"**
4. Click **"Add domain"**
5. Paste your Render URL
6. Save

---

## ✅ Done!

Your app will be live at your Render URL!

Test it:
1. Visit the URL
2. Sign in with Google
3. Create a branch
4. Edit a prompt
5. Deploy to live!
