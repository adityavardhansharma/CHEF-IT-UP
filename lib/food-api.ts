// Food API Integration - 100% FREE APIs Only!

interface Ingredient {
  id: string;
  name: string;
  category: string;
  image?: string;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

/**
 * Search ingredients using Open Food Facts API (100% FREE, No API Key Required!)
 * World's largest open food database - completely free and open source
 */
export async function searchOpenFoodFacts(query: string): Promise<Ingredient[]> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query
      )}&page_size=20&json=1&fields=product_name,nutriments,categories,image_url`
    );

    if (!response.ok) {
      throw new Error("Open Food Facts API error");
    }

    const data = await response.json();

    const ingredients: Ingredient[] = data.products
      .filter((product: any) => product.product_name && product.nutriments)
      .map((product: any) => {
        const nutriments = product.nutriments;
        
        return {
          id: `off-${product.code || Math.random().toString(36).substr(2, 9)}`,
          name: product.product_name,
          category: product.categories?.split(',')[0]?.trim() || "Food",
          image: product.image_url,
          nutritionalInfo: {
            calories: Math.round(nutriments["energy-kcal_100g"] || nutriments["energy_100g"] || 0),
            protein: Math.round(nutriments.proteins_100g || 0),
            carbs: Math.round(nutriments.carbohydrates_100g || 0),
            fat: Math.round(nutriments.fat_100g || 0),
          },
        };
      });

    return ingredients;
  } catch (error) {
    console.error("Open Food Facts API error:", error);
    return [];
  }
}

/**
 * Search ingredients using USDA FoodData Central API (100% FREE!)
 * No API key required - DEMO_KEY works forever
 * Comprehensive US government food database
 */
export async function searchUSDAIngredients(query: string): Promise<Ingredient[]> {
  try {
    // DEMO_KEY is free forever, no signup required!
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
        query
      )}&pageSize=15&api_key=DEMO_KEY`
    );

    if (!response.ok) {
      throw new Error("USDA API error");
    }

    const data = await response.json();

    const ingredients: Ingredient[] = data.foods
      .filter((food: any) => food.foodNutrients && food.foodNutrients.length > 0)
      .map((food: any) => {
        const nutrients = food.foodNutrients || [];
        const calories =
          nutrients.find((n: any) => n.nutrientName === "Energy")?.value || 0;
        const protein =
          nutrients.find((n: any) => n.nutrientName === "Protein")?.value || 0;
        const carbs =
          nutrients.find((n: any) => n.nutrientName === "Carbohydrate, by difference")
            ?.value || 0;
        const fat =
          nutrients.find((n: any) => n.nutrientName === "Total lipid (fat)")?.value || 0;

        return {
          id: `usda-${food.fdcId}`,
          name: food.description,
          category: food.foodCategory || "USDA Foods",
          nutritionalInfo: {
            calories: Math.round(calories),
            protein: Math.round(protein),
            carbs: Math.round(carbs),
            fat: Math.round(fat),
          },
        };
      });

    return ingredients.slice(0, 15);
  } catch (error) {
    console.error("USDA API error:", error);
    return [];
  }
}

/**
 * Create custom ingredient with estimated nutrition
 */
export function createCustomIngredient(name: string, category: string = "Custom"): Ingredient {
  // Basic nutritional estimates for common categories
  const nutritionEstimates: Record<string, any> = {
    vegetables: { calories: 25, protein: 1, carbs: 5, fat: 0.2 },
    fruits: { calories: 50, protein: 0.5, carbs: 13, fat: 0.2 },
    proteins: { calories: 150, protein: 25, carbs: 0, fat: 5 },
    grains: { calories: 350, protein: 10, carbs: 70, fat: 2 },
    dairy: { calories: 60, protein: 3, carbs: 5, fat: 3 },
    default: { calories: 100, protein: 5, carbs: 15, fat: 3 },
  };

  const categoryLower = category.toLowerCase();
  const nutrition =
    nutritionEstimates[categoryLower] || nutritionEstimates.default;

  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    category,
    nutritionalInfo: nutrition,
  };
}

/**
 * Main search function - Uses 100% FREE APIs only!
 * Searches both USDA and Open Food Facts in parallel for best results
 */
export async function searchIngredients(query: string): Promise<Ingredient[]> {
  if (query.length < 2) return [];

  const results: Ingredient[] = [];

  // Search both APIs in parallel (both are 100% free!)
  const [usdaResults, openFoodResults] = await Promise.allSettled([
    searchUSDAIngredients(query),
    searchOpenFoodFacts(query),
  ]);

  // Add USDA results
  if (usdaResults.status === "fulfilled" && usdaResults.value.length > 0) {
    results.push(...usdaResults.value);
  }

  // Add Open Food Facts results
  if (openFoodResults.status === "fulfilled" && openFoodResults.value.length > 0) {
    results.push(...openFoodResults.value);
  }

  // Remove duplicates based on name similarity
  const uniqueResults = results.filter((item, index, self) => {
    const firstIndex = self.findIndex(
      (i) => i.name.toLowerCase().trim() === item.name.toLowerCase().trim()
    );
    return firstIndex === index;
  });

  return uniqueResults.slice(0, 20); // Return max 20 results
}

/**
 * Get popular ingredients (cached list)
 */
export function getPopularIngredients(): Ingredient[] {
  return [
    {
      id: "popular-1",
      name: "Chicken Breast",
      category: "Proteins",
      nutritionalInfo: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    },
    {
      id: "popular-2",
      name: "Rice (White)",
      category: "Grains",
      nutritionalInfo: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    },
    {
      id: "popular-3",
      name: "Tomato",
      category: "Vegetables",
      nutritionalInfo: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
    },
    {
      id: "popular-4",
      name: "Onion",
      category: "Vegetables",
      nutritionalInfo: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
    },
    {
      id: "popular-5",
      name: "Eggs",
      category: "Proteins",
      nutritionalInfo: { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
    },
    {
      id: "popular-6",
      name: "Potato",
      category: "Vegetables",
      nutritionalInfo: { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
    },
    {
      id: "popular-7",
      name: "Olive Oil",
      category: "Oils",
      nutritionalInfo: { calories: 884, protein: 0, carbs: 0, fat: 100 },
    },
    {
      id: "popular-8",
      name: "Garlic",
      category: "Vegetables",
      nutritionalInfo: { calories: 149, protein: 6.4, carbs: 33, fat: 0.5 },
    },
    {
      id: "popular-9",
      name: "Salt",
      category: "Spices",
      nutritionalInfo: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    },
    {
      id: "popular-10",
      name: "Black Pepper",
      category: "Spices",
      nutritionalInfo: { calories: 251, protein: 10, carbs: 64, fat: 3.3 },
    },
  ];
}
