 import Groq from "groq-sdk";
import Cerebras from "@cerebras/cerebras_cloud_sdk";

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

// Initialize Cerebras lazily to avoid client-side instantiation errors
let cerebras: Cerebras | null = null;

function getCerebrasClient() {
  if (!cerebras) {
    if (!process.env.CEREBRAS_API_KEY) {
      throw new Error("CEREBRAS_API_KEY is not set in environment variables");
    }
    cerebras = new Cerebras({
      apiKey: process.env.CEREBRAS_API_KEY,
    });
  }
  return cerebras;
}

export interface MealPlanParameters {
  familySize: number;
  mealsPerDay: string[];
  dietType: string;
  cuisinePreferences?: string[]; // Optional array
  negativeIngredients: string[];
  duration: number;
  durationUnit: string;
  assumeBasicStaples?: boolean;
  customInstructions?: string;
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
 * Converts textual numbers to actual numbers in JSON (e.g., "thirty" -> 30)
 */
function fixNumericValues(obj: any): any {
  const wordToNumber: { [key: string]: number } = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
    'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
    'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
    'hundred': 100, 'thousand': 1000
  };

  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        const lower = obj[key].toLowerCase().trim();
        
        // Check if it's a word number
        if (wordToNumber[lower] !== undefined) {
          obj[key] = wordToNumber[lower];
        } else if (!isNaN(Number(obj[key]))) {
          // If it's a numeric string like "30"
          const numValue = parseFloat(obj[key]);
          if (!isNaN(numValue)) {
            obj[key] = numValue;
          }
        }
      } else if (typeof obj[key] === 'object') {
        fixNumericValues(obj[key]);
      }
    }
  }
  return obj;
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

  // Replace common word numbers with actual numbers in JSON context
  cleaned = cleaned.replace(/:\s*zero\b/gi, ': 0');
  cleaned = cleaned.replace(/:\s*one\b/gi, ': 1');
  cleaned = cleaned.replace(/:\s*two\b/gi, ': 2');
  cleaned = cleaned.replace(/:\s*three\b/gi, ': 3');
  cleaned = cleaned.replace(/:\s*four\b/gi, ': 4');
  cleaned = cleaned.replace(/:\s*five\b/gi, ': 5');
  cleaned = cleaned.replace(/:\s*six\b/gi, ': 6');
  cleaned = cleaned.replace(/:\s*seven\b/gi, ': 7');
  cleaned = cleaned.replace(/:\s*eight\b/gi, ': 8');
  cleaned = cleaned.replace(/:\s*nine\b/gi, ': 9');
  cleaned = cleaned.replace(/:\s*ten\b/gi, ': 10');
  cleaned = cleaned.replace(/:\s*fifteen\b/gi, ': 15');
  cleaned = cleaned.replace(/:\s*twenty\b/gi, ': 20');
  cleaned = cleaned.replace(/:\s*thirty\b/gi, ': 30');
  cleaned = cleaned.replace(/:\s*forty\b/gi, ': 40');
  cleaned = cleaned.replace(/:\s*fifty\b/gi, ': 50');
  cleaned = cleaned.replace(/:\s*sixty\b/gi, ': 60');
  cleaned = cleaned.replace(/:\s*seventy\b/gi, ': 70');
  cleaned = cleaned.replace(/:\s*eighty\b/gi, ': 80');
  cleaned = cleaned.replace(/:\s*ninety\b/gi, ': 90');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  // More robust JSON extraction with multiple fallback methods
  try {
    // Method 1: Try to find complete JSON structure with brace counting
    const startIndex = cleaned.indexOf('{');
    if (startIndex !== -1) {
      let braceCount = 0;
      let endIndex = -1;
      for (let i = startIndex; i < cleaned.length; i++) {
        if (cleaned[i] === '{') {
          braceCount++;
        } else if (cleaned[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
      }

      if (endIndex !== -1) {
        return cleaned.substring(startIndex, endIndex + 1);
      }
    }

    // Method 2: Try regex-based extraction
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
      return jsonMatch[0];
    }

    // Method 3: Find the outermost JSON-like structure
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return cleaned.substring(firstBrace, lastBrace + 1);
    }

    throw new Error("No valid JSON structure found in AI response");
  } catch (error) {
    console.error("JSON extraction failed, attempting repair...");
    return attemptJSONRepair(cleaned);
  }
}

/**
 * Attempts to repair malformed JSON with more aggressive fixes
 */
function attemptJSONRepair(content: string): string {
  // Try to find the main JSON structure and fix common issues
  const startIndex = content.indexOf('{');
  if (startIndex === -1) {
    throw new Error("No opening brace found for JSON repair");
  }

  // Find the last closing brace
  const lastBrace = content.lastIndexOf('}');
  if (lastBrace === -1 || lastBrace <= startIndex) {
    throw new Error("No valid closing brace found for JSON repair");
  }

  let jsonPart = content.substring(startIndex, lastBrace + 1);

  // Very aggressive JSON repair - multiple passes
  for (let i = 0; i < 5; i++) {
    const originalLength = jsonPart.length;

    // Fix trailing commas in arrays and objects (multiple patterns)
    jsonPart = jsonPart.replace(/,(\s*[}\]])/g, '$1');
    jsonPart = jsonPart.replace(/,(\s*}\s*,?\s*]?\s*$)/g, '$1');
    jsonPart = jsonPart.replace(/,(\s*}\s*$)/g, '$1');
    jsonPart = jsonPart.replace(/,(\s*]\s*$)/g, '$1');

    // Fix missing commas between array elements
    jsonPart = jsonPart.replace(/}(\s*\{)/g, '},$1');
    jsonPart = jsonPart.replace(/](\s*\{)/g, '],$1');
    jsonPart = jsonPart.replace(/}(\s*\[)/g, '},$1');
    jsonPart = jsonPart.replace(/](\s*\[)/g, '],$1');

    // Fix missing commas between object properties
    jsonPart = jsonPart.replace(/}(\s*")([^"]*":)/g, '},$1$2');
    jsonPart = jsonPart.replace(/}(\s*')([^']*':)/g, '},$1$2');

    // Fix malformed nested structures
    jsonPart = jsonPart.replace(/}(\s*\{[^}]*\})(\s*\{)/g, '$1},$2');
    jsonPart = jsonPart.replace(/}(\s*\[[^\]]*\])(\s*\{)/g, '$1},$2');

    // Fix array elements missing commas
    jsonPart = jsonPart.replace(/}(\s*\{[^}]*\})(\s*\{)/g, '$1},$2');

    // Clean up multiple consecutive commas
    jsonPart = jsonPart.replace(/,(\s*,)+/g, ',');

    // Remove any remaining trailing commas before braces/brackets
    jsonPart = jsonPart.replace(/,(\s*}[,\s]*\})/g, '$1');
    jsonPart = jsonPart.replace(/,(\s*][,\s]*\]|\s*}[,\s]*\]|\s*][,\s]*\})/g, '$1');

    // If no changes were made, break to avoid infinite loop
    if (jsonPart.length === originalLength) {
      break;
    }
  }

  return jsonPart;
}

export async function generateMealPlan(
  userProfile: UserProfile,
  pantryItems: PantryItem[],
  parameters: MealPlanParameters
) {
  const totalDays = parameters.durationUnit === "weeks" ? parameters.duration * 7 : parameters.duration;
  const totalMeals = totalDays * parameters.mealsPerDay.length;
  const mealTypesList = parameters.mealsPerDay.join(", ");

  const customInstructionsText = parameters.customInstructions ? `CUSTOM INSTRUCTIONS: ${parameters.customInstructions}` : "";

  // Create explicit meal sequence for clarity
  const mealSequence = parameters.mealsPerDay.map((meal, idx) => `${idx + 1}. ${meal}`).join(", ");
  
  const cuisineText = parameters.cuisinePreferences && parameters.cuisinePreferences.length > 0
    ? parameters.cuisinePreferences.join(", ")
    : "varied international";
  
  const prompt = `You are a professional meal planner creating a ${totalDays}-day cohesive meal plan for ${parameters.familySize} people.

USER REQUIREMENTS:
- Family size: ${parameters.familySize}
- Diet: ${parameters.dietType}
- Cuisines to mix: ${cuisineText} (create a diverse blend of these cuisines across the meal plan)
- Allergies (AVOID): ${userProfile.allergies.map(a => a.name).join(", ") || "None"}
- Avoid ingredients: ${parameters.negativeIngredients.join(", ") || "None"}
${customInstructionsText}

PANTRY ITEMS TO USE:
${pantryItems.slice(0, 15).map(item => `- ${item.name}: ${item.quantity} ${item.unit}`).join("\n")}

CRITICAL PLANNING RULES:
1. Generate EXACTLY ${totalMeals} recipes (${totalDays} days × ${parameters.mealsPerDay.length} meals per day)
2. EXACT MEAL TYPES IN THIS ORDER for EACH day: ${mealSequence}
   - You MUST create recipes for these EXACT meal types in this EXACT order
   - DO NOT substitute or skip any meal type
   - Each day follows the same meal type sequence
3. PLAN EACH DAY AS A COHESIVE UNIT - meals within a day should complement each other:
   - Avoid repeating main ingredients on the same day
   - Balance flavors throughout the day
   - Coordinate cooking methods - don't make everything the same way
4. CUISINE MIXING STRATEGY:
   - Distribute the selected cuisines (${cuisineText}) across all ${totalDays} days
   - Each day can feature 1-2 cuisines to maintain cohesion
   - Create fusion dishes that blend multiple cuisines creatively
   - Ensure all selected cuisines appear multiple times throughout the plan
5. NO DUPLICATE RECIPES across the entire ${totalDays}-day plan

OUTPUT STRUCTURE - FOLLOW THIS EXACT PATTERN:
${Array.from({length: totalDays}, (_, i) => {
  const dayNum = i + 1;
  const dayMeals = parameters.mealsPerDay.map(type => `  - "${type}"`).join("\n");
  return `Day ${dayNum}:\n${dayMeals}`;
}).join("\n")}

TECHNICAL FORMAT:
- Numbers: Use digits only (30, 2.5, 45) - NO words
- Ingredients: {"name":"item","quantity":2,"unit":"cups"}
- Instructions: 4-6 clear steps
- Times in minutes as numbers
- mealType must match EXACTLY: ${parameters.mealsPerDay.map(m => `"${m}"`).join(", ")}

{
  "meals": [
${parameters.mealsPerDay.map((mealType, idx) => `    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "mealType": "${mealType}",
      "recipeName": "Creative ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Name",
      "recipeDescription": "Brief description",
      "recipeData": {
        "ingredients": [
          {"name": "ingredient", "quantity": 2, "unit": "tbsp"}
        ],
        "instructions": [
          "Step 1: Detailed instruction",
          "Step 2: Another step"
        ],
        "cookingTime": 30,
        "difficulty": "easy",
        "utensils": ["tool"]
      },
      "nutritionalInfo": {
        "calories": 350,
        "protein": 18,
        "carbs": 25,
        "fat": 22,
        "fiber": 3,
        "sodium": 280
      },
      "portionSize": ${parameters.familySize}
    }${idx < parameters.mealsPerDay.length - 1 ? ',' : ''}`).join('\n')}
    // Continue this pattern for ALL ${totalDays} days
    // Each day has these ${parameters.mealsPerDay.length} meals: ${parameters.mealsPerDay.join(", ")}
    // Total: ${totalMeals} meal objects
  ]
}

MANDATORY OUTPUT RULES:
1. Generate ALL ${totalMeals} meals in strict sequential order - do NOT skip any
2. Each day MUST have exactly ${parameters.mealsPerDay.length} meals (${mealTypesList})
3. NO duplicate recipes across the entire plan
4. All numbers must be digits (30, 2.5) - NO text words
5. Follow daily themes to create cohesive, well-planned days
6. Valid JSON only - no explanations, markdown, or extra text

COUNT CHECK: Your output must contain exactly ${totalMeals} meal objects in the meals array.`;

  try {
    const groqClient = getGroqClient();
    const completion = await groqClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a professional meal planner. Generate EXACTLY ${totalMeals} complete meals for ${totalDays} days. Each day must have these EXACT meal types in order: ${parameters.mealsPerDay.join(", ")}. Total meals to generate: ${totalMeals}. Output ONLY valid JSON with all ${totalMeals} meal objects in the correct sequence. Do not skip any meals or substitute meal types.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.5,
      max_tokens: 32000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const cleanedContent = cleanAIResponse(content);
    let mealPlan = JSON.parse(cleanedContent);
    
    // Fix any textual numbers to actual numbers
    mealPlan = fixNumericValues(mealPlan);
    
    if (mealPlan.meals) {
      mealPlan.meals = mealPlan.meals.map(fixMealStructure);
      
      // Check for exact duplicates only (same day + meal type)
      const seenSlots = new Map<string, any>();
      const uniqueMeals: any[] = [];
      
      for (const meal of mealPlan.meals) {
        const slotKey = `${meal.day}-${meal.mealType}`;
        if (!seenSlots.has(slotKey)) {
          seenSlots.set(slotKey, meal);
          uniqueMeals.push(meal);
        } else {
          console.warn(`Duplicate slot detected for Day ${meal.day} ${meal.mealType}, keeping first occurrence`);
        }
      }
      
      const mealsPerDay = parameters.mealsPerDay.length;
      const expectedMeals = totalDays * mealsPerDay;
      
      // Validate we have the exact count needed
      if (uniqueMeals.length !== expectedMeals) {
        console.warn(`AI generated ${uniqueMeals.length} meals but expected ${expectedMeals}. This indicates the AI truncated the response.`);
        
        // Only throw error if we're significantly short (missing more than 2 meals)
        if (uniqueMeals.length < expectedMeals - 2) {
          throw new Error(`Incomplete meal plan: AI only generated ${uniqueMeals.length} out of ${expectedMeals} required meals. The response was likely truncated. Try reducing the plan duration or meal types.`);
        }
      }
      
      mealPlan.meals = uniqueMeals;
      console.log(`Final meal plan: ${mealPlan.meals.length} unique meals for ${totalDays} days (expected: ${expectedMeals})`);
    }
    
    return mealPlan;
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw new Error(`Failed to generate meal plan: ${(error as Error).message}`);
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
  const enhancedPrompt = `You are a master chef specializing in personalized, one-of-a-kind recipes. Create a SINGLE, exceptional ${mealType} recipe for ${date} that serves exactly ${familySize} people. This must be completely unique - no generic or repeated ideas.

DETAILED PERSONALIZATION (INCORPORATE EVERY ELEMENT):
- Family: ${familySize} people (scale ALL quantities precisely)
- Dietary style: ${dietType} (fully compliant)
- Allergies (STRICT AVOIDANCE): ${userProfile.allergies.map(a => `${a.name} (${a.severity})`).join(", ") || "None"}
- Health considerations: ${userProfile.medicalConditions.join(", ") || "General wellness"}
- Favorites to feature: ${userProfile.favoriteIngredients.join(", ") || "Varied fresh ingredients"}
- Avoid completely: Any common allergens or dislikes

PANTRY OPTIMIZATION (USE CREATIVELY):
${pantryItems.map(item => `- ${item.name}: ${item.quantity} ${item.unit} (integrate thoughtfully)`).join("\n")}
MANDATORY: Build the recipe around these pantry staples for efficiency and creativity. Suggest innovative uses.

${customRequest ? `CUSTOM THEME/REQUEST: ${customRequest} - Make this the highlight of the day.` : `SURPRISE ELEMENT: Create something unexpected and delightful using available ingredients, with a unique twist that family will love.`}

RECIPE REQUIREMENTS:
- Innovation: Combine flavors/cultures in fresh ways (e.g., fusion cuisine, seasonal twists)
- Practicality: Realistic for home cooking, with time-saving tips
- Balance: Nutritionally complete for ${mealType}, aligned with ${dietType}
- Engagement: Instructions that build excitement step-by-step

TECHNICAL SPECIFICATIONS:
- CRITICAL: ALL NUMBERS MUST BE NUMERIC VALUES, NOT WORDS. Use 30 for thirty grams, 2.5 for two and a half cups, 45 for cooking time. NEVER use words like "thirty", "two", "half" in numeric fields.
- Quantities: Total for ${familySize} people
- Nutrition: Per person values as NUMBERS (e.g., 450 calories, not "450 calories")
- Cooking time: NUMBER in minutes (e.g., 45)

OUTPUT - PURE JSON ONLY:
{
  "recipeName": "Creative, Descriptive Name",
  "recipeDescription": "2-3 sentences explaining the inspiration, unique features, and why this will be loved",
  "recipeData": {
    "ingredients": [
      {"name": "Specific ingredient", "quantity": 1.5, "unit": "cups"},
      {"name": "Another item", "quantity": 3, "unit": "whole"}
      // Use pantry items where possible, exact format - quantity as number
    ],
    "instructions": [
      "Step 1: Detailed, actionable step with timing and technique",
      "Step 2: Build sequentially, include sensory cues",
      "Step 3: Final touches for presentation"
      // 4-8 steps, comprehensive but concise
    ],
    "cookingTime": 45,  // NUMBER in minutes
    "difficulty": "medium",  // easy/medium/hard
    "utensils": ["Specific tools needed", "pan types", "measuring tools"]
  },
  "nutritionalInfo": {
    "calories": 450,  // NUMBER per person
    "protein": 25,
    "carbs": 55,
    "fat": 18,
    "fiber": 8,
    "sodium": 650
    // Accurate estimates per person - all as numbers
  }
}

CRITICAL FORMATTING:
- Ingredients: ALWAYS {"name": "...", "quantity": number, "unit": "string"} - NO variations, quantity as number
- Instructions: Numbered, practical, complete
- Nutrition: Realistic per-person values for ${dietType} - ALL NUMBERS (e.g., 450, 25g as 25)
- JSON: Valid, complete, no extra text. NO WORDS IN NUMERIC FIELDS.

Deliver a recipe that feels custom-crafted for this family on this exact day.`;

  try {
    // Use Cerebras for meal regeneration
    const cerebrasClient = getCerebrasClient();
    const stream = await cerebrasClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a virtuoso chef delivering bespoke recipes. Output ONLY valid JSON. No explanations, no thinking aloud - pure structured response adhering to the exact schema provided. CRITICAL: All quantities, times, nutrition must be numeric values (123, 4.5) - NEVER words like "thirty" or "two". Ensure all JSON is valid with proper commas, quotes, and brackets.`,
        },
        {
          role: "user",
          content: enhancedPrompt,
        },
      ],
      model: "zai-glm-4.7",
      stream: true,
      max_completion_tokens: 65000,
      temperature: 0.3,
      top_p: 0.8,
    });

    // Collect streamed response
    let content = "";
    for await (const chunk of stream) {
      content += (chunk as any).choices[0]?.delta?.content || '';
    }

    if (!content || !content.trim()) {
      throw new Error("No response from AI");
    }

    // Clean any reasoning traces from the response
    const cleanedContent = cleanAIResponse(content);
    
    let meal = JSON.parse(cleanedContent);
    
    // Fix any textual numbers to actual numbers
    meal = fixNumericValues(meal);
    
    // Fix any structural issues
    meal = fixMealStructure(meal);
    
    return meal;
  } catch (error) {
    console.error("Error regenerating meal:", error);
    throw new Error(`Failed to regenerate meal: ${(error as Error).message}`);
  }
}
