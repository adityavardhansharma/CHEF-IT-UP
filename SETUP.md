# Quick Setup Guide

Follow these steps to get the AI Chef Meal Planner running locally.

## Step 1: Install Dependencies

```bash
pnpm install
```

## Step 2: Set Up Clerk Authentication

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy your publishable key and secret key
4. In your Clerk dashboard:
   - Go to **Configure** → **Sessions**
   - Enable "Clerk Hosted Pages" (or configure custom pages)
   - Go to **Configure** → **Redirects**
   - Set sign-in redirect to: `/dashboard`
   - Set sign-up redirect to: `/dashboard`

## Step 3: Set Up Convex Database

1. Install Convex CLI globally (if not already installed):
   ```bash
   npm install -g convex
   ```

2. Initialize Convex:
   ```bash
   npx convex dev
   ```
   
3. This will:
   - Prompt you to create a new project or link to existing one
   - Deploy your database schema
   - Give you a `NEXT_PUBLIC_CONVEX_URL`
   - Start a dev server watching for changes

4. Keep this terminal open while developing

## Step 4: Get Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (you won't see it again!)

## Step 5: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex Database (automatically added by `npx convex dev`)
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Groq AI
GROQ_API_KEY=gsk_...
```

**Important**: The `NEXT_PUBLIC_CONVEX_URL` is automatically added to `.env.local` when you run `npx convex dev`.

## Step 6: Seed the Database

In a new terminal (keep `npx convex dev` running):

```bash
npx convex run seed:seedGlobalPantryItems
```

This adds ~90 common pantry ingredients to your database.

## Step 7: Start the Development Server

```bash
pnpm dev
```

## Step 8: Open the App

Navigate to [http://localhost:3000](http://localhost:3000)

## First Time Setup Flow

1. **Sign Up**: Click "Get Started Free" and create an account
2. **Complete Profile**: 
   - Go to Profile page
   - Add allergies (if any)
   - Add medical conditions (if any)
   - Add favorite ingredients
   - Click "Save Changes"

3. **Stock Your Pantry**:
   - Go to Pantry page
   - Click "Add Item"
   - Search for ingredients (try "chicken", "rice", "tomato")
   - Set quantity and unit
   - Add to pantry

4. **Create Your First Meal Plan**:
   - Click "New Meal Plan" button
   - Step 1: Set start date, duration, family size, and meal types
   - Step 2: Choose diet type, cuisine preference, ingredients to avoid
   - Step 3: Review and click "Generate Meal Plan"
   - Wait for AI to generate your personalized recipes (30-60 seconds)

5. **View Your Meals**:
   - Navigate to Meal Plans
   - Select a date
   - View detailed recipes with ingredients and instructions
   - Mark meals as eaten to update your pantry automatically

## Common Issues

### "Convex is not connected"
- Make sure `npx convex dev` is running in a separate terminal
- Check that `NEXT_PUBLIC_CONVEX_URL` is in your `.env.local`
- Restart the Next.js dev server

### "Authentication failed"
- Verify Clerk keys are correct in `.env.local`
- Make sure you're using the correct environment keys (development vs production)
- Check Clerk dashboard for any configuration issues

### "Groq API Error"
- Verify `GROQ_API_KEY` is correct
- Check you haven't exceeded free tier limits
- Try using a different model in `lib/groq.ts`

### "No pantry items showing up"
- Make sure you ran the seed command: `npx convex run seed:seedGlobalPantryItems`
- Check Convex dashboard to verify data exists
- Try refreshing the page

## Development Tips

### Watching Convex Changes
The `npx convex dev` command automatically:
- Deploys schema changes
- Rebuilds functions when you edit them
- Shows logs from your functions
- Syncs your local code with Convex cloud

### Accessing Convex Dashboard
1. Run `npx convex dashboard`
2. Or go to [dashboard.convex.dev](https://dashboard.convex.dev)
3. View your data, run queries, check logs

### Clerk Dashboard
Access at [dashboard.clerk.com](https://dashboard.clerk.com) to:
- View users
- Configure authentication settings
- Set up webhooks
- Customize login/signup pages

## Production Deployment

### 1. Deploy Convex
```bash
npx convex deploy --prod
```

This gives you a production `CONVEX_URL` - add it to your Vercel environment variables.

### 2. Deploy to Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CONVEX_URL` (production URL from step 1)
   - `GROQ_API_KEY`
4. Deploy!

### 3. Update Clerk Production Settings
- Add production domain to allowed domains in Clerk
- Update redirect URLs to production URLs

## Need Help?

- **Convex Docs**: https://docs.convex.dev
- **Clerk Docs**: https://clerk.com/docs
- **Groq Docs**: https://console.groq.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

Happy cooking! 🍳👨‍🍳
