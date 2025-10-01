import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
          quantity: v.number(),
          unit: v.string(),
        })
      ),
      instructions: v.array(v.string()),
      cookingTime: v.number(),
      difficulty: v.string(),
      utensils: v.array(v.string()),
    }),
    nutritionalInfo: v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
      fiber: v.optional(v.number()),
      sodium: v.optional(v.number()),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("meals")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", user._id).eq("date", args.date)
      )
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

    // Deduct ingredients from pantry
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
      const pantryItem = pantryItems.find((item) => {
        if (item.itemId) {
          return ctx.db.get(item.itemId).then((globalItem) => {
            return globalItem?.name.toLowerCase() === ingredient.name.toLowerCase();
          });
        }
        return item.customItemName?.toLowerCase() === ingredient.name.toLowerCase();
      });

      if (pantryItem) {
        const newQuantity = pantryItem.quantity - ingredient.quantity;
        if (newQuantity > 0) {
          await ctx.db.patch(pantryItem._id, {
            quantity: newQuantity,
            updatedAt: Date.now(),
          });
        } else {
          await ctx.db.delete(pantryItem._id);
        }
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
