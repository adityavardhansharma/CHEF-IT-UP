# 🔑 Setting Up GROQ_API_KEY for Convex

## The Fix

I've moved the AI generation to **Convex Actions** (server-side), which solves the environment variable issue!

---

## ✅ What Was Changed

1. **Created `convex/ai.ts`** - Server-side action for AI generation
2. **Updated meal planning page** - Now uses `useAction` instead of direct Groq calls
3. **Removed client-side Groq imports** - No more client-side errors!

---

## 🔧 Set Up Environment Variable in Convex

You need to add the GROQ_API_KEY to your **Convex deployment**:

### Option 1: Via Convex Dashboard (Recommended)

1. Go to https://dashboard.convex.dev
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `GROQ_API_KEY`
   - **Value**: Your Groq API key (starts with `gsk_`)
5. Click **Save**

### Option 2: Via Command Line

```bash
npx convex env set GROQ_API_KEY your_key_here
```

---

## 📝 Where to Get Your Groq API Key

1. Visit https://console.groq.com/keys
2. Sign in or create account
3. Click **"Create API Key"**
4. Copy the key (starts with `gsk_`)
5. Add it to Convex as shown above

---

## 🧪 Test It

Once you've added the key:

1. Restart Convex dev server:
   ```bash
   # In terminal running convex dev
   Ctrl + C
   npx convex dev
   ```

2. Go to `/dashboard/meal-plans/new`
3. Fill out the form
4. Click **"Generate with SmartRecipe AI™"**
5. ✅ Should work now!

---

## 🎯 Why This Fix Works

### Before (❌ Broken)
```
Browser (Client) → lib/groq.ts → process.env.GROQ_API_KEY
                                    ↑
                               Not available!
```

### After (✅ Fixed)
```
Browser (Client) → Convex Action → lib/groq.ts → process.env.GROQ_API_KEY
                       ↑                              ↑
                   Server-side                   Available!
```

---

## 🔍 Troubleshooting

### Error: "GROQ_API_KEY is not set"
→ You haven't added the key to Convex yet  
→ Follow steps above

### Error: "Invalid API key"
→ Check your Groq key is correct  
→ Make sure it starts with `gsk_`

### Still not working?
→ Restart Convex dev server  
→ Clear browser cache (Ctrl + Shift + R)  
→ Check Convex dashboard shows the variable

---

## ✅ Ready!

Once the GROQ_API_KEY is in Convex, meal plan generation will work perfectly! 🎉

