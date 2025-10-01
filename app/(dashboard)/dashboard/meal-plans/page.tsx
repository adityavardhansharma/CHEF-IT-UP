"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { APP_BRANDING } from "@/lib/branding";
import { IngredientItem } from "@/components/ingredient-item";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, parseISO } from "date-fns";
import { Calendar, Check, RefreshCw, ChefHat, Clock, Utensils, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";

export default function MealPlansPage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [isRefreshDialogOpen, setIsRefreshDialogOpen] = useState(false);
  const [customRequest, setCustomRequest] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const mealPlans = useQuery(api.mealPlans.getUserMealPlans);
  const mealsForDate = useQuery(api.mealPlans.getMealsByDate, { date: selectedDate });
  const markAsConsumed = useMutation(api.mealPlans.markMealAsConsumed);
  const deleteMeal = useMutation(api.mealPlans.deleteMeal);
  const deleteMealPlan = useMutation(api.mealPlans.deleteMealPlan);
  const addMealToPlan = useMutation(api.mealPlans.addMealToPlan);
  const pantryItems = useQuery(api.pantry.getUserPantry);
  const profile = useQuery(api.users.getUserProfile);

  const { toast } = useToast();

  const activePlan = mealPlans?.find((plan) => plan.status === "active");

  // Check if ingredient is in pantry
  const getIngredientStatus = (ingredientName: string) => {
    if (!pantryItems) return false;
    
    const normalizedIngredient = ingredientName.toLowerCase().trim();
    return pantryItems.some(item => {
      const itemName = (item.name || item.customItemName || "").toLowerCase().trim();
      return itemName.includes(normalizedIngredient) || normalizedIngredient.includes(itemName);
    });
  };

  const handleMarkAsConsumed = async (mealId: Id<"meals">) => {
    try {
      await markAsConsumed({ mealId });
      toast({
        title: "Meal marked as consumed!",
        description: "Your pantry has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark meal as consumed",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMealPlan = async (planId: Id<"mealPlans">) => {
    if (!confirm("Are you sure you want to delete this entire meal plan? This will remove all associated meals.")) {
      return;
    }

    try {
      const result = await deleteMealPlan({ planId });
      
      toast({
        title: "Meal plan deleted!",
        description: `Removed meal plan and ${result.deletedMeals} meals`,
      });

      // Redirect to create new meal plan page after short delay
      setTimeout(() => {
        window.location.href = "/dashboard/meal-plans/new";
      }, 1500);
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete meal plan",
        variant: "destructive",
      });
    }
  };

  const handleRefreshMeal = (meal: any, surpriseMe: boolean) => {
    setSelectedMeal(meal);
    if (surpriseMe) {
      handleRegenerateMeal(meal, undefined);
    } else {
      setIsRefreshDialogOpen(true);
    }
  };

  const handleRegenerateMeal = async (meal: any, customReq?: string) => {
    setIsRegenerating(true);
    try {
      // TODO: Implement meal regeneration via Convex action
      toast({
        title: "Feature Coming Soon",
        description: "Meal regeneration will be available soon!",
      });

      setIsRefreshDialogOpen(false);
      setCustomRequest("");
    } catch (error) {
      console.error("Error regenerating meal:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate meal",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const totalCalories = mealsForDate?.reduce((sum, meal) => sum + (meal.nutritionalInfo?.calories || 0), 0) || 0;
  const consumedCalories =
    mealsForDate
      ?.filter((meal) => meal.consumed)
      .reduce((sum, meal) => sum + (meal.nutritionalInfo?.calories || 0), 0) || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Meal Plans</h1>
          <p className="text-gray-600">View and manage your meal plans</p>
        </div>
        {activePlan && (
          <div className="flex items-center gap-3">
            <Badge className="text-lg px-4 py-2">
              Active: {activePlan.duration} {activePlan.durationUnit}
            </Badge>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteMealPlan(activePlan._id)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Meal Plan
            </Button>
          </div>
        )}
      </div>

      {/* Date Picker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="max-w-xs"
          />
        </CardContent>
      </Card>

      {/* Calorie Summary */}
      {mealsForDate && mealsForDate.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Nutrition</CardTitle>
            <CardDescription>{format(parseISO(selectedDate), "MMMM dd, yyyy")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Calories</span>
                <span className="font-semibold">
                  {consumedCalories} / {totalCalories} kcal
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((consumedCalories / totalCalories) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meals */}
      <div className="space-y-4">
        {mealsForDate && mealsForDate.length > 0 ? (
          mealsForDate.map((meal) => (
            <Card key={meal._id} className={meal.consumed ? "opacity-75" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="capitalize">
                        {meal.mealType}
                      </Badge>
                      {meal.consumed && (
                        <Badge variant="default" className="bg-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl">{meal.recipeName}</CardTitle>
                    {meal.recipeDescription && (
                      <CardDescription className="mt-2">{meal.recipeDescription}</CardDescription>
                    )}
                  </div>
                  <ChefHat className="h-8 w-8 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{meal.recipeData.cookingTime} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-gray-500" />
                    <span className="capitalize">{meal.recipeData.difficulty}</span>
                  </div>
                  <div>
                    <span className="font-semibold">{meal.nutritionalInfo?.calories} kcal</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Ingredients:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {meal.recipeData.ingredients.map((ing: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-gray-600">•</span>
                        <IngredientItem
                          name={ing.name}
                          quantity={`${ing.quantity} ${ing.unit}`}
                          isInPantry={getIngredientStatus(ing.name)}
                          assumeStaples={activePlan?.parameters?.assumeBasicStaples ?? true}
                        />
                      </div>
                    ))}
                  </div>
                  {pantryItems && meal.recipeData.ingredients.length > 0 && (
                    <p className="text-xs text-gray-500 mt-3 italic">
                      💡 Hover over <span className="border-b-2 border-red-500 border-dotted px-1">ingredients like this</span> to see what's missing from your pantry
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Instructions:</h4>
                  <ol className="space-y-2 text-sm">
                    {meal.recipeData.instructions.map((instruction: string, idx: number) => (
                      <li key={idx} className="flex gap-2">
                        <span className="font-semibold text-orange-600">{idx + 1}.</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Required Utensils:</h4>
                  <div className="flex flex-wrap gap-2">
                    {meal.recipeData.utensils.map((utensil: string, idx: number) => (
                      <Badge key={idx} variant="outline">
                        {utensil}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Nutritional Information</h4>
                  <p className="text-xs text-gray-500 mb-2">{APP_BRANDING.nutritionData.tagline} • Per serving (1 person)</p>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Protein</p>
                      <p className="font-semibold">{meal.nutritionalInfo?.protein}g</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Carbs</p>
                      <p className="font-semibold">{meal.nutritionalInfo?.carbs}g</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fat</p>
                      <p className="font-semibold">{meal.nutritionalInfo?.fat}g</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fiber</p>
                      <p className="font-semibold">{meal.nutritionalInfo?.fiber || 0}g</p>
                    </div>
                  </div>
                  {meal.portionSize && meal.portionSize > 1 && (
                    <p className="text-xs text-blue-600 mt-2">
                      👥 Recipe serves {meal.portionSize} people • Ingredient quantities are for total servings
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  {!meal.consumed && (
                    <>
                      <Button onClick={() => handleMarkAsConsumed(meal._id)} className="flex-1">
                        <Check className="h-4 w-4 mr-2" />
                        Mark as Eaten
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRefreshMeal(meal, true)}
                        disabled={isRegenerating}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedMeal(meal);
                          setIsRefreshDialogOpen(true);
                        }}
                      >
                        Custom Recipe
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No meals planned for this date</p>
              <Button onClick={() => (window.location.href = "/dashboard/meal-plans/new")}>
                Create Meal Plan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Refresh Meal Dialog */}
      <Dialog open={isRefreshDialogOpen} onOpenChange={setIsRefreshDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Meal</DialogTitle>
            <DialogDescription>Tell us what you'd like for this meal</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customRequest">What would you like to eat?</Label>
              <Input
                id="customRequest"
                placeholder="e.g., Something with pasta and tomatoes"
                value={customRequest}
                onChange={(e) => setCustomRequest(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleRegenerateMeal(selectedMeal, customRequest)}
                disabled={isRegenerating}
                className="flex-1"
              >
                {isRegenerating ? "Generating..." : "Generate Recipe"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsRefreshDialogOpen(false)}
                disabled={isRegenerating}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
