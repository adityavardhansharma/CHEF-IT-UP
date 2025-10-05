import { v } from "convex/values";
import { action } from "./_generated/server";

/**
 * Server-side action to generate meal plans using Groq AI
 * This runs on the server where environment variables are accessible
 */
export const generateMealPlanAction = action({
  args: {
    startDate: v.string(),
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
      cuisinePreferences: v.optional(v.array(v.string())), // Optional array
      cuisinePreference: v.optional(v.string()), // Backward compatibility
      negativeIngredients: v.array(v.string()),
      duration: v.number(),
      durationUnit: v.string(),
      assumeBasicStaples: v.optional(v.boolean()),
      customInstructions: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // Import Groq dynamically to avoid client-side issues
    const { generateMealPlan } = await import("../lib/groq");

    try {
      // Convert old cuisinePreference to new cuisinePreferences format for backward compatibility
      const processedParameters = { ...args.parameters };

      if (args.parameters.cuisinePreference && !args.parameters.cuisinePreferences) {
        // Convert single cuisine to array format
        processedParameters.cuisinePreferences = args.parameters.cuisinePreference
          ? [args.parameters.cuisinePreference]
          : [];
      } else if (!args.parameters.cuisinePreferences) {
        // Ensure empty array if neither field is provided
        processedParameters.cuisinePreferences = [];
      }
      const result = await generateMealPlan(
        args.userProfile,
        args.pantryItems,
        processedParameters
      );
      
      if (!result || !result.meals) {
        throw new Error("No meals generated");
      }

      // Format dates properly and validate meal structure
      const totalDays = args.parameters.duration * (args.parameters.durationUnit === "weeks" ? 7 : 1);
      const expectedMealTypes = args.parameters.mealsPerDay.map((m) => m.toLowerCase().trim());

      // Helper to format date as YYYY-MM-DD without TZ issues
      const formatDate = (d: Date) => {
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, "0");
        const day = String(d.getUTCDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };

      // Treat startDate as UTC date at midnight
      const base = new Date(`${args.startDate}T00:00:00.000Z`);

      // Process meals: update dates and validate structure
      const processedMeals: any[] = [];
      const seenSlots = new Set<string>();

      for (const meal of result.meals) {
        // Normalize meal type for comparison
        const mealType = String(meal.mealType || "").toLowerCase().trim();
        const day = meal.day;
        const slotKey = `${day}-${mealType}`;

        // Skip duplicates
        if (seenSlots.has(slotKey)) {
          console.warn(`[AI] Duplicate slot detected: ${slotKey}, skipping`);
          continue;
        }

        // Calculate date for this day
        const date = new Date(base);
        date.setUTCDate(base.getUTCDate() + (day - 1));

        processedMeals.push({
          ...meal,
          day,
          mealType,
          date: formatDate(date),
        });

        seenSlots.add(slotKey);
      }

      result.meals = processedMeals;

      const expectedCount = totalDays * expectedMealTypes.length;
      console.log(`[AI] Processed ${result.meals.length} meals (expected: ${expectedCount}) over ${totalDays} days with meal types: ${expectedMealTypes.join(", ")}`);
      
      return result;
    } catch (error: any) {
      console.error("Error generating meal plan:", error);
      throw new Error(`Failed to generate meal plan: ${error.message}`);
    }
  },
});

/**
 * Server-side action to regenerate a single meal using Groq AI
 */
export const regenerateMealAction = action({
  args: {
    mealType: v.string(),
    date: v.string(),
    familySize: v.number(),
    dietType: v.string(),
    customRequest: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    // Import regenerateMeal dynamically to avoid client-side issues
    const { regenerateMeal } = await import("../lib/groq");
    
    try {
      const meal = await regenerateMeal(
        args.userProfile,
        args.pantryItems,
        args.mealType,
        args.date,
        args.familySize,
        args.dietType,
        args.customRequest
      );
      
      return meal;
    } catch (error: any) {
      console.error("Error regenerating meal:", error);
      throw new Error(`Failed to regenerate meal: ${error.message}`);
    }
  },
});

