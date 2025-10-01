# 🧂 Basic Staples & Missing Ingredient Tracking System

## Overview

This system allows users to indicate they have basic kitchen staples (salt, pepper, oil, etc.) and automatically highlights missing ingredients in recipes with real-time pantry synchronization.

---

## ✨ Features

### 1. **Basic Staples Checkbox**
During meal plan creation, users can check "I have basic kitchen staples":
- ✅ **Checked (default)**: AI assumes salt, pepper, oil, butter, sugar, flour, and other common staples are available
- ❌ **Unchecked**: All ingredients must be explicitly in the user's pantry

### 2. **Missing Ingredient Highlighting**
In meal plan views, ingredients display with visual indicators:
- **In Pantry**: Normal display
- **Basic Staple** (when enabled): Shows "(staple)" label in gray
- **Missing from Pantry**: Red dotted underline

### 3. **Interactive Tooltips**
Hover over red-underlined ingredients to see:
> ⚠️ **Not in pantry**

### 4. **Real-Time Sync**
- Updates automatically when pantry changes
- No page refresh needed
- Works across all meal views

---

## 🏗️ Technical Implementation

### 1. Basic Staples List (`lib/staples.ts`)

```typescript
export const BASIC_STAPLES = [
  // Seasonings
  "Salt", "Black Pepper", "White Pepper", "Sugar", "Brown Sugar",
  
  // Oils & Fats
  "Olive Oil", "Vegetable Oil", "Butter",
  
  // Basics
  "Water", "Ice",
  
  // Common Condiments
  "Vinegar", "Soy Sauce",
  
  // Baking Basics
  "Flour", "Baking Powder", "Baking Soda",
  
  // Common Aromatics
  "Garlic", "Onion",
];
```

### 2. Ingredient Item Component (`components/ingredient-item.tsx`)

**Features**:
- Visual indicator for missing ingredients
- Hover tooltip
- Staple labeling
- Real-time pantry checking

**Props**:
```typescript
interface IngredientItemProps {
  name: string;              // Ingredient name
  quantity?: string;         // Amount (e.g., "2 cups")
  isInPantry: boolean;       // Is it in user's pantry?
  assumeStaples?: boolean;   // Are staples assumed?
}
```

**Visual States**:
- ✅ **Available**: Normal text
- 🔵 **Staple**: Normal text + "(staple)" label
- 🔴 **Missing**: Red dotted underline + tooltip

### 3. Database Schema Updates

**`convex/schema.ts`** - Added to `mealPlans` table:
```typescript
parameters: v.object({
  // ... existing fields
  assumeBasicStaples: v.optional(v.boolean()),
})
```

### 4. AI Integration (`lib/groq.ts`)

**Added to prompt**:
```
NOTE: Assume basic kitchen staples are always available 
(salt, pepper, oil, butter, sugar, flour, etc.)

IMPORTANT INSTRUCTIONS:
6. You may use basic staples without listing them in pantry
```

---

## 🎯 User Flow

### Step 1: Meal Planning
```
┌─────────────────────────────────────┐
│  Meal Planning Wizard - Step 2      │
│                                     │
│  ☑️ I have basic kitchen staples    │
│                                     │
│  Assumes you always have salt,     │
│  pepper, oil, sugar, flour, and    │
│  other common staples.             │
└─────────────────────────────────────┘
```

### Step 2: Recipe Display
```
Ingredients:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 2 cups Flour (staple)
• 1 tsp Salt (staple)
• 2 cups Chicken [red underline]  ← Missing!
• 1 cup Milk

💡 Hover over ingredients like this to 
   see what's missing from your pantry
```

### Step 3: Hover Tooltip
```
                ┌──────────────────┐
                │ ⚠️ Not in pantry │
                └────────┬─────────┘
                         │
              2 cups Chicken
              ═══════════
```

### Step 4: Add to Pantry
```
User adds chicken to pantry
         ↓
Ingredient display updates immediately
         ↓
• 2 cups Chicken [no underline] ✅
```

---

## 📊 Logic Flow

### Ingredient Status Check

```typescript
function getIngredientStatus(ingredientName: string) {
  // 1. Check if it's a basic staple
  if (assumeStaples && isBasicStaple(ingredientName)) {
    return "available"; // ✅
  }
  
  // 2. Check if in pantry
  if (pantryContains(ingredientName)) {
    return "available"; // ✅
  }
  
  // 3. Missing!
  return "missing"; // 🔴
}
```

### Fuzzy Matching

Ingredients are matched using flexible logic:
```typescript
// Exact match
"Chicken" === "Chicken" ✅

// Contains match
"Chicken Breast" contains "Chicken" ✅

// Case insensitive
"chicken" matches "Chicken" ✅

// Normalized
"  Chicken  " matches "Chicken" ✅
```

---

## 🎨 Visual Design

### CSS Classes

**Missing Ingredient**:
```css
.border-b-2 .border-red-500 .border-dotted .cursor-help
```

**Tooltip**:
```css
.bg-red-600 .text-white .text-xs 
.px-3 .py-2 .rounded .shadow-lg
```

**Staple Label**:
```css
.text-xs .text-gray-400 .ml-1
```

### Tooltip Design
```
┌────────────────────────┐
│  ⚠️ Not in pantry      │  ← Red background
└───────────┬────────────┘
            ▼                ← Arrow pointing down
```

---

## 🔄 Real-Time Updates

### Pantry Changes Trigger Updates

```typescript
// User adds ingredient to pantry
addPantryItem("Chicken") 
    ↓
Convex real-time sync
    ↓
pantryItems query updates
    ↓
getIngredientStatus() re-evaluates
    ↓
Component re-renders
    ↓
Red underline disappears ✅
```

**No manual refresh needed!**

---

## 🧪 Example Scenarios

### Scenario 1: Full Pantry
```
User has: Chicken, Rice, Tomatoes
Staples: Enabled
Recipe: Chicken Rice with Salt

Display:
• 2 cups Chicken ✅
• 1 cup Rice ✅
• 2 Tomatoes ✅
• 1 tsp Salt (staple) ✅

All green! Ready to cook! 🎉
```

### Scenario 2: Missing Ingredients
```
User has: Chicken
Staples: Enabled
Recipe: Chicken Pasta with Sauce

Display:
• 2 cups Chicken ✅
• 1 lb Pasta [red underline] ⚠️
• 1 cup Tomato Sauce [red underline] ⚠️
• 1 tsp Salt (staple) ✅

Need to buy: Pasta, Tomato Sauce
```

### Scenario 3: Staples Disabled
```
User has: Chicken
Staples: DISABLED
Recipe: Chicken with Salt

Display:
• 2 cups Chicken ✅
• 1 tsp Salt [red underline] ⚠️

Even salt is required in pantry!
```

---

## 📝 Files Modified

### New Files
1. `lib/staples.ts` - Staples list and logic
2. `components/ingredient-item.tsx` - Display component
3. `STAPLES_SYSTEM.md` - This documentation

### Updated Files
1. `app/(dashboard)/dashboard/meal-plans/new/page.tsx`
   - Added checkbox
   - Pass setting to AI

2. `app/(dashboard)/dashboard/meal-plans/page.tsx`
   - Display ingredients with status
   - Real-time pantry checking

3. `convex/schema.ts`
   - Added `assumeBasicStaples` field

4. `convex/mealPlans.ts`
   - Store staples preference

5. `lib/groq.ts`
   - AI prompt includes staples setting
   - Instructions for staple usage

---

## 🎯 Benefits

### For Users
✅ **Convenience**: Don't need to add basic staples to pantry  
✅ **Visual Clarity**: Instantly see what's missing  
✅ **Shopping List**: Red items = need to buy  
✅ **Real-Time**: Updates as you add to pantry  

### For Recipes
✅ **More Flexible**: AI can use common ingredients  
✅ **More Realistic**: Matches real cooking behavior  
✅ **Better Variety**: Not limited by pantry entries  

### For Development
✅ **Clean Architecture**: Separated concerns  
✅ **Reusable**: Component works anywhere  
✅ **Maintainable**: Staples list in one place  
✅ **Scalable**: Easy to add more staples  

---

## 🔧 Customization

### Adding More Staples

Edit `lib/staples.ts`:
```typescript
export const BASIC_STAPLES = [
  // ... existing staples
  
  // Add your staples here:
  "Paprika",
  "Cumin",
  "Oregano",
];
```

**That's it!** Works everywhere automatically.

### Changing Tooltip Text

Edit `components/ingredient-item.tsx`:
```typescript
<span>⚠️ Not in pantry</span>
// Change to:
<span>🛒 Add to shopping list</span>
```

### Changing Visual Style

Modify the className:
```typescript
// Current: Red dotted underline
"border-b-2 border-red-500 border-dotted"

// Alternative: Yellow dashed
"border-b-2 border-yellow-500 border-dashed"

// Alternative: Orange solid
"border-b-2 border-orange-600"
```

---

## 🧪 Testing

### Manual Tests

1. **Enable staples → Generate meal**
   - ✅ Salt should show "(staple)" 
   - ✅ Non-staples missing from pantry → red underline

2. **Disable staples → Generate meal**
   - ✅ Even salt should be red if not in pantry

3. **Add missing ingredient to pantry**
   - ✅ Red underline should disappear immediately

4. **Hover over missing ingredient**
   - ✅ Tooltip should appear

5. **Remove item from pantry**
   - ✅ Red underline should reappear

---

## 🎉 Result

**Professional ingredient tracking system with:**
- ✅ Visual missing ingredient indicators
- ✅ Interactive hover tooltips
- ✅ Real-time pantry synchronization
- ✅ Basic staples assumption
- ✅ Clean, maintainable code

**Users can now instantly see what they need to buy before cooking!** 🛒✨
