"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { APP_BRANDING, UI_TEXT } from "@/lib/branding";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X, ChefHat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";

export default function NewMealPlanPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [duration, setDuration] = useState("7");
  const [durationUnit, setDurationUnit] = useState("days");
  const [familySize, setFamilySize] = useState("2");
  const [mealsPerDay, setMealsPerDay] = useState<string[]>(["breakfast", "lunch", "dinner"]);
  const [dietType, setDietType] = useState("balanced");
  const [cuisinePreference, setCuisinePreference] = useState("");
  const [negativeIngredients, setNegativeIngredients] = useState<string[]>([]);
  const [newNegativeIngredient, setNewNegativeIngredient] = useState("");
  const [assumeBasicStaples, setAssumeBasicStaples] = useState(true);
  const [customInstructions, setCustomInstructions] = useState("");

  const profile = useQuery(api.users.getUserProfile);
  const pantryItems = useQuery(api.pantry.getUserPantry);
  const createMealPlan = useMutation(api.mealPlans.createMealPlan);
  const addMealToPlan = useMutation(api.mealPlans.addMealToPlan);
  const generateMealPlanAction = useAction(api.ai.generateMealPlanAction);

  const dietTypes = [
    "Balanced",
    "Mediterranean",
    "Keto",
    "Paleo",
    "Vegan",
    "Vegetarian",
    "Intermittent Fasting",
    "Low-Carb",
    "High-Protein",
    "Gluten-Free",
    "Dairy-Free",
    "Low-Sodium",
  ];

  const cuisines = [
    "Italian",
    "Indian",
    "Chinese",
    "Mexican",
    "Japanese",
    "Thai",
    "Mediterranean",
    "American",
    "French",
    "Korean",
  ];

  const mealTypes = [
    { id: "breakfast", label: "Breakfast" },
    { id: "lunch", label: "Lunch" },
    { id: "dinner", label: "Dinner" },
    { id: "snacks", label: "Snacks" },
    { id: "dessert", label: "Dessert" },
  ];

  const handleAddNegativeIngredient = () => {
    if (newNegativeIngredient.trim() && !negativeIngredients.includes(newNegativeIngredient.trim())) {
      setNegativeIngredients([...negativeIngredients, newNegativeIngredient.trim()]);
      setNewNegativeIngredient("");
    }
  };

  const handleRemoveNegativeIngredient = (ingredient: string) => {
    setNegativeIngredients(negativeIngredients.filter((i) => i !== ingredient));
  };

  const toggleMealType = (mealType: string) => {
    if (mealsPerDay.includes(mealType)) {
      setMealsPerDay(mealsPerDay.filter((m) => m !== mealType));
    } else {
      setMealsPerDay([...mealsPerDay, mealType]);
    }
  };

  const handleGenerateMealPlan = async () => {
    if (mealsPerDay.length === 0) {
      toast({
        title: "No meals selected",
        description: "Please select at least one meal type",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Create meal plan record
      const planId = await createMealPlan({
        startDate,
        duration: parseInt(duration),
        durationUnit,
        parameters: {
          familySize: parseInt(familySize),
          mealsPerDay,
          dietType,
          cuisinePreference,
          negativeIngredients,
          assumeBasicStaples,
          customInstructions: customInstructions.trim() || undefined,
        },
      });

      // Generate AI meal plan using Convex action (server-side)
      const aiMealPlan = await generateMealPlanAction({
        startDate,
        userProfile: {
          name: profile?.userId ? "User" : "Guest",
          allergies: profile?.allergies || [],
          medicalConditions: profile?.medicalConditions || [],
          favoriteIngredients: profile?.favoriteIngredients || [],
        },
        pantryItems: pantryItems?.map((item) => ({
          name: item.name || "",
          quantity: item.quantity,
          unit: item.unit,
        })) || [],
        parameters: {
          familySize: parseInt(familySize),
          mealsPerDay,
          dietType,
          cuisinePreference,
          negativeIngredients,
          duration: parseInt(duration),
          durationUnit,
          assumeBasicStaples,
          customInstructions: customInstructions.trim() || undefined,
        },
      });

      // Save meals to database
      if (aiMealPlan?.meals) {
        // EXTRA SAFETY: Deduplicate again before saving
        const savedKeys = new Set<string>();
        let savedCount = 0;
        
        for (const meal of aiMealPlan.meals) {
          const key = `${meal.day}-${meal.mealType}`;
          
          if (savedKeys.has(key)) {
            console.warn(`[Client] Skipping duplicate meal: Day ${meal.day}, ${meal.mealType}`);
            continue; // Skip this duplicate
          }
          
          await addMealToPlan({
            planId,
            date: meal.date,
            day: meal.day,
            mealType: meal.mealType,
            recipeName: meal.recipeName,
            recipeDescription: meal.recipeDescription,
            recipeData: meal.recipeData,
            nutritionalInfo: meal.nutritionalInfo,
            portionSize: parseInt(familySize),
          });
          
          savedKeys.add(key);
          savedCount++;
        }
        
        console.log(`[Client] Saved ${savedCount} unique meals to database`);
      }

      toast({
        title: "Meal plan created!",
        description: "Your personalized meal plan is ready",
      });

      router.push("/dashboard/meal-plans");
    } catch (error) {
      console.error("Error generating meal plan:", error);
      toast({
        title: "Error",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Create Meal Plan</h1>
        <p className="text-gray-600">{APP_BRANDING.aiRecipeGenerator.tagline}</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= s ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div className={`w-16 h-1 ${step > s ? "bg-orange-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Set up the basics for your meal plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="familySize">Family Size</Label>
                <Input
                  id="familySize"
                  type="number"
                  min="1"
                  value={familySize}
                  onChange={(e) => setFamilySize(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="durationUnit">Duration Unit</Label>
                <select
                  id="durationUnit"
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Meals Per Day</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {mealTypes.map((meal) => (
                  <div key={meal.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={meal.id}
                      checked={mealsPerDay.includes(meal.id)}
                      onCheckedChange={() => toggleMealType(meal.id)}
                    />
                    <label
                      htmlFor={meal.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {meal.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Preferences */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Dietary Preferences</CardTitle>
            <CardDescription>Customize your meal plan preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="dietType">Diet Type</Label>
              <select
                id="dietType"
                value={dietType}
                onChange={(e) => setDietType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                {dietTypes.map((diet) => (
                  <option key={diet.toLowerCase()} value={diet.toLowerCase()}>
                    {diet}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="cuisinePreference">Cuisine Preference (Optional)</Label>
              <select
                id="cuisinePreference"
                value={cuisinePreference}
                onChange={(e) => setCuisinePreference(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="">Any Cuisine</option>
                {cuisines.map((cuisine) => (
                  <option key={cuisine.toLowerCase()} value={cuisine.toLowerCase()}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="customInstructions">Custom Instructions (Optional)</Label>
              <Textarea
                id="customInstructions"
                placeholder="Add any specific instructions for your meal plan. For example: 'Focus on quick 15-minute meals', 'Use seasonal ingredients only', 'Make it kid-friendly', or 'Emphasize healthy snacks'."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                These instructions will be sent to the AI to customize your meal plan according to your preferences.
              </p>
            </div>

            <div>
              <Label>Ingredients to Avoid</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {negativeIngredients.map((ingredient) => (
                  <Badge key={ingredient} variant="destructive" className="gap-1">
                    {ingredient}
                    <button onClick={() => handleRemoveNegativeIngredient(ingredient)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Mushrooms"
                  value={newNegativeIngredient}
                  onChange={(e) => setNewNegativeIngredient(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddNegativeIngredient()}
                />
                <Button onClick={handleAddNegativeIngredient}>Add</Button>
              </div>
            </div>

            <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="assumeStaples"
                  checked={assumeBasicStaples}
                  onCheckedChange={(checked) => setAssumeBasicStaples(checked as boolean)}
                />
                <div className="flex-1">
                  <label
                    htmlFor="assumeStaples"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    I have basic kitchen staples
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Assumes you always have salt, pepper, oil, sugar, flour, and other common staples.
                    Recipes won't require these in your pantry.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Generate */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Generate</CardTitle>
            <CardDescription>Review your meal plan settings and generate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Start Date</Label>
                <p className="font-medium">{format(new Date(startDate), "MMMM dd, yyyy")}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Duration</Label>
                <p className="font-medium">
                  {duration} {durationUnit}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Family Size</Label>
                <p className="font-medium">{familySize} people</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Diet Type</Label>
                <p className="font-medium capitalize">{dietType}</p>
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-500">Meals Per Day</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {mealsPerDay.map((meal) => (
                  <Badge key={meal} variant="secondary" className="capitalize">
                    {meal}
                  </Badge>
                ))}
              </div>
            </div>

            {cuisinePreference && (
              <div>
                <Label className="text-xs text-gray-500">Cuisine Preference</Label>
                <p className="font-medium capitalize">{cuisinePreference}</p>
              </div>
            )}

            {negativeIngredients.length > 0 && (
              <div>
                <Label className="text-xs text-gray-500">Ingredients to Avoid</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {negativeIngredients.map((ingredient) => (
                    <Badge key={ingredient} variant="destructive">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs text-gray-500">Basic Staples</Label>
              <p className="text-sm font-medium">
                {assumeBasicStaples ? "✅ Assumed available" : "❌ Must be in pantry"}
              </p>
            </div>

            {customInstructions && (
              <div>
                <Label className="text-xs text-gray-500">Custom Instructions</Label>
                <p className="text-sm font-medium bg-blue-50 p-3 rounded-md border">
                  {customInstructions}
                </p>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleGenerateMealPlan} disabled={isGenerating} className="gap-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {UI_TEXT.mealPlanning.generatingMessage}
                  </>
                ) : (
                  <>
                    <ChefHat className="h-4 w-4" />
                    Generate with {APP_BRANDING.aiRecipeGenerator.name}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
