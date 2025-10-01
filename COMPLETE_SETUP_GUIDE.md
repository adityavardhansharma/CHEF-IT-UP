# 🚀 Complete Setup Guide - AI Chef Meal Planner

## ✅ What's Been Done Automatically

1. ✅ All dependencies installed (548 packages)
2. ✅ Convex database created and deployed
3. ✅ Database seeded with 95 pantry items
4. ✅ Clerk authentication configured
5. ✅ Sign-in/Sign-up pages with proper routing
6. ✅ Automatic user sync component created
7. ✅ Middleware configured for protected routes
8. ✅ Groq AI configured (GPT-OSS-120B model)
9. ✅ All UI components and pages built

---

## 🔧 What YOU Need to Do (15 minutes)

### Step 1: Get Clerk API Keys (7 minutes)

#### A. Create/Login to Clerk Account
1. Go to https://dashboard.clerk.com
2. Sign up or log in

#### B. Get Your API Keys
1. In Clerk dashboard, click on your application
2. Go to **API Keys** in the sidebar
3. Copy these two keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_`)
   - `CLERK_SECRET_KEY` (starts with `sk_test_`)

#### C. Configure JWT Template (CRITICAL)
1. Go to **JWT Templates** in sidebar
2. Click **"+ New template"**
3. Name it: `Convex`
4. In the claims box, paste:
```json
{
  "aud": "convex",
  "sub": "{{user.id}}",
  "name": "{{user.full_name}}",
  "email": "{{user.primary_email_address}}",
  "email_verified": "{{user.email_verified}}",
  "picture": "{{user.image_url}}",
  "username": "{{user.username}}"
}
```
5. Click **Apply changes**
6. **IMPORTANT**: In the dropdown at the top, **select "Convex" template** for your application

#### D. Configure Redirects
1. Go to **Configure** → **Paths** (in sidebar)
   - Verify or set:
     - Sign-in path: `/sign-in`
     - Sign-up path: `/sign-up`

2. **NO NEED** to set redirects in dashboard - already configured in code!

---

### Step 2: Get Groq API Key (3 minutes)

1. Go to https://console.groq.com
2. Sign up/Login (Google login works)
3. Click **API Keys** in sidebar
4. Click **Create API Key**
5. Name it: "AI Chef"
6. Copy the key (starts with `gsk_`)
7. **IMPORTANT**: Save it - you won't see it again!

---

### Step 3: Configure Environment Variables (2 minutes)

1. Open `.env.local` in your project root
2. Add your keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE

# Convex Database (Already set ✓)
NEXT_PUBLIC_CONVEX_URL=https://clever-hound-391.convex.cloud
CONVEX_DEPLOYMENT=dev:clever-hound-391

# Groq AI
GROQ_API_KEY=gsk_YOUR_KEY_HERE
```

**Example of what it should look like:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuYWljaGVmLmNvbQ
CLERK_SECRET_KEY=sk_test_AbCdEfGhIjKlMnOpQrStUvWxYz123456
NEXT_PUBLIC_CONVEX_URL=https://clever-hound-391.convex.cloud
CONVEX_DEPLOYMENT=dev:clever-hound-391
GROQ_API_KEY=gsk_AbCdEfGhIjKlMnOpQrStUvWxYz123456
```

---

### Step 4: Start the Application (1 minute)

Open TWO terminal windows:

**Terminal 1 - Start Convex:**
```bash
npx convex dev
```
Keep this running! You should see:
```
✔ Convex functions ready!
Watching for file changes...
```

**Terminal 2 - Start Next.js:**
```bash
pnpm dev
```

You should see:
```
✔ Ready in 2.5s
○ Local: http://localhost:3000
```

---

### Step 5: Test the Application (2 minutes)

1. **Open browser**: http://localhost:3000
2. **Click**: "Get Started Free"
3. **Sign up**: with your email
4. **You should**:
   - See sign-up form
   - Enter email + password
   - Verify email (check inbox)
   - Automatically redirect to `/dashboard`
   - See dashboard with stats! 🎉

---

## 🔍 How User Sync Works

```
1. User signs up with Clerk
           ↓
2. Clerk creates account
           ↓
3. User redirected to /dashboard
           ↓
4. UserSync component runs automatically
           ↓
5. Checks: Does user exist in Convex?
           ↓
6. If NO → Creates user + profile in Convex
           ↓
7. Dashboard loads with user data! ✅
```

**This happens automatically in milliseconds!**

---

## ✅ Verification Checklist

After signing up, verify everything works:

### 1. Check Convex Database
1. Go to: https://dashboard.convex.dev/d/clever-hound-391
2. Click **Data** tab
3. Click **users** table
4. You should see YOUR user! ✅

### 2. Check Dashboard
- ✅ Should see your name/email at top
- ✅ Should see "Active Meal Plan: None"
- ✅ Should see "Pantry Items: 0"
- ✅ Should see "Today's Meals" section

### 3. Test Profile
1. Click **Profile** in navigation
2. Should see your Clerk info
3. Try adding an allergy (e.g., "Peanuts")
4. Click "Save Changes"
5. Check Convex Dashboard → **userProfiles** table
6. Your profile should be there! ✅

### 4. Test Pantry
1. Click **Pantry** in navigation
2. Click **"Add Item"**
3. Search for "Chicken"
4. Select it, add quantity (e.g., 1 kg)
5. Click "Add to Pantry"
6. Should see it in your pantry! ✅

### 5. Test Meal Planning
1. Click **"New Meal Plan"**
2. Fill in the form:
   - Start date: Today
   - Duration: 3 days
   - Family size: 2
   - Select meals: Breakfast, Lunch, Dinner
   - Diet: Balanced
3. Click through steps
4. Click **"Generate Meal Plan"**
5. Wait 30-60 seconds
6. Should see AI-generated meals! ✅

---

## 🐛 Troubleshooting

### Issue: "Not authenticated" or stuck on landing page

**Cause**: JWT template not selected in Clerk

**Fix**:
1. Go to Clerk Dashboard → **JWT Templates**
2. Find your "Convex" template
3. In the dropdown at TOP of page, **select "Convex"**
4. Clear browser cookies
5. Try signing in again

### Issue: User created in Clerk but not in Convex

**Fix**:
1. Check browser console (F12) for errors
2. Look for "User synced to Convex!" message
3. If not there, refresh `/dashboard` page
4. Check Convex logs in dashboard

### Issue: "Environment variable not found"

**Fix**:
1. Verify all keys are in `.env.local`
2. NO spaces around `=` sign
3. NO quotes around values
4. Restart both terminal windows

### Issue: Convex functions not deploying

**Fix**:
```bash
# Stop convex
Ctrl+C

# Redeploy
npx convex dev --once

# Then restart
npx convex dev
```

### Issue: Groq API errors

**Cause**: Invalid API key or rate limit

**Fix**:
1. Verify key starts with `gsk_`
2. Check https://console.groq.com for usage
3. Free tier has limits - wait if exceeded

---

## 📊 What You Built

### Pages & Features:
- 🏠 Landing page
- 🔐 Sign-in/Sign-up (with Clerk)
- 📊 Dashboard with stats
- 🥘 Pantry management (search 95 items!)
- 👤 Profile with allergies & preferences
- 📅 AI meal plan wizard
- 🍳 Detailed recipe viewer
- 🔄 Meal regeneration with AI

### Technologies:
- ⚡ Next.js 14 (App Router)
- 🔐 Clerk (Auth)
- 🗄️ Convex (Real-time DB)
- 🤖 Groq AI (GPT-OSS-120B)
- 🎨 shadcn/ui + Tailwind
- 📦 TypeScript

---

## 🎯 Quick Reference

### Your URLs:
- **App**: http://localhost:3000
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Convex Dashboard**: https://dashboard.convex.dev/d/clever-hound-391
- **Groq Console**: https://console.groq.com

### Important Files:
- `.env.local` - Your API keys
- `middleware.ts` - Route protection
- `convex/schema.ts` - Database structure
- `components/user-sync.tsx` - Auto user sync
- `lib/groq.ts` - AI integration

### Commands:
```bash
# Start Convex
npx convex dev

# Start Next.js
pnpm dev

# View Convex logs
# (Opens in dashboard automatically)

# Stop servers
Ctrl+C
```

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Can sign up without errors
2. ✅ Redirected to `/dashboard` after sign-up
3. ✅ See your name/email in header
4. ✅ Can add items to pantry
5. ✅ Can generate meal plans
6. ✅ AI creates recipes successfully
7. ✅ User appears in both Clerk AND Convex dashboards

---

## 🆘 Still Having Issues?

1. **Check Terminal 1** (Convex):
   - Should say "Convex functions ready"
   - Look for error messages

2. **Check Terminal 2** (Next.js):
   - Should say "Ready"
   - Look for compilation errors

3. **Check Browser Console** (F12):
   - Look for network errors
   - Check for authentication errors

4. **Check Convex Dashboard**:
   - Go to **Logs** tab
   - Look for failed function calls

5. **Check Clerk Dashboard**:
   - Go to **Users** tab
   - Verify users are being created

---

## ✨ You're Ready!

Once you complete Steps 1-4 above, you'll have a fully functional AI-powered meal planning application!

**Total setup time**: ~15 minutes
**Result**: Production-ready app with AI, auth, and real-time database!

🚀 **Let's get cooking!** 👨‍🍳
