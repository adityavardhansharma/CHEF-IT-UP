# API Keys Setup Guide

## Environment Variables Required

This application now uses **two separate AI providers**:

1. **Groq** - For generating complete meal plans
2. **Cerebras** - For regenerating individual meals

## Step 1: Get Your API Keys

### Groq API Key
- Visit: https://console.groq.com
- Sign up/login and get your API key
- You already have this set up ✅

### Cerebras API Key
- Visit: https://cloud.cerebras.ai
- Sign up/login and get your API key
- This is new - you need to add this

## Step 2: Set Convex Environment Variables

Run this command to add your Cerebras API key to Convex:

```bash
npx convex env set CEREBRAS_API_KEY your_cerebras_api_key_here
```

To verify both keys are set:

```bash
npx convex env list
```

You should see:
- `GROQ_API_KEY` (already set ✅)
- `CEREBRAS_API_KEY` (needs to be added)

## Step 3: Local Development (Optional)

If you have a `.env.local` file for local development, add:

```
GROQ_API_KEY=your_groq_key
CEREBRAS_API_KEY=your_cerebras_key
```

## How It Works

- **Meal Plan Generation** (`generateMealPlan`) → Uses **Groq** with model `openai/gpt-oss-120b`
- **Individual Meal Regeneration** (`regenerateMeal`) → Uses **Cerebras** with model `llama-4-maverick-17b-128e-instruct`

## Current Status

✅ Code updated to use separate API keys
✅ GROQ_API_KEY is already set in Convex
⚠️ CEREBRAS_API_KEY needs to be added

## Next Steps

1. Get your Cerebras API key from https://cloud.cerebras.ai
2. Run: `npx convex env set CEREBRAS_API_KEY your_key_here`
3. Restart your Convex dev server if it's running
4. Test meal plan generation (uses Groq)
5. Test meal regeneration (uses Cerebras)

