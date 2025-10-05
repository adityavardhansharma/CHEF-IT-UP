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

// Client-side cache for search results - stores ALL fetched data permanently
const searchCache = new Map<string, { results: Ingredient[]; timestamp: number }>();
const allIngredientsCache = new Map<string, Ingredient>(); // Store every ingredient by normalized name
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Prefetch cache for common searches
let isPrefetching = false;
const COMMON_PREFETCH_TERMS = [
  'chicken', 'rice', 'tomato', 'onion', 'potato', 'egg', 'milk', 'bread',
  'pasta', 'cheese', 'lettuce', 'carrot', 'apple', 'banana', 'beef', 'fish',
  'oil', 'butter', 'flour', 'sugar', 'salt', 'pepper', 'garlic', 'ginger'
];

// Save cache to localStorage
function saveCacheToLocalStorage() {
  if (typeof window === 'undefined') return;
  try {
    const cacheData = Array.from(allIngredientsCache.entries());
    localStorage.setItem('ingredient-cache', JSON.stringify(cacheData));
    localStorage.setItem('ingredient-cache-time', Date.now().toString());
  } catch (error) {
    console.warn('Failed to save cache to localStorage:', error);
  }
}

// Load cache from localStorage
function loadCacheFromLocalStorage() {
  if (typeof window === 'undefined') return;
  try {
    const cacheData = localStorage.getItem('ingredient-cache');
    const cacheTime = localStorage.getItem('ingredient-cache-time');
    
    if (cacheData && cacheTime) {
      const age = Date.now() - parseInt(cacheTime);
      // Load cache if less than 24 hours old
      if (age < 24 * 60 * 60 * 1000) {
        const entries = JSON.parse(cacheData);
        entries.forEach(([key, value]: [string, Ingredient]) => {
          allIngredientsCache.set(key, value);
        });
        console.log(`Loaded ${allIngredientsCache.size} ingredients from localStorage cache`);
      } else {
        localStorage.removeItem('ingredient-cache');
        localStorage.removeItem('ingredient-cache-time');
      }
    }
  } catch (error) {
    console.warn('Failed to load cache from localStorage:', error);
  }
}

// Initialize cache from localStorage
if (typeof window !== 'undefined') {
  loadCacheFromLocalStorage();
}

/**
 * Search ingredients using Open Food Facts API (100% FREE, No API Key Required!)
 * World's largest open food database - completely free and open source
 * Fetches more results and caches them aggressively
 */
export async function searchOpenFoodFacts(query: string): Promise<Ingredient[]> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query
      )}&page_size=50&json=1&fields=product_name,nutriments,categories,image_url`
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

// Rate limiting and cooldown for USDA API
let lastUSDACall = 0;
let usdaFailureCount = 0;
let usdaCooldownUntil = 0;
const USDA_RATE_LIMIT_MS = 2000; // 2 seconds between calls
const USDA_COOLDOWN_MS = 60000; // 1 minute cooldown after rate limit

/**
 * Search ingredients using USDA FoodData Central API (100% FREE!)
 * No API key required - DEMO_KEY works forever
 * Comprehensive US government food database
 */
export async function searchUSDAIngredients(query: string): Promise<Ingredient[]> {
  try {
    // Check if we're in cooldown period
    const now = Date.now();
    if (now < usdaCooldownUntil) {
      console.log("USDA API in cooldown, skipping...");
      return [];
    }

    // Rate limiting - wait if needed
    const timeSinceLastCall = now - lastUSDACall;
    if (timeSinceLastCall < USDA_RATE_LIMIT_MS) {
      await new Promise(resolve => setTimeout(resolve, USDA_RATE_LIMIT_MS - timeSinceLastCall));
    }
    lastUSDACall = Date.now();

    // DEMO_KEY is free forever, no signup required!
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
        query
      )}&pageSize=15&api_key=DEMO_KEY`
    );

    if (!response.ok) {
      // Rate limited - enter cooldown period
      if (response.status === 429) {
        usdaFailureCount++;
        usdaCooldownUntil = Date.now() + USDA_COOLDOWN_MS;
        console.log("USDA API rate limited, entering 1-minute cooldown...");
        return [];
      }
      throw new Error("USDA API error");
    }

    // Success - reset failure count
    usdaFailureCount = 0;

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
    console.warn("USDA API skipped:", error);
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
 * Prefetch common ingredients in background (non-blocking)
 */
async function prefetchCommonIngredients() {
  if (isPrefetching) return;
  isPrefetching = true;

  // Prefetch in background without blocking
  setTimeout(async () => {
    for (const term of COMMON_PREFETCH_TERMS) {
      const cacheKey = term.toLowerCase();
      if (!searchCache.has(cacheKey)) {
        try {
          const results = await searchOpenFoodFacts(term);
          searchCache.set(cacheKey, { results, timestamp: Date.now() });
          // Small delay between prefetches to not overwhelm
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.warn(`Prefetch failed for ${term}:`, error);
        }
      }
    }
  }, 1000); // Start prefetching after 1 second
}

/**
 * Main search function - Uses 100% FREE APIs with aggressive client-side caching!
 * All fetched ingredients are stored permanently in localStorage
 */
export async function searchIngredients(query: string): Promise<Ingredient[]> {
  if (query.length < 2) return [];

  // Start prefetching common ingredients on first search
  if (!isPrefetching) {
    prefetchCommonIngredients();
  }

  const cacheKey = query.toLowerCase();
  
  // INSTANT: Check exact search result cache (fastest - O(1) lookup)
  const cached = searchCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`⚡ INSTANT cache hit for "${query}"`);
    return cached.results;
  }

  // Skip expensive localStorage scan entirely - just hit API
  // The searchCache already handles caching efficiently

  console.log(`🌐 Fetching from API for "${query}"...`);
  const results: Ingredient[] = [];

  // Fetch from API and cache EVERYTHING
  try {
    const openFoodResults = await searchOpenFoodFacts(query);
    if (openFoodResults.length > 0) {
      // Store every ingredient in permanent cache
      openFoodResults.forEach(ingredient => {
        const normalizedName = ingredient.name.toLowerCase().trim();
        allIngredientsCache.set(normalizedName, ingredient);
      });
      results.push(...openFoodResults);
      
      // Save to localStorage less frequently (don't block)
      if (allIngredientsCache.size % 100 === 0) {
        setTimeout(() => saveCacheToLocalStorage(), 0); // Non-blocking
      }
    }
  } catch (error) {
    console.warn("Open Food Facts search failed:", error);
  }

  // Only use USDA as last resort
  if (results.length === 0) {
    try {
      const usdaResults = await searchUSDAIngredients(query);
      if (usdaResults.length > 0) {
        // Store USDA results too
        usdaResults.forEach(ingredient => {
          const normalizedName = ingredient.name.toLowerCase().trim();
          allIngredientsCache.set(normalizedName, ingredient);
        });
        results.push(...usdaResults);
      }
    } catch (error) {
      console.warn("USDA search failed:", error);
    }
  }

  // Remove duplicates
  const uniqueResults = results.filter((item, index, self) => {
    const firstIndex = self.findIndex(
      (i) => i.name.toLowerCase().trim() === item.name.toLowerCase().trim()
    );
    return firstIndex === index;
  });

  const finalResults = uniqueResults.slice(0, 20);

  // Cache the search results (this is fast - in-memory)
  searchCache.set(cacheKey, { results: finalResults, timestamp: Date.now() });

  // Save to localStorage in background (non-blocking)
  setTimeout(() => saveCacheToLocalStorage(), 1000);

  console.log(`📦 ${allIngredientsCache.size} ingredients cached`);

  return finalResults;
}

/**
 * Clear expired cache entries (runs automatically)
 */
function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of searchCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      searchCache.delete(key);
    }
  }
}

// Run cache cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupCache, 10 * 60 * 1000);
}

/**
 * Manually trigger prefetch (exported for UI)
 */
export function initializeSearchCache() {
  prefetchCommonIngredients();
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats() {
  return {
    size: searchCache.size,
    isPrefetching,
  };
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
