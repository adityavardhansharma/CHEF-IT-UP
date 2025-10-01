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
      
      if (!result || !result.meals) {
        throw new Error("No meals generated");
      }

      // Enforce exact schedule grid using startDate and requested meal types
      const totalDays = args.parameters.duration * (args.parameters.durationUnit === "weeks" ? 7 : 1);
      const mealTypes = Array.from(new Set(args.parameters.mealsPerDay.map((m) => m.toLowerCase().trim())));

      // Normalize pools by type
      const typePools: Record<string, any[]> = {};
      for (const t of mealTypes) typePools[t] = [];

      const extraPool: any[] = [];
      for (const m of result.meals) {
        const type = String(m.mealType || "").toLowerCase().trim();
        if (mealTypes.includes(type)) {
          typePools[type].push(m);
        } else {
          extraPool.push(m);
        }
      }

      // Helper to format date as YYYY-MM-DD without TZ issues
      const formatDate = (d: Date) => {
        // Force UTC to avoid TZ drift between server and client
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, "0");
        const day = String(d.getUTCDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };

      // Treat startDate as UTC date at midnight to keep dates aligned in all regions
      const base = new Date(`${args.startDate}T00:00:00.000Z`);

      // Flatten all meals to use as fallback when a type pool is empty
      const flatPool: any[] = [
        ...mealTypes.flatMap((t) => typePools[t]),
        ...extraPool,
      ];

      // Dedup within pools by (day, type) to avoid repeats
      const seen = new Set<string>();
      const dedup = (arr: any[]) => arr.filter((m) => {
        const key = `${String(m.day)}-${String(m.mealType).toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      for (const t of mealTypes) typePools[t] = dedup(typePools[t]);

      const scheduled: any[] = [];

      // Pull next meal for a type, or fallback to another type/any
      const pullMeal = (type: string): any | null => {
        if (typePools[type] && typePools[type].length) return typePools[type].shift();
        for (const t of mealTypes) {
          if (typePools[t].length) return typePools[t].shift();
        }
        if (flatPool.length) return flatPool.shift();
        return null;
      };

      for (let d = 1; d <= totalDays; d++) {
        for (const t of mealTypes) {
          const chosen = pullMeal(t);
          if (!chosen) continue;

          const date = new Date(base);
          date.setUTCDate(base.getUTCDate() + (d - 1));

          scheduled.push({
            ...chosen,
            day: d,
            mealType: t,
            date: formatDate(date),
          });
        }
      }

      // Final guard: keep first by (day, type) and clip to expected count
      const comboSeen = new Set<string>();
      const finalMeals: any[] = [];
      for (const m of scheduled) {
        const key = `${m.day}-${m.mealType}`;
        if (!comboSeen.has(key)) {
          comboSeen.add(key);
          finalMeals.push(m);
        }
      }

      const expectedCount = totalDays * mealTypes.length;
      result.meals = finalMeals.slice(0, expectedCount);

      console.log(`[AI] Scheduled ${result.meals.length} meals (expected: ${expectedCount}) over ${totalDays} days with types: ${mealTypes.join(", ")}`);
      
      return result;
    } catch (error: any) {
      console.error("Error generating meal plan:", error);
      throw new Error(`Failed to generate meal plan: ${error.message}`);
    }
  },
});

