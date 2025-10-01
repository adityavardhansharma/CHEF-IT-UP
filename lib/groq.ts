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
  const totalDays = parameters.durationUnit === "weeks" ? parameters.duration * 7 : parameters.duration;
  const totalMeals = totalDays * parameters.mealsPerDay.length;
  const mealTypesList = parameters.mealsPerDay.join(", ");

  const prompt = `Create ${totalMeals} recipes for ${totalDays} days.

DETAILS: ${parameters.familySize} people. Diet: ${parameters.dietType}. Avoid: ${parameters.negativeIngredients.join(", ") || "none"}. Allergies: ${userProfile.allergies.map(a => a.name).join(", ") || "none"}.
Pantry (use these): ${pantryItems.slice(0, 10).map(i => `${i.name} (${i.quantity}${i.unit})`).join("; ")}${pantryItems.length > 10 ? "; +more" : ""}.

STRUCTURE - Generate ONE recipe per slot:
- Day 1 breakfast, Day 1 lunch, Day 1 dinner
- Day 2 breakfast, Day 2 lunch, Day 2 dinner
- Day 3 breakfast, Day 3 lunch, Day 3 dinner
- ... repeat pattern for ALL ${totalDays} days (total ${totalMeals} recipes)

Rules:
- Quantities: total for ${parameters.familySize} people
- Nutrition: per person
- Ingredients format: {"name":"oil","quantity":2,"unit":"tbsp"}
- Vary recipes, use pantry items

JSON only - ${totalMeals} meals in "meals" array:
{"meals":[{"day":1,"date":"YYYY-MM-DD","mealType":"breakfast","recipeName":"Name","recipeDescription":"desc","recipeData":{"ingredients":[{"name":"item","quantity":1,"unit":"g"}],"instructions":["step1"],"cookingTime":30,"difficulty":"easy","utensils":["pan"]},"nutritionalInfo":{"calories":300,"protein":20,"carbs":40,"fat":10},"portionSize":${parameters.familySize}}]}`;

  try {
    const groqClient = getGroqClient();
    const completion = await groqClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Generate EXACTLY ${totalMeals} meals for all ${totalDays} days. Do not truncate. Full JSON only. No explanations.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      max_tokens: 16000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const cleanedContent = cleanAIResponse(content);
    const mealPlan = JSON.parse(cleanedContent);
    
    if (mealPlan.meals) {
      mealPlan.meals = mealPlan.meals.map(fixMealStructure);
      
      const seenCombinations = new Map<string, any>();
      const uniqueMeals: any[] = [];
      
      for (const meal of mealPlan.meals) {
        const key = `${meal.day}-${meal.mealType}`;
        if (!seenCombinations.has(key)) {
          seenCombinations.set(key, meal);
          uniqueMeals.push(meal);
        } else {
          console.warn(`Duplicate meal found for ${key}, removing duplicate`);
        }
      }
      
      const mealsPerDay = parameters.mealsPerDay.length;
      const expectedMeals = totalDays * mealsPerDay;
      
      const daysMissing: number[] = [];
      for (let day = 1; day <= totalDays; day++) {
        const mealsForDay = uniqueMeals.filter(m => m.day === day).length;
        if (mealsForDay < mealsPerDay) {
          daysMissing.push(day);
          console.warn(`Day ${day} is missing meals (has ${mealsForDay}, needs ${mealsPerDay})`);
        }
      }
      
      if (daysMissing.length > 0) {
        console.warn(`Redistributing meals to cover all ${totalDays} days`);
        
        const organizedMeals: any[] = [];
        let mealIndex = 0;
        
        for (let day = 1; day <= totalDays; day++) {
          for (const mealType of parameters.mealsPerDay) {
            if (mealIndex < uniqueMeals.length) {
              const meal = { ...uniqueMeals[mealIndex] };
              meal.day = day;
              meal.mealType = mealType;
              const startDate = new Date(parameters.mealsPerDay[0] === 'breakfast' ? Date.now() : Date.now());
              startDate.setDate(startDate.getDate() + (day - 1));
              meal.date = startDate.toISOString().split('T')[0];
              organizedMeals.push(meal);
              mealIndex++;
            }
          }
        }
        
        mealPlan.meals = organizedMeals;
        console.log(`Redistributed ${organizedMeals.length} meals across ${totalDays} days`);
      } else {
        mealPlan.meals = uniqueMeals;
      }
      
      console.log(`Generated ${mealPlan.meals.length} unique meals (expected: ${expectedMeals})`);
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
      max_tokens: 8000,
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
