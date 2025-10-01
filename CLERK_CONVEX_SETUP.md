# 🔐 Clerk + Convex Authentication Setup

## ✅ Your Clerk Configuration

Based on your Clerk instance, here's your configuration:

- **Clerk Domain**: `clean-lion-95.clerk.accounts.dev`
- **JWKS Endpoint**: https://clean-lion-95.clerk.accounts.dev/.well-known/jwks.json

## 📋 Step-by-Step Setup

### Step 1: Configure Clerk JWT Template

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **JWT Templates** (in the sidebar under "Configure")
3. Click **"+ New template"** or edit existing "Convex" template
4. Set **Name**: `Convex`
5. Set **Token lifetime**: `60` seconds (or your preference)
6. Add the following JSON to the **Claims** section:

```json
{
  "aud": "convex",
  "name": "{{user.full_name}}",
  "email": "{{user.primary_email_address}}",
  "picture": "{{user.image_url}}",
  "nickname": "{{user.username}}",
  "given_name": "{{user.first_name}}",
  "updated_at": "{{user.updated_at}}",
  "family_name": "{{user.last_name}}",
  "phone_number": "{{user.primary_phone_number}}",
  "email_verified": "{{user.email_verified}}",
  "phone_number_verified": "{{user.phone_number_verified}}"
}
```

7. Click **Save** or **Apply Changes**

### Step 2: Configure Convex Auth

#### Option A: Via Convex Dashboard (Recommended)

1. Go to your Convex Dashboard: https://dashboard.convex.dev/d/clever-hound-391
2. Click **Settings** in the sidebar
3. Scroll to **Authentication** section
4. Click **Add Auth Provider** or **Configure**
5. Enter the following:
   - **Provider Type**: OpenID Connect (OIDC)
   - **Issuer URL**: `https://clean-lion-95.clerk.accounts.dev`
   - **Application ID**: `convex`
   - **JWKS URL**: `https://clean-lion-95.clerk.accounts.dev/.well-known/jwks.json`
6. Click **Save**

#### Option B: Via auth.config.js (Already Created)

I've created `convex/auth.config.js` with your Clerk configuration. To deploy it:

```bash
npx convex dev
```

This will automatically configure authentication.

### Step 3: Add Clerk Keys to .env.local

Make sure your `.env.local` has these from Clerk:

```env
# Get these from https://dashboard.clerk.com → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Already configured
NEXT_PUBLIC_CONVEX_URL=https://clever-hound-391.convex.cloud
CONVEX_DEPLOYMENT=dev:clever-hound-391

# Add your Groq key
GROQ_API_KEY=gsk_...
```

### Step 4: Update Clerk Application Settings

In your Clerk Dashboard:

1. Go to **Paths** (under Configure)
   - **Sign-in path**: `/sign-in`
   - **Sign-up path**: `/sign-up`

2. Go to **Redirects** (under Configure)
   - **After sign-in URL**: `http://localhost:3000/dashboard`
   - **After sign-up URL**: `http://localhost:3000/dashboard`
   - **Sign-out URL**: `http://localhost:3000`

3. Go to **Domains** (under Configure)
   - Add: `localhost:3000` (for development)

### Step 5: Test the Connection

1. Start Convex (if not already running):
   ```bash
   npx convex dev
   ```

2. In a new terminal, start Next.js:
   ```bash
   pnpm dev
   ```

3. Open http://localhost:3000
4. Click "Get Started Free" or "Sign In"
5. Sign up with a new account
6. You should be redirected to `/dashboard`

## 🔍 Verify It's Working

### Check 1: User Creation
After signing up, check your Convex Dashboard:
- Go to: https://dashboard.convex.dev/d/clever-hound-391
- Click **Data** → **users** table
- You should see your user created!

### Check 2: Authentication Logs
In the Convex dashboard:
- Click **Logs**
- Look for successful authentication events

### Check 3: Dashboard Access
- After signing in, you should see the dashboard at `/dashboard`
- You should see your name/email from Clerk
- Profile page should show your information

## 🐛 Troubleshooting

### "Authentication failed"
- ✅ Verify JWT template is named "Convex" in Clerk
- ✅ Verify `aud` claim is set to "convex"
- ✅ Check JWKS endpoint is accessible: https://clean-lion-95.clerk.accounts.dev/.well-known/jwks.json
- ✅ Restart both `npx convex dev` and `pnpm dev`

### "User not found"
- The user creation happens automatically on first sign-in
- Check `convex/users.ts` has the `createUser` mutation
- Check logs in Convex dashboard

### "Invalid token"
- Make sure you selected the "Convex" template in your Clerk application
- Verify the JWKS endpoint matches your Clerk instance
- Clear browser cookies and try again

## 📊 How It Works

```
┌─────────────┐       JWT Token        ┌─────────────┐
│    Clerk    │ ──────────────────────> │   Browser   │
│   (Auth)    │                         │             │
└─────────────┘                         └─────────────┘
                                               │
                                               │ Send JWT
                                               ▼
                                        ┌─────────────┐
                                        │   Convex    │
                                        │ (Verifies)  │
                                        └─────────────┘
                                               │
                                               │ Creates/Gets User
                                               ▼
                                        ┌─────────────┐
                                        │  Database   │
                                        │   (users)   │
                                        └─────────────┘
```

1. User signs in via Clerk
2. Clerk issues a JWT token with "convex" audience
3. Token is sent to Convex with each request
4. Convex verifies token using JWKS
5. User is authenticated and data is accessible

## 🎉 Next Steps

Once authentication is working:

1. **Create your profile** at `/dashboard/profile`
2. **Add pantry items** at `/dashboard/pantry`
3. **Generate meal plans** at `/dashboard/meal-plans/new`

## 📚 References

- **Clerk Docs**: https://clerk.com/docs/integrations/databases/convex
- **Convex Auth Docs**: https://docs.convex.dev/auth/clerk
- **Your Clerk Dashboard**: https://dashboard.clerk.com
- **Your Convex Dashboard**: https://dashboard.convex.dev/d/clever-hound-391

---

**Status**: 🟡 Waiting for Clerk configuration

Complete the steps above and you'll have full authentication working! 🔐
