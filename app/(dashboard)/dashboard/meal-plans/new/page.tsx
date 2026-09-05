"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { APP_BRANDING, UI_TEXT } from "@/lib/branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { CuisineSelector } from "@/components/ui/cuisine-selector";
import { Loader2, X, ChefHat, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  PageHead,
  FolioCard,
  Stamp,
  FieldLabel,
  folioPrimary,
  folioOutline,
} from "@/components/dashboard/folio";
import { cn } from "@/lib/utils";

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
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>([]);
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

  const mealTypes = [
    { id: "breakfast", label: "Breakfast" },
    { id: "lunch", label: "Lunch" },
    { id: "dinner", label: "Dinner" },
    { id: "snacks", label: "Snacks" },
    { id: "dessert", label: "Dessert" },
  ];

  const STEPS = ["The basics", "Tastes", "Review"];

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
          cuisinePreferences,
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
          cuisinePreferences,
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

  const inputSkin =
    "border-[#0F1E33]/20 bg-white focus-visible:border-[#C2410C] focus-visible:ring-[#C2410C]/30";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHead
        kicker="NEW WEEK PASS"
        title="Write the week."
        deck={APP_BRANDING.aiRecipeGenerator.tagline}
      />

      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((label, i) => {
          const s = i + 1;
          const done = step > s;
          const current = step === s;
          return (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full font-mono text-sm font-semibold transition-all",
                    done && "bg-[#0F1E33] text-[#FAF7F0]",
                    current && "bg-[#C2410C] text-white shadow-lg",
                    !done && !current && "border border-[#0F1E33]/20 bg-white text-[#5B6B82]"
                  )}
                >
                  {done ? "✓" : s}
                </div>
                <span
                  className={cn(
                    "hidden font-mono text-[9px] tracking-[0.18em] sm:block",
                    current ? "text-[#C2410C]" : "text-[#5B6B82]"
                  )}
                >
                  {label.toUpperCase()}
                </span>
              </div>
              {s < STEPS.length && (
                <div className={cn("mx-2 mb-5 h-0.5 w-10 sm:w-16", step > s ? "bg-[#0F1E33]" : "bg-[#0F1E33]/15")} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <FolioCard className="p-6 sm:p-8">
          <h2 className="font-serif text-2xl tracking-tight">The basics</h2>
          <p className="mt-1 text-sm font-light text-[#475569]">
            When, for how many, and which plates of the day.
          </p>
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <FieldLabel htmlFor="startDate">Start date</FieldLabel>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputSkin}
                />
              </div>

              <div>
                <FieldLabel htmlFor="familySize">Seats at the table</FieldLabel>
                <Input
                  id="familySize"
                  type="number"
                  min="1"
                  value={familySize}
                  onChange={(e) => setFamilySize(e.target.value)}
                  className={inputSkin}
                />
              </div>

              <div>
                <FieldLabel htmlFor="duration">Duration</FieldLabel>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={inputSkin}
                />
              </div>

              <div>
                <FieldLabel htmlFor="durationUnit">Duration unit</FieldLabel>
                <select
                  id="durationUnit"
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-[#0F1E33]/20 bg-white px-3 py-2 text-sm focus:border-[#C2410C] focus:outline-none"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>
            </div>

            <div>
              <FieldLabel>Plates per day</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {mealTypes.map((meal) => {
                  const on = mealsPerDay.includes(meal.id);
                  return (
                    <button
                      key={meal.id}
                      type="button"
                      onClick={() => toggleMealType(meal.id)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                        on
                          ? "border-[#0F1E33] bg-[#0F1E33] text-[#FAF7F0] shadow-md"
                          : "border-[#0F1E33]/20 bg-white text-[#0F1E33] hover:border-[#C2410C]/60"
                      )}
                    >
                      {meal.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end border-t border-[#0F1E33]/10 pt-5">
              <Button onClick={() => setStep(2)} className={cn(folioPrimary, "gap-1.5 text-sm")}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </FolioCard>
      )}

      {/* Step 2: Preferences */}
      {step === 2 && (
        <FolioCard className="p-6 sm:p-8">
          <h2 className="font-serif text-2xl tracking-tight">Tastes</h2>
          <p className="mt-1 text-sm font-light text-[#475569]">
            Diets, cuisines, and everything EchoAI must avoid.
          </p>
          <div className="mt-6 space-y-6">
            <div>
              <FieldLabel htmlFor="dietType">Diet type</FieldLabel>
              <select
                id="dietType"
                value={dietType}
                onChange={(e) => setDietType(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-[#0F1E33]/20 bg-white px-3 py-2 text-sm capitalize focus:border-[#C2410C] focus:outline-none"
              >
                {dietTypes.map((diet) => (
                  <option key={diet.toLowerCase()} value={diet.toLowerCase()}>
                    {diet}
                  </option>
                ))}
              </select>
            </div>

            <CuisineSelector
              value={cuisinePreferences}
              onChange={setCuisinePreferences}
            />

            <div>
              <FieldLabel htmlFor="customInstructions">Notes for EchoAI · optional</FieldLabel>
              <Textarea
                id="customInstructions"
                placeholder="e.g. Quick 15-minute meals, kid-friendly, seasonal only…"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="min-h-[100px] resize-none border-[#0F1E33]/20 bg-white placeholder:text-[#5B6B82]/70 focus-visible:border-[#C2410C] focus-visible:ring-[#C2410C]/30"
              />
            </div>

            <div>
              <FieldLabel>Ingredients to avoid</FieldLabel>
              {negativeIngredients.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {negativeIngredients.map((ingredient) => (
                    <Stamp key={ingredient} tone="ember">
                      {ingredient}
                      <button onClick={() => handleRemoveNegativeIngredient(ingredient)} aria-label={`Remove ${ingredient}`}>
                        <X className="h-3 w-3" />
                      </button>
                    </Stamp>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Mushrooms"
                  value={newNegativeIngredient}
                  onChange={(e) => setNewNegativeIngredient(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNegativeIngredient()}
                  className={inputSkin}
                />
                <Button onClick={handleAddNegativeIngredient} className={cn(folioOutline, "shrink-0")}>
                  Add
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#0F1E33]/12 bg-[#FAF7F0] p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="assumeStaples"
                  checked={assumeBasicStaples}
                  onCheckedChange={(checked) => setAssumeBasicStaples(checked as boolean)}
                  className="mt-0.5 border-[#0F1E33]/30 data-[state=checked]:border-[#0F1E33] data-[state=checked]:bg-[#0F1E33]"
                />
                <div className="flex-1">
                  <label htmlFor="assumeStaples" className="cursor-pointer text-sm font-medium">
                    I have basic kitchen staples
                  </label>
                  <p className="mt-1 text-xs font-light text-[#475569]">
                    Salt, pepper, oil, sugar, flour and other common staples are assumed —
                    recipes won&apos;t require them in your pantry.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between border-t border-[#0F1E33]/10 pt-5">
              <Button variant="outline" onClick={() => setStep(1)} className={cn(folioOutline, "gap-1.5 text-sm")}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setStep(3)} className={cn(folioPrimary, "gap-1.5 text-sm")}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </FolioCard>
      )}

      {/* Step 3: Review & Generate */}
      {step === 3 && (
        <FolioCard className="p-6 sm:p-8">
          <h2 className="font-serif text-2xl tracking-tight">Review & fire</h2>
          <p className="mt-1 text-sm font-light text-[#475569]">
            Check the pass once — EchoAI plates the rest.
          </p>
          <div className="mt-6 space-y-5">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[
                ["Start date", format(new Date(startDate), "MMMM dd, yyyy")],
                ["Duration", `${duration} ${durationUnit}`],
                ["Seats", `${familySize} people`],
                ["Diet", dietType],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5B6B82]">{k}</dt>
                  <dd className="mt-0.5 font-medium capitalize">{v}</dd>
                </div>
              ))}
            </dl>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5B6B82]">
                Plates per day
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {mealsPerDay.map((meal) => (
                  <Stamp key={meal} tone="paper" className="capitalize">{meal}</Stamp>
                ))}
              </div>
            </div>

            {cuisinePreferences.length > 0 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5B6B82]">
                  Cuisines
                </p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {cuisinePreferences.map((cuisine) => (
                    <Stamp key={cuisine} tone="paper" className="capitalize">{cuisine}</Stamp>
                  ))}
                </div>
              </div>
            )}

            {negativeIngredients.length > 0 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5B6B82]">
                  Avoiding
                </p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {negativeIngredients.map((ingredient) => (
                    <Stamp key={ingredient} tone="ember">{ingredient}</Stamp>
                  ))}
                </div>
              </div>
            )}

            <p className="font-mono text-[11px] tracking-[0.12em] text-[#047857]">
              STAPLES {assumeBasicStaples ? "ASSUMED ON HAND" : "MUST BE IN PANTRY"}
            </p>

            {customInstructions && (
              <div className="rounded-xl border border-[#0F1E33]/10 bg-[#FAF7F0] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5B6B82]">
                  Notes for EchoAI
                </p>
                <p className="mt-1 text-sm font-light">{customInstructions}</p>
              </div>
            )}

            <div className="flex justify-between border-t border-[#0F1E33]/10 pt-5">
              <Button variant="outline" onClick={() => setStep(2)} className={cn(folioOutline, "gap-1.5 text-sm")}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={handleGenerateMealPlan} disabled={isGenerating} className={cn(folioPrimary, "gap-2 text-sm")}>
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
          </div>
        </FolioCard>
      )}
    </div>
  );
}
