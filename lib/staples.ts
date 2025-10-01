/**
 * Basic Staple Ingredients
 * These are assumed to be always available in most kitchens
 */

export const BASIC_STAPLES = [
  // Seasonings
  "Salt",
  "Black Pepper",
  "White Pepper",
  "Sugar",
  "Brown Sugar",
  
  // Oils & Fats
  "Olive Oil",
  "Vegetable Oil",
  "Butter",
  
  // Basics
  "Water",
  "Ice",
  
  // Common Condiments
  "Vinegar",
  "Soy Sauce",
  
  // Baking Basics
  "Flour",
  "Baking Powder",
  "Baking Soda",
  
  // Common Aromatics
  "Garlic",
  "Onion",
];

/**
 * Check if an ingredient is a basic staple
 */
export function isBasicStaple(ingredientName: string): boolean {
  const normalizedName = ingredientName.toLowerCase().trim();
  return BASIC_STAPLES.some(staple => 
    normalizedName.includes(staple.toLowerCase()) ||
    staple.toLowerCase().includes(normalizedName)
  );
}

/**
 * Filter out basic staples from ingredient list
 */
export function filterOutStaples(ingredients: string[]): string[] {
  return ingredients.filter(ingredient => !isBasicStaple(ingredient));
}

/**
 * Get missing ingredients (not in pantry and not staples if enabled)
 */
export function getMissingIngredients(
  recipeIngredients: Array<{ name: string }>,
  pantryItems: Array<{ name?: string; customItemName?: string }>,
  assumeStaples: boolean = true
): string[] {
  const pantryNames = new Set(
    pantryItems.map(item => 
      (item.name || item.customItemName || "").toLowerCase().trim()
    )
  );

  return recipeIngredients
    .filter(ingredient => {
      const ingredientName = ingredient.name.toLowerCase().trim();
      
      // If we assume staples and this is a staple, not missing
      if (assumeStaples && isBasicStaple(ingredient.name)) {
        return false;
      }
      
      // Check if in pantry (exact match or contains)
      const inPantry = Array.from(pantryNames).some(pantryName => 
        pantryName.includes(ingredientName) || 
        ingredientName.includes(pantryName)
      );
      
      return !inPantry;
    })
    .map(ingredient => ingredient.name);
}
