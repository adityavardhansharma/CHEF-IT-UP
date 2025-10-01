import { mutation } from "./_generated/server";

export const seedGlobalPantryItems = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("globalPantryItems").first();
    if (existing) {
      return { message: "Already seeded" };
    }

    const items = [
      // Vegetables
      { name: "Tomato", category: "Vegetables", nutritionalInfo: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 } },
      { name: "Onion", category: "Vegetables", nutritionalInfo: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 } },
      { name: "Potato", category: "Vegetables", nutritionalInfo: { calories: 77, protein: 2, carbs: 17, fat: 0.1 } },
      { name: "Carrot", category: "Vegetables", nutritionalInfo: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 } },
      { name: "Bell Pepper", category: "Vegetables", nutritionalInfo: { calories: 31, protein: 1, carbs: 6, fat: 0.3 } },
      { name: "Garlic", category: "Vegetables", nutritionalInfo: { calories: 149, protein: 6.4, carbs: 33, fat: 0.5 } },
      { name: "Ginger", category: "Vegetables", nutritionalInfo: { calories: 80, protein: 1.8, carbs: 18, fat: 0.8 } },
      { name: "Spinach", category: "Vegetables", nutritionalInfo: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 } },
      { name: "Broccoli", category: "Vegetables", nutritionalInfo: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 } },
      { name: "Cauliflower", category: "Vegetables", nutritionalInfo: { calories: 25, protein: 1.9, carbs: 5, fat: 0.3 } },
      { name: "Cabbage", category: "Vegetables", nutritionalInfo: { calories: 25, protein: 1.3, carbs: 5.8, fat: 0.1 } },
      { name: "Cucumber", category: "Vegetables", nutritionalInfo: { calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1 } },
      { name: "Eggplant", category: "Vegetables", nutritionalInfo: { calories: 25, protein: 1, carbs: 6, fat: 0.2 } },
      { name: "Zucchini", category: "Vegetables", nutritionalInfo: { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 } },
      { name: "Mushroom", category: "Vegetables", nutritionalInfo: { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 } },
      { name: "Lettuce", category: "Vegetables", nutritionalInfo: { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 } },
      { name: "Celery", category: "Vegetables", nutritionalInfo: { calories: 16, protein: 0.7, carbs: 3, fat: 0.2 } },
      { name: "Green Beans", category: "Vegetables", nutritionalInfo: { calories: 31, protein: 1.8, carbs: 7, fat: 0.2 } },
      { name: "Peas", category: "Vegetables", nutritionalInfo: { calories: 81, protein: 5.4, carbs: 14, fat: 0.4 } },
      { name: "Corn", category: "Vegetables", nutritionalInfo: { calories: 86, protein: 3.3, carbs: 19, fat: 1.4 } },
      
      // Fruits
      { name: "Apple", category: "Fruits", nutritionalInfo: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 } },
      { name: "Banana", category: "Fruits", nutritionalInfo: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 } },
      { name: "Orange", category: "Fruits", nutritionalInfo: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 } },
      { name: "Lemon", category: "Fruits", nutritionalInfo: { calories: 29, protein: 1.1, carbs: 9, fat: 0.3 } },
      { name: "Lime", category: "Fruits", nutritionalInfo: { calories: 30, protein: 0.7, carbs: 11, fat: 0.2 } },
      { name: "Strawberry", category: "Fruits", nutritionalInfo: { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 } },
      { name: "Blueberry", category: "Fruits", nutritionalInfo: { calories: 57, protein: 0.7, carbs: 14, fat: 0.3 } },
      { name: "Mango", category: "Fruits", nutritionalInfo: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4 } },
      { name: "Pineapple", category: "Fruits", nutritionalInfo: { calories: 50, protein: 0.5, carbs: 13, fat: 0.1 } },
      { name: "Watermelon", category: "Fruits", nutritionalInfo: { calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2 } },
      { name: "Grapes", category: "Fruits", nutritionalInfo: { calories: 69, protein: 0.7, carbs: 18, fat: 0.2 } },
      { name: "Avocado", category: "Fruits", nutritionalInfo: { calories: 160, protein: 2, carbs: 8.5, fat: 15 } },
      
      // Grains & Cereals
      { name: "Rice (White)", category: "Grains", nutritionalInfo: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 } },
      { name: "Rice (Brown)", category: "Grains", nutritionalInfo: { calories: 111, protein: 2.6, carbs: 23, fat: 0.9 } },
      { name: "Quinoa", category: "Grains", nutritionalInfo: { calories: 120, protein: 4.4, carbs: 21, fat: 1.9 } },
      { name: "Oats", category: "Grains", nutritionalInfo: { calories: 389, protein: 16.9, carbs: 66, fat: 6.9 } },
      { name: "Pasta", category: "Grains", nutritionalInfo: { calories: 131, protein: 5, carbs: 25, fat: 1.1 } },
      { name: "Bread (Whole Wheat)", category: "Grains", nutritionalInfo: { calories: 247, protein: 13, carbs: 41, fat: 3.4 } },
      { name: "Couscous", category: "Grains", nutritionalInfo: { calories: 112, protein: 3.8, carbs: 23, fat: 0.2 } },
      { name: "Barley", category: "Grains", nutritionalInfo: { calories: 123, protein: 2.3, carbs: 28, fat: 0.4 } },
      
      // Pulses & Legumes
      { name: "Lentils (Red)", category: "Pulses", nutritionalInfo: { calories: 116, protein: 9, carbs: 20, fat: 0.4 } },
      { name: "Lentils (Green)", category: "Pulses", nutritionalInfo: { calories: 116, protein: 9, carbs: 20, fat: 0.4 } },
      { name: "Chickpeas", category: "Pulses", nutritionalInfo: { calories: 164, protein: 8.9, carbs: 27, fat: 2.6 } },
      { name: "Black Beans", category: "Pulses", nutritionalInfo: { calories: 132, protein: 8.9, carbs: 24, fat: 0.5 } },
      { name: "Kidney Beans", category: "Pulses", nutritionalInfo: { calories: 127, protein: 8.7, carbs: 23, fat: 0.5 } },
      { name: "Green Lentils", category: "Pulses", nutritionalInfo: { calories: 116, protein: 9, carbs: 20, fat: 0.4 } },
      
      // Proteins
      { name: "Chicken Breast", category: "Proteins", nutritionalInfo: { calories: 165, protein: 31, carbs: 0, fat: 3.6 } },
      { name: "Ground Beef", category: "Proteins", nutritionalInfo: { calories: 250, protein: 26, carbs: 0, fat: 15 } },
      { name: "Salmon", category: "Proteins", nutritionalInfo: { calories: 208, protein: 20, carbs: 0, fat: 13 } },
      { name: "Tuna", category: "Proteins", nutritionalInfo: { calories: 144, protein: 30, carbs: 0, fat: 1 } },
      { name: "Eggs", category: "Proteins", nutritionalInfo: { calories: 155, protein: 13, carbs: 1.1, fat: 11 } },
      { name: "Tofu", category: "Proteins", nutritionalInfo: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8 } },
      { name: "Shrimp", category: "Proteins", nutritionalInfo: { calories: 99, protein: 24, carbs: 0.2, fat: 0.3 } },
      
      // Dairy
      { name: "Milk (Whole)", category: "Dairy", nutritionalInfo: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 } },
      { name: "Milk (Skim)", category: "Dairy", nutritionalInfo: { calories: 34, protein: 3.4, carbs: 5, fat: 0.1 } },
      { name: "Yogurt (Plain)", category: "Dairy", nutritionalInfo: { calories: 59, protein: 3.5, carbs: 3.6, fat: 3.3 } },
      { name: "Cheese (Cheddar)", category: "Dairy", nutritionalInfo: { calories: 402, protein: 25, carbs: 1.3, fat: 33 } },
      { name: "Butter", category: "Dairy", nutritionalInfo: { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 } },
      { name: "Cream", category: "Dairy", nutritionalInfo: { calories: 340, protein: 2.1, carbs: 2.7, fat: 36 } },
      
      // Oils & Fats
      { name: "Olive Oil", category: "Oils", nutritionalInfo: { calories: 884, protein: 0, carbs: 0, fat: 100 } },
      { name: "Vegetable Oil", category: "Oils", nutritionalInfo: { calories: 884, protein: 0, carbs: 0, fat: 100 } },
      { name: "Coconut Oil", category: "Oils", nutritionalInfo: { calories: 862, protein: 0, carbs: 0, fat: 100 } },
      { name: "Sesame Oil", category: "Oils", nutritionalInfo: { calories: 884, protein: 0, carbs: 0, fat: 100 } },
      
      // Spices & Seasonings
      { name: "Salt", category: "Spices", nutritionalInfo: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
      { name: "Black Pepper", category: "Spices", nutritionalInfo: { calories: 251, protein: 10, carbs: 64, fat: 3.3 } },
      { name: "Cumin", category: "Spices", nutritionalInfo: { calories: 375, protein: 18, carbs: 44, fat: 22 } },
      { name: "Coriander", category: "Spices", nutritionalInfo: { calories: 298, protein: 12, carbs: 55, fat: 18 } },
      { name: "Turmeric", category: "Spices", nutritionalInfo: { calories: 312, protein: 9.7, carbs: 67, fat: 3.3 } },
      { name: "Paprika", category: "Spices", nutritionalInfo: { calories: 282, protein: 14, carbs: 54, fat: 13 } },
      { name: "Chili Powder", category: "Spices", nutritionalInfo: { calories: 282, protein: 13, carbs: 50, fat: 14 } },
      { name: "Oregano", category: "Spices", nutritionalInfo: { calories: 265, protein: 9, carbs: 69, fat: 4.3 } },
      { name: "Basil", category: "Spices", nutritionalInfo: { calories: 23, protein: 3.2, carbs: 2.7, fat: 0.6 } },
      { name: "Thyme", category: "Spices", nutritionalInfo: { calories: 101, protein: 5.6, carbs: 24, fat: 1.7 } },
      { name: "Rosemary", category: "Spices", nutritionalInfo: { calories: 131, protein: 3.3, carbs: 20, fat: 5.9 } },
      { name: "Cinnamon", category: "Spices", nutritionalInfo: { calories: 247, protein: 4, carbs: 81, fat: 1.2 } },
      
      // Condiments
      { name: "Soy Sauce", category: "Condiments", nutritionalInfo: { calories: 53, protein: 5.6, carbs: 4.9, fat: 0.1 } },
      { name: "Tomato Sauce", category: "Condiments", nutritionalInfo: { calories: 29, protein: 1.6, carbs: 7, fat: 0.2 } },
      { name: "Mayonnaise", category: "Condiments", nutritionalInfo: { calories: 680, protein: 1.2, carbs: 0.6, fat: 75 } },
      { name: "Mustard", category: "Condiments", nutritionalInfo: { calories: 66, protein: 4, carbs: 6, fat: 4 } },
      { name: "Ketchup", category: "Condiments", nutritionalInfo: { calories: 101, protein: 1.7, carbs: 27, fat: 0.1 } },
      { name: "Vinegar (White)", category: "Condiments", nutritionalInfo: { calories: 18, protein: 0, carbs: 0.04, fat: 0 } },
      { name: "Balsamic Vinegar", category: "Condiments", nutritionalInfo: { calories: 88, protein: 0.5, carbs: 17, fat: 0 } },
      { name: "Honey", category: "Condiments", nutritionalInfo: { calories: 304, protein: 0.3, carbs: 82, fat: 0 } },
      
      // Baking
      { name: "Flour (All-Purpose)", category: "Baking", nutritionalInfo: { calories: 364, protein: 10, carbs: 76, fat: 1 } },
      { name: "Sugar (White)", category: "Baking", nutritionalInfo: { calories: 387, protein: 0, carbs: 100, fat: 0 } },
      { name: "Brown Sugar", category: "Baking", nutritionalInfo: { calories: 380, protein: 0, carbs: 98, fat: 0 } },
      { name: "Baking Powder", category: "Baking", nutritionalInfo: { calories: 53, protein: 0, carbs: 28, fat: 0 } },
      { name: "Baking Soda", category: "Baking", nutritionalInfo: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
      { name: "Vanilla Extract", category: "Baking", nutritionalInfo: { calories: 288, protein: 0.1, carbs: 13, fat: 0.1 } },
      
      // Nuts & Seeds
      { name: "Almonds", category: "Nuts", nutritionalInfo: { calories: 579, protein: 21, carbs: 22, fat: 50 } },
      { name: "Walnuts", category: "Nuts", nutritionalInfo: { calories: 654, protein: 15, carbs: 14, fat: 65 } },
      { name: "Cashews", category: "Nuts", nutritionalInfo: { calories: 553, protein: 18, carbs: 30, fat: 44 } },
      { name: "Peanuts", category: "Nuts", nutritionalInfo: { calories: 567, protein: 26, carbs: 16, fat: 49 } },
      { name: "Chia Seeds", category: "Seeds", nutritionalInfo: { calories: 486, protein: 17, carbs: 42, fat: 31 } },
      { name: "Sunflower Seeds", category: "Seeds", nutritionalInfo: { calories: 584, protein: 21, carbs: 20, fat: 51 } },
    ];

    for (const item of items) {
      await ctx.db.insert("globalPantryItems", item);
    }

    return { message: `Seeded ${items.length} items` };
  },
});
