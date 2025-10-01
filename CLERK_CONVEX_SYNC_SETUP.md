# 🔐 Complete Clerk + Convex Sync Setup Guide

## 🚨 Current Issue
Users sign in with Clerk but aren't synced to Convex database, causing the app to hang on the landing page.

## ✅ Complete Solution

### Step 1: Update Middleware (Already Done)

Your `middleware.ts` is correct:
```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### Step 2: Environment Variables Required

Add to your `.env.local`:

```env
# Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...  # Get this from Clerk Webhooks section

# Convex
NEXT_PUBLIC_CONVEX_URL=https://clever-hound-391.convex.cloud
CONVEX_DEPLOYMENT=dev:clever-hound-391

# Groq
GROQ_API_KEY=gsk_...
```

### Step 3: Clerk Dashboard Configuration

#### A. JWT Template Setup
1. Go to https://dashboard.clerk.com
2. Navigate to **JWT Templates**
3. Click **"+ New template"** or select "Convex" template
4. Name: `Convex`
5. Add claims:
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
6. **Important**: In the dropdown at top, select this template for your application

#### B. Configure Paths & Redirects
1. Go to **Configure** → **Paths**
   - Sign-in path: `/sign-in`
   - Sign-up path: `/sign-up`
   - Sign-in fallback redirect: `/dashboard`
   - Sign-up fallback redirect: `/dashboard`

2. Go to **Configure** → **Domains**
   - Add: `localhost:3000` (for development)

### Step 4: Set Up Clerk Webhook (CRITICAL)

#### A. Create Webhook in Clerk Dashboard

1. Go to **Webhooks** in Clerk dashboard
2. Click **"+ Add Endpoint"**
3. **Endpoint URL**: 
   - For development: Use ngrok or similar
   - Run: `npx convex dev` and note the URL
   - Or use: `https://your-convex-url.convex.site/api/clerk-webhook`
4. **Events to listen to**:
   - ✅ `user.created`
   - ✅ `user.updated`  
   - ✅ `user.deleted`
5. Copy the **Signing Secret** (starts with `whsec_`)
6. Add it to `.env.local` as `CLERK_WEBHOOK_SECRET`

### Step 5: Convex HTTP Route for Webhooks

The webhook handler has been created at `app/api/webhooks/clerk/route.ts`.

### Step 6: Automatic User Sync Component

A `UserSync` component has been added to automatically create users in Convex when they first sign in.

## 🔄 How It Works

```
User Signs Up/In with Clerk
           ↓
Clerk JWT Token Generated
           ↓
User Lands on /dashboard
           ↓
UserSync Component Runs
           ↓
Checks if user exists in Convex
           ↓
If not, creates user automatically
           ↓
Dashboard loads with user data
```

## 🧪 Testing the Setup

### Test 1: Sign Up New User
1. Start dev server: `pnpm dev`
2. Go to http://localhost:3000
3. Click "Get Started Free"
4. Sign up with email
5. Should redirect to `/dashboard`
6. Check Convex Dashboard → **Data** → **users** table
7. Your user should appear!

### Test 2: Check User Profile
1. After signing in, go to `/dashboard/profile`
2. Should see your Clerk info (name, email)
3. Add some allergies or preferences
4. Check Convex Dashboard → **Data** → **userProfiles** table

### Test 3: Webhook (Optional)
1. Create a test user in Clerk dashboard
2. Check your Next.js terminal for webhook logs
3. Verify user appears in Convex

## 🐛 Troubleshooting

### Issue: User Created in Clerk but Not in Convex

**Solution 1: Check Convex Auth Config**
```bash
npx convex dev
```
Look for: "Authentication configured with Clerk"

**Solution 2: Check Browser Console**
Open DevTools → Console, look for:
- ✅ "User synced to Convex!"
- ❌ Error messages

**Solution 3: Check Convex Dashboard**
Go to https://dashboard.convex.dev/d/clever-hound-391
- Click **Logs**
- Look for `createUser` calls
- Check for errors

### Issue: Stuck on Landing Page

**Cause**: User signed in with Clerk but not in Convex, queries return `null`

**Fix**: The `UserSync` component will automatically create the user. If it doesn't:

1. Open browser console
2. Look for errors
3. Manually trigger sync by refreshing `/dashboard`

### Issue: "Not Authenticated" Errors

**Cause**: JWT template not selected or misconfigured

**Fix**:
1. Go to Clerk Dashboard → JWT Templates
2. Select "Convex" template from dropdown at top
3. Ensure `"aud": "convex"` is in claims
4. Clear browser cache and try again

## 📊 Verification Checklist

Run through this checklist:

- [ ] Clerk publishable key in `.env.local`
- [ ] Clerk secret key in `.env.local`
- [ ] Convex URL in `.env.local`
- [ ] JWT template created with name "Convex"
- [ ] JWT template selected for your application
- [ ] Paths configured in Clerk (`/sign-in`, `/sign-up`)
- [ ] Redirects set to `/dashboard`
- [ ] Convex auth.config.js deployed
- [ ] `pnpm dev` running
- [ ] Can sign in successfully
- [ ] Redirected to dashboard after sign-in
- [ ] User appears in Convex users table
- [ ] Profile page shows user info

## 🎯 Expected Behavior

After proper setup:

1. ✅ Sign up → Redirects to `/dashboard`
2. ✅ User created in both Clerk AND Convex
3. ✅ Dashboard shows user stats
4. ✅ Profile page loads with Clerk info
5. ✅ Can add pantry items
6. ✅ Can create meal plans

## 🔗 Quick Links

- **Your Clerk Dashboard**: https://dashboard.clerk.com
- **Your Convex Dashboard**: https://dashboard.convex.dev/d/clever-hound-391
- **Clerk Docs**: https://clerk.com/docs/quickstarts/nextjs
- **Convex + Clerk Guide**: https://clerk.com/docs/integrations/databases/convex

---

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies (already done)
pnpm install

# 2. Start Convex dev server
npx convex dev

# 3. In another terminal, start Next.js
pnpm dev

# 4. Open browser
http://localhost:3000

# 5. Sign up and test!
```

**Status**: Setup complete, ready for testing once you add API keys!
