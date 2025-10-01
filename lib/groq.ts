import Groq from "groq-sdk";

// Initialize Groq lazily to avoid client-side instantiation errors
let groq: Groq | null = null;

function getGroqClient() {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set in environment variables");
    }
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
}

export interface MealPlanParameters {
  familySize: number;
  mealsPerDay: string[];
  dietType: string;
  cuisinePreference?: string;
  negativeIngredients: string[];
  duration: number;
  durationUnit: string;
  assumeBasicStaples?: boolean;
}

export interface UserProfile {
  name?: string;
  allergies: Array<{ name: string; severity: string }>;
  medicalConditions: string[];
  favoriteIngredients: string[];
}

export interface PantryItem {
  name: string;
  quantity: number;
  unit: string;
}

/**
 * Fixes common AI mistakes in the JSON structure
 */
function fixMealStructure(meal: any): any {
  // Ensure recipeData exists
  if (!meal.recipeData) {
    meal.recipeData = {
      ingredients: [],
      instructions: [],
      cookingTime: 30,
      difficulty: "medium",
      utensils: [],
    };
  }

  // Ensure all required recipeData fields exist
  if (!meal.recipeData.cookingTime) {
    meal.recipeData.cookingTime = 30;
  }
  if (!meal.recipeData.difficulty) {
    meal.recipeData.difficulty = "medium";
  }
  if (!meal.recipeData.instructions) {
    meal.recipeData.instructions = ["No instructions provided"];
  }
  if (!meal.recipeData.utensils) {
    meal.recipeData.utensils = ["Basic kitchen utensils"];
  }
  if (!meal.recipeData.ingredients) {
    meal.recipeData.ingredients = [];
  }

  // Fix ingredients with wrong field names (e.g., "tbsp": "tbsp" should be "unit": "tbsp")
  if (meal.recipeData.ingredients) {
    meal.recipeData.ingredients = meal.recipeData.ingredients.map((ing: any) => {
      // If 'unit' field is missing but there's another field, fix it
      if (!ing.unit) {
        const keys = Object.keys(ing);
        const possibleUnitKey = keys.find(key => 
          key !== 'name' && key !== 'quantity' && 
          typeof ing[key] === 'string' && ing[key] === key
        );
        
        if (possibleUnitKey) {
          ing.unit = ing[possibleUnitKey];
          delete ing[possibleUnitKey];
        } else {
          // If no unit field and can't find one, default to "unit"
          ing.unit = "unit";
        }
      }
      return ing;
    });
  }

  // Ensure nutritionalInfo exists
  if (!meal.nutritionalInfo) {
    meal.nutritionalInfo = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
    };
  }

  return meal;
}

/**
 * Cleans AI response by removing reasoning traces and extracting pure JSON
 */
function cleanAIResponse(content: string): string {
  // Remove common reasoning trace patterns
  let cleaned = content;
  
  // Remove <thinking>...</thinking> tags
  cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
  
  // Remove [Reasoning: ...] blocks
  cleaned = cleaned.replace(/\[Reasoning:[\s\S]*?\]/gi, '');
  
  // Remove thinking blocks with variations
  cleaned = cleaned.replace(/\*\*Thinking:\*\*[\s\S]*?(?=\{|$)/gi, '');
  cleaned = cleaned.replace(/Thinking:[\s\S]*?(?=\{|$)/gi, '');
  
  // Remove "Let me think" or "Let me analyze" patterns
  cleaned = cleaned.replace(/Let me (think|analyze|consider|plan)[\s\S]*?(?=\{|$)/gi, '');
  
  // Remove markdown code blocks if present
  cleaned = cleaned.replace(/```json\s*/gi, '');
  cleaned = cleaned.replace(/```\s*/gi, '');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  // Extract JSON object if there's text before/after it
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  return cleaned;
}

export async function generateMealPlan(
  userProfile: UserProfile,
  pantryItems: PantryItem[],
  parameters: MealPlanParameters
) {
  const totalDays =
    parameters.durationUnit === "weeks"
      ? parameters.duration * 7
      : parameters.duration;

  const prompt = `You are an expert AI chef and nutritionist. Generate a personalized ${totalDays}-day meal plan.

USER PROFILE:
- Name: ${userProfile.name || "User"}
- Family Size: ${parameters.familySize} people
- Allergies: ${userProfile.allergies.map((a) => `${a.name} (${a.severity})`).join(", ") || "None"}
- Medical Conditions: ${userProfile.medicalConditions.join(", ") || "None"}
- Favorite Ingredients: ${userProfile.favoriteIngredients.join(", ") || "None specified"}

AVAILABLE PANTRY ITEMS:
${pantryItems.map((item) => `- ${item.name}: ${item.quantity} ${item.unit}`).join("\n")}
${parameters.assumeBasicStaples !== false ? "\nNOTE: Assume basic kitchen staples are always available (salt, pepper, oil, butter, sugar, flour, etc.)" : ""}

MEAL PLAN REQUIREMENTS:
- Duration: ${totalDays} days
- Meals per day: ${parameters.mealsPerDay.join(", ")}
- Diet Type: ${parameters.dietType}
- Cuisine Preference: ${parameters.cuisinePreference || "Any"}
- Ingredients to AVOID: ${parameters.negativeIngredients.join(", ") || "None"}
- Basic Staples: ${parameters.assumeBasicStaples !== false ? "Assumed available" : "Must be in pantry"}

IMPORTANT INSTRUCTIONS:
1. Create balanced, nutritious meals appropriate for the medical conditions listed
2. PRIORITIZE using available pantry ingredients
3. Respect all allergies and avoid blacklisted ingredients completely
4. For ${totalDays} days, generate ONE meal per meal type per day (e.g., ONE breakfast for Day 1, ONE lunch for Day 1, etc.)
5. Ingredient quantities should be TOTAL amounts for ${parameters.familySize} people (e.g., if 1 person needs 200g chicken, then for 2 people use 400g)
6. Nutritional information MUST be PER SERVING (for ONE person), not total
7. ${parameters.assumeBasicStaples !== false ? "You may use basic staples (salt, pepper, oil, butter, sugar, flour, etc.) without listing them in pantry" : "All ingredients must be explicitly listed in the pantry"}
8. Include detailed cooking instructions and required utensils
9. Vary recipes to prevent repetition across days
10. For each meal include: recipe name, description, ingredients with quantities (for ${parameters.familySize} people total), step-by-step instructions, cooking time, difficulty, utensils needed, and nutritional info (PER PERSON)

OUTPUT FORMAT:
Return a valid JSON object with this exact structure:
{
  "meals": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "mealType": "breakfast/lunch/dinner/snacks/dessert",
      "recipeName": "Recipe Name",
      "recipeDescription": "Brief description",
      "recipeData": {
        "ingredients": [
          {"name": "ingredient", "quantity": 0.0, "unit": "unit"}
        ],
        "instructions": ["Step 1", "Step 2"],
        "cookingTime": 30,
        "difficulty": "easy/medium/hard",
        "utensils": ["pan", "spatula"]
      },
      "nutritionalInfo": {
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0,
        "fiber": 0,
        "sodium": 0
      },
      "portionSize": ${parameters.familySize}
    }
  ]
}

CRITICAL FORMATTING RULES:
- The ingredients array MUST use the field name "unit" (NOT the unit value as field name)
- CORRECT: {"name": "Olive oil", "quantity": 2, "unit": "tbsp"}
- WRONG: {"name": "Olive oil", "quantity": 2, "tbsp": "tbsp"}
- WRONG: {"name": "Olive oil", "quantity": 2, "cups": "cups"}

CRITICAL QUANTITY & NUTRITION RULES:
- Ingredient quantities = TOTAL for ${parameters.familySize} people (e.g., for 3 people and 200g per person = 600g total)
- Nutritional info (calories, protein, etc.) = PER SERVING (for ONE person)
- portionSize field = ${parameters.familySize} (number of people)
- Generate ONE meal per meal type per day, NOT multiple meals per meal type

Generate the complete meal plan now. Return ONLY valid JSON, no other text.`;

  try {
    const groqClient = getGroqClient();
    const completion = await groqClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert chef and nutritionist who creates personalized meal plans. You MUST respond with valid JSON only. Do NOT include any reasoning, thinking, or explanatory text. Output ONLY the JSON object.\n\nCRITICAL JSON RULES:\n1. In ingredients array, field MUST be named 'unit' (NOT 'tbsp', 'cups', 'g', etc.)\n2. Every meal MUST have a nutritionalInfo object with calories, protein, carbs, fat\n3. Every meal MUST have complete recipeData with: ingredients, instructions, cookingTime, difficulty, utensils\n4. Follow the exact field names provided in the template\n5. DO NOT skip any required fields",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    // Clean any reasoning traces from the response
    const cleanedContent = cleanAIResponse(content);
    
    const mealPlan = JSON.parse(cleanedContent);
    
    // Fix any structural issues in meals
    if (mealPlan.meals) {
      mealPlan.meals = mealPlan.meals.map(fixMealStructure);
    }
    
    return mealPlan;
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw error;
  }
}

export async function regenerateMeal(
  userProfile: UserProfile,
  pantryItems: PantryItem[],
  mealType: string,
  date: string,
  familySize: number,
  dietType: string,
  customRequest?: string
) {
  const prompt = `You are an expert AI chef. Generate a single ${mealType} recipe for ${date}.

USER PROFILE:
- Name: ${userProfile.name || "User"}
- Family Size: ${familySize} people
- Allergies: ${userProfile.allergies.map((a) => `${a.name} (${a.severity})`).join(", ") || "None"}
- Medical Conditions: ${userProfile.medicalConditions.join(", ") || "None"}
- Diet Type: ${dietType}

AVAILABLE PANTRY:
${pantryItems.map((item) => `- ${item.name}: ${item.quantity} ${item.unit}`).join("\n")}

${customRequest ? `SPECIFIC REQUEST: ${customRequest}` : "Generate a surprise meal using available ingredients."}

Return a valid JSON object with this structure:
{
  "recipeName": "Recipe Name",
  "recipeDescription": "Brief description",
  "recipeData": {
    "ingredients": [{"name": "ingredient", "quantity": 0.0, "unit": "unit"}],
    "instructions": ["Step 1", "Step 2"],
    "cookingTime": 30,
    "difficulty": "easy/medium/hard",
    "utensils": ["pan", "spatula"]
  },
  "nutritionalInfo": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "fiber": 0,
    "sodium": 0
  }
}

CRITICAL FORMATTING RULES:
- The ingredients array MUST use the field name "unit" (NOT the unit value as field name)
- CORRECT: {"name": "Olive oil", "quantity": 2, "unit": "tbsp"}
- WRONG: {"name": "Olive oil", "quantity": 2, "tbsp": "tbsp"}

Return ONLY valid JSON, no other text.`;

  try {
    const groqClient = getGroqClient();
    const completion = await groqClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert chef who creates recipes. You MUST respond with valid JSON only. Do NOT include any reasoning, thinking, or explanatory text. Output ONLY the JSON object.\n\nCRITICAL JSON RULES:\n1. In ingredients array, field MUST be named 'unit' (NOT 'tbsp', 'cups', 'g', etc.)\n2. The meal MUST have a nutritionalInfo object with calories, protein, carbs, fat\n3. Follow the exact field names provided in the template",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "openai/gpt-oss-120b",
      temperature: customRequest ? 0.7 : 0.9,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    // Clean any reasoning traces from the response
    const cleanedContent = cleanAIResponse(content);
    
    let meal = JSON.parse(cleanedContent);
    
    // Fix any structural issues
    meal = fixMealStructure(meal);
    
    return meal;
  } catch (error) {
    console.error("Error regenerating meal:", error);
    throw error;
  }
}
