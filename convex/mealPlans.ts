import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function convertToGrams(quantity: number, unit: string): number {
  const normalizedUnit = unit.toLowerCase().trim();
  switch (normalizedUnit) {
    case 'kg':
    case 'kilogram':
    case 'kilograms':
      return quantity * 1000;
    case 'g':
    case 'gram':
    case 'grams':
      return quantity;
    case 'lb':
    case 'pound':
    case 'pounds':
      return quantity * 453.592;
    case 'oz':
    case 'ounce':
    case 'ounces':
      return quantity * 28.3495;
    case 'ml':
    case 'milliliter':
    case 'milliliters':
    case 'l':
    case 'liter':
    case 'liters':
      return quantity; // Assume 1:1 for volume to weight approximation
    case 'tsp':
    case 'teaspoon':
    case 'teaspoons':
      return quantity * 5;
    case 'tbsp':
    case 'tablespoon':
    case 'tablespoons':
      return quantity * 15;
    case 'cup':
    case 'cups':
      return quantity * 240;
    default:
      console.warn(`Unknown unit '${unit}', assuming 1:1 with grams`);
      return quantity;
  }
}

function convertFromGrams(grams: number, unit: string): number {
  const normalizedUnit = unit.toLowerCase().trim();
  switch (normalizedUnit) {
    case 'kg':
    case 'kilogram':
    case 'kilograms':
      return grams / 1000;
    case 'g':
    case 'gram':
    case 'grams':
      return grams;
    case 'lb':
    case 'pound':
    case 'pounds':
      return grams / 453.592;
    case 'oz':
    case 'ounce':
    case 'ounces':
      return grams / 28.3495;
    case 'ml':
    case 'milliliter':
    case 'milliliters':
    case 'l':
    case 'liter':
    case 'liters':
      return grams; // Approximation
    case 'tsp':
    case 'teaspoon':
    case 'teaspoons':
      return grams / 5;
    case 'tbsp':
    case 'tablespoon':
    case 'tablespoons':
      return grams / 15;
    case 'cup':
    case 'cups':
      return grams / 240;
    default:
      return grams; // Fallback to grams
  }
}

export const createMealPlan = mutation({
  args: {
    startDate: v.string(),
    duration: v.number(),
    durationUnit: v.string(),
    parameters: v.object({
      familySize: v.number(),
      mealsPerDay: v.array(v.string()),
      dietType: v.string(),
      cuisinePreference: v.optional(v.string()),
      negativeIngredients: v.array(v.string()),
      assumeBasicStaples: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const mealPlanId = await ctx.db.insert("mealPlans", {
      userId: user._id,
      startDate: args.startDate,
      duration: args.duration,
      durationUnit: args.durationUnit,
      parameters: args.parameters,
      status: "active",
      createdAt: Date.now(),
    });

    return mealPlanId;
  },
});

export const addMealToPlan = mutation({
  args: {
    planId: v.id("mealPlans"),
    date: v.string(),
    day: v.number(),
    mealType: v.string(),
    recipeName: v.string(),
    recipeDescription: v.optional(v.string()),
    recipeData: v.object({
      ingredients: v.array(
        v.object({
          name: v.string(),
          quantity: v.float64(),
          unit: v.string(),
        })
      ),
      instructions: v.array(v.string()),
      cookingTime: v.number(),
      difficulty: v.string(),
      utensils: v.array(v.string()),
    }),
    nutritionalInfo: v.object({
      calories: v.float64(),
      protein: v.float64(),
      carbs: v.float64(),
      fat: v.float64(),
      fiber: v.optional(v.float64()),
      sodium: v.optional(v.float64()),
    }),
    portionSize: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Guard: prevent duplicate (planId, day, mealType)
    const existing = await ctx.db
      .query("meals")
      .withIndex("by_plan_day_type", (q) =>
        q.eq("planId", args.planId).eq("day", args.day).eq("mealType", args.mealType)
      )
      .unique();

    if (existing) {
      // Upsert policy: replace older with new recipe
      await ctx.db.patch(existing._id, {
        date: args.date,
        recipeName: args.recipeName,
        recipeDescription: args.recipeDescription,
        recipeData: args.recipeData,
        nutritionalInfo: args.nutritionalInfo,
        portionSize: args.portionSize,
        consumed: false,
      });
      return existing._id;
    }

    const mealId = await ctx.db.insert("meals", {
      planId: args.planId,
      userId: user._id,
      date: args.date,
      day: args.day,
      mealType: args.mealType,
      recipeName: args.recipeName,
      recipeDescription: args.recipeDescription,
      recipeData: args.recipeData,
      nutritionalInfo: args.nutritionalInfo,
      portionSize: args.portionSize,
      consumed: false,
    });

    return mealId;
  },
});

export const getUserMealPlans = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("mealPlans")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getMealsByPlan = query({
  args: {
    planId: v.id("mealPlans"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("meals")
      .withIndex("by_plan", (q) => q.eq("planId", args.planId))
      .collect();
  },
});

export const getMealsByDate = query({
  args: {
    date: v.string(),
    planId: v.optional(v.id("mealPlans")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    if (args.planId) {
      // Prefer plan-scoped query for the date
      const planId = args.planId; // narrow to defined within this block
      return await ctx.db
        .query("meals")
        .withIndex("by_plan_and_date", (q) => q.eq("planId", planId).eq("date", args.date))
        .collect();
    }

    return await ctx.db
      .query("meals")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", args.date))
      .collect();
  },
});

export const markMealAsConsumed = mutation({
  args: {
    mealId: v.id("meals"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const meal = await ctx.db.get(args.mealId);
    if (!meal) throw new Error("Meal not found");

    await ctx.db.patch(args.mealId, {
      consumed: true,
      consumedAt: Date.now(),
    });

    // Deduct ingredients from pantry with unit conversion
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const pantryItems = await ctx.db
      .query("userPantry")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const ingredient of meal.recipeData.ingredients) {
      // Find matching pantry item
      let matchingItem = null;
      
      for (const item of pantryItems) {
        let itemName = "";
        
        if (item.customItemName) {
          itemName = item.customItemName.toLowerCase();
        } else if (item.itemId) {
          const globalItem = await ctx.db.get(item.itemId);
          if (globalItem) {
            itemName = globalItem.name.toLowerCase();
          }
        }
        
        if (itemName.includes(ingredient.name.toLowerCase()) || ingredient.name.toLowerCase().includes(itemName)) {
          matchingItem = item;
          break;
        }
      }

      if (matchingItem && matchingItem.unit && ingredient.unit) {
        // Convert both to grams
        const pantryGrams = convertToGrams(matchingItem.quantity, matchingItem.unit);
        const ingredientGrams = convertToGrams(ingredient.quantity, ingredient.unit);
        
        const newGrams = pantryGrams - ingredientGrams;
        
        if (newGrams > 0) {
          // Convert back to pantry unit
          const newQuantity = convertFromGrams(newGrams, matchingItem.unit);
          await ctx.db.patch(matchingItem._id, {
            quantity: newQuantity,
            updatedAt: Date.now(),
          });
        } else {
          // Safe delete
          const stillExists = await ctx.db.get(matchingItem._id);
          if (stillExists) {
            try {
              await ctx.db.delete(matchingItem._id);
            } catch (deleteError) {
              console.warn(`Failed to delete pantry item ${matchingItem._id}:`, deleteError);
            }
          }
        }
      } else if (matchingItem) {
        console.warn(`Unit mismatch for ${ingredient.name}: pantry=${matchingItem.unit}, ingredient=${ingredient.unit}. Skipping deduction.`);
      }
    }

    return args.mealId;
  },
});

export const deleteMeal = mutation({
  args: {
    mealId: v.id("meals"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await ctx.db.delete(args.mealId);
    return args.mealId;
  },
});

export const deleteMealPlan = mutation({
  args: {
    planId: v.id("mealPlans"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // IMPORTANT: Delete meals FIRST, then the plan
    const meals = await ctx.db
      .query("meals")
      .withIndex("by_plan", (q) => q.eq("planId", args.planId))
      .collect();

    console.log(`Deleting ${meals.length} meals for plan ${args.planId}`);

    // Delete all meals associated with this plan
    for (const meal of meals) {
      await ctx.db.delete(meal._id);
    }

    // Now delete the meal plan
    await ctx.db.delete(args.planId);

    console.log(`Deleted meal plan ${args.planId}`);

    return { planId: args.planId, deletedMeals: meals.length };
  },
});
