import { v } from "convex/values";
import { action } from "./_generated/server";

/**
 * Server-side action to generate meal plans using Groq AI
 * This runs on the server where environment variables are accessible
 */
export const generateMealPlanAction = action({
  args: {
    userProfile: v.object({
      name: v.optional(v.string()),
      allergies: v.array(v.object({
        name: v.string(),
        severity: v.string(),
      })),
      medicalConditions: v.array(v.string()),
      favoriteIngredients: v.array(v.string()),
    }),
    pantryItems: v.array(v.object({
      name: v.string(),
      quantity: v.number(),
      unit: v.string(),
    })),
    parameters: v.object({
      familySize: v.number(),
      mealsPerDay: v.array(v.string()),
      dietType: v.string(),
      cuisinePreference: v.optional(v.string()),
      negativeIngredients: v.array(v.string()),
      duration: v.number(),
      durationUnit: v.string(),
      assumeBasicStaples: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    // Import Groq dynamically to avoid client-side issues
    const { generateMealPlan } = await import("../lib/groq");
    
    try {
      const result = await generateMealPlan(
        args.userProfile,
        args.pantryItems,
        args.parameters
      );
      
      return result;
    } catch (error: any) {
      console.error("Error generating meal plan:", error);
      throw new Error(`Failed to generate meal plan: ${error.message}`);
    }
  },
});

