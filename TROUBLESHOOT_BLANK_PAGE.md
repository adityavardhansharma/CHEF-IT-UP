# 🔧 Troubleshooting Blank Meal Plans Page

## Quick Fixes Applied

✅ Removed unused `useMemo` import  
✅ Removed unused `getMissingIngredients` import  
✅ Convex functions synced

---

## 🧪 Steps to Fix

### 1. Hard Refresh Browser
Press `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac) to clear cache

### 2. Check Browser Console
1. Press `F12` to open Developer Tools
2. Go to "Console" tab
3. Look for red errors
4. Share any errors you see

### 3. Check if Next.js Dev Server is Running
In a separate terminal, run:
```bash
pnpm dev
```

### 4. Restart Everything
```bash
# Terminal 1: Stop and restart Convex
Ctrl + C
npx convex dev

# Terminal 2: Stop and restart Next.js  
Ctrl + C
pnpm dev
```

---

## 🔍 Common Causes

### Issue 1: Cache Problem
**Fix**: Hard refresh (`Ctrl + Shift + R`)

### Issue 2: Build Error
**Fix**: Check terminal for build errors

### Issue 3: Missing Environment Variables
**Fix**: Ensure `.env.local` has all required variables

### Issue 4: Component Error
**Fix**: Check browser console for specific error

---

## 📊 What to Check

1. **Terminal Output**: Any errors?
2. **Browser Console**: Any red errors?
3. **Network Tab**: Any failed requests?
4. **URL**: What URL shows when blank?

---

## 🚨 Most Likely Issues

### If you see: "Cannot read property..."
→ Component is trying to access data before it loads  
→ Check for missing `?.` optional chaining

### If you see: "Module not found"
→ Import path is wrong  
→ Check all imports in meal plan files

### If you see: "Hydration error"
→ Server/client mismatch  
→ Hard refresh browser

---

## 💡 Quick Test

Try opening these URLs directly:

1. `/dashboard/meal-plans` - View meal plans
2. `/dashboard/meal-plans/new` - Create new plan

Which one(s) show blank page?

---

## 🔄 Nuclear Option (If Nothing Else Works)

```bash
# Stop all servers (Ctrl + C in both terminals)

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
pnpm install

# Restart everything
npx convex dev  # Terminal 1
pnpm dev        # Terminal 2
```

---

Please share:
1. Any errors in browser console (F12)
2. Which page exactly is blank?
3. Any terminal errors?
