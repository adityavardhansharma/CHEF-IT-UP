import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    username: v.optional(v.string()),
    name: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    allergies: v.array(v.object({
      name: v.string(),
      severity: v.string(), // mild, moderate, severe
    })),
    medicalConditions: v.array(v.string()),
    favoriteIngredients: v.array(v.string()),
  }).index("by_user", ["userId"]),

  globalPantryItems: defineTable({
    name: v.string(),
    category: v.string(),
    nutritionalInfo: v.object({
      calories: v.float64(),
      protein: v.float64(),
      carbs: v.float64(),
      fat: v.float64(),
    }),
  })
    .index("by_category", ["category"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["category"],
    }),

  userPantry: defineTable({
    userId: v.id("users"),
    itemId: v.optional(v.id("globalPantryItems")),
    customItemName: v.optional(v.string()), // For custom items
    quantity: v.float64(),
    unit: v.string(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  mealPlans: defineTable({
    userId: v.id("users"),
    startDate: v.string(),
    duration: v.number(),
    durationUnit: v.string(), // 'days' or 'weeks'
    parameters: v.object({
      familySize: v.number(),
      mealsPerDay: v.array(v.string()),
      dietType: v.string(),
      cuisinePreference: v.optional(v.string()),
      negativeIngredients: v.array(v.string()),
      assumeBasicStaples: v.optional(v.boolean()),
      customInstructions: v.optional(v.string()), // Custom instructions for the meal plan
    }),
    status: v.string(), // 'active', 'completed', 'archived'
    createdAt: v.number(),
    endDate: v.optional(v.number()),
    updatedAt: v.optional(v.number()), // Add this line for last modification date
  }).index("by_user", ["userId"]),

  meals: defineTable({
    planId: v.id("mealPlans"),
    userId: v.id("users"),
    date: v.string(),
    day: v.number(),
    mealType: v.string(), // breakfast, lunch, dinner, snacks, dessert
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
    consumed: v.boolean(),
    consumedAt: v.optional(v.number()),
  })
    .index("by_plan", ["planId"])
    .index("by_plan_and_date", ["planId", "date"]) 
    .index("by_plan_day_type", ["planId", "day", "mealType"]) 
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"]),

  customIngredients: defineTable({
    userId: v.id("users"),
    name: v.string(),
    category: v.string(),
    nutritionalInfo: v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
    }),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
