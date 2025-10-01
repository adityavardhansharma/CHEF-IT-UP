"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { APP_BRANDING } from "@/lib/branding";
import { MealCard } from "@/components/meal-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, parseISO } from "date-fns";
import { Calendar, Check, RefreshCw, ChefHat, Clock, Utensils, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";

export default function MealPlansPage() {
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [isRefreshDialogOpen, setIsRefreshDialogOpen] = useState(false);
  const [customRequest, setCustomRequest] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const mealPlans = useQuery(api.mealPlans.getUserMealPlans) ?? [];
  const activePlan = mealPlans?.find((plan) => plan.status === "active");
  const isLoadingPlans = mealPlans === undefined;

  // Calculate date range for active plan
  const totalDays = activePlan
    ? activePlan.durationUnit === "weeks"
      ? activePlan.duration * 7
      : activePlan.duration
    : 0;

  const startDate = activePlan ? new Date(`${activePlan.startDate}T00:00:00.000Z`) : new Date();
  const currentDate = new Date(startDate);
  currentDate.setUTCDate(startDate.getUTCDate() + (selectedDayNumber - 1));
  const selectedDate = format(currentDate, "yyyy-MM-dd");

  const mealsForDate = useQuery(
    api.mealPlans.getMealsByDate,
    activePlan ? { date: selectedDate, planId: activePlan._id } : "skip"
  ) ?? [];
  const isLoadingMeals = mealsForDate === undefined;
  
  const markAsConsumed = useMutation(api.mealPlans.markMealAsConsumed);
  const deleteMeal = useMutation(api.mealPlans.deleteMeal);
  const deleteMealPlan = useMutation(api.mealPlans.deleteMealPlan);
  const addMealToPlan = useMutation(api.mealPlans.addMealToPlan);
  
  // Prefetched queries - instant from cache
  const pantryItems = useQuery(api.pantry.getUserPantry) ?? [];
  const profile = useQuery(api.users.getUserProfile);

  const { toast } = useToast();

  // Memoized ingredient check for performance
  const getIngredientStatus = useMemo(() => {
    // Build lookup map once
    const pantryMap = new Map<string, boolean>();
    pantryItems.forEach(item => {
      const itemName = (item.name || item.customItemName || "").toLowerCase().trim();
      pantryMap.set(itemName, true);
    });
    
    return (ingredientName: string) => {
      const normalized = ingredientName.toLowerCase().trim();
      // Fast map lookup
      for (const [key] of pantryMap) {
        if (key.includes(normalized) || normalized.includes(key)) {
          return true;
        }
      }
      return false;
    };
  }, [pantryItems]);

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

      {/* Day Timeline Navigation */}
      {activePlan && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3">
              {/* Previous Button */}
              <button
                onClick={() => setSelectedDayNumber(Math.max(1, selectedDayNumber - 1))}
                disabled={selectedDayNumber === 1}
                className="flex-shrink-0 p-2 rounded-full bg-orange-100 hover:bg-orange-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Previous day"
              >
                <ChevronLeft className="h-5 w-5 text-orange-700" />
              </button>

              {/* Day Timeline - Hidden Scrollbar */}
              <div 
                className="flex-1 max-w-3xl overflow-x-hidden relative"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <div 
                  className="flex gap-2 justify-center"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {Array.from({ length: totalDays }, (_, i) => {
                    const dayNum = i + 1;
                    const isActive = selectedDayNumber === dayNum;
                    const dayDate = new Date(startDate);
                    dayDate.setUTCDate(startDate.getUTCDate() + i);
                    
                    return (
                      <button
                        key={dayNum}
                        onClick={() => setSelectedDayNumber(dayNum)}
                        className={`flex-shrink-0 px-4 py-3 rounded-lg font-medium transition-all ${
                          isActive
                            ? "bg-orange-600 text-white shadow-lg scale-105"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102"
                        }`}
                      >
                        <div className="text-center">
                          <div className={`text-xs ${isActive ? "text-orange-100" : "text-gray-500"}`}>
                            {format(dayDate, "EEE")}
                          </div>
                          <div className="text-lg font-bold">
                            {format(dayDate, "dd")}
                          </div>
                          <div className={`text-xs ${isActive ? "text-orange-100" : "text-gray-500"}`}>
                            Day {dayNum}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={() => setSelectedDayNumber(Math.min(totalDays, selectedDayNumber + 1))}
                disabled={selectedDayNumber === totalDays}
                className="flex-shrink-0 p-2 rounded-full bg-orange-100 hover:bg-orange-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Next day"
              >
                <ChevronRight className="h-5 w-5 text-orange-700" />
              </button>
            </div>

            {/* Current Selection Info */}
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold text-gray-700">
                {format(currentDate, "EEEE, MMMM dd, yyyy")}
              </p>
              <p className="text-sm text-gray-500">
                Showing meals for day {selectedDayNumber} of {totalDays}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calorie Summary */}
      {mealsForDate && mealsForDate.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Nutrition</CardTitle>
            <CardDescription>
              Day {selectedDayNumber} • {format(currentDate, "MMMM dd, yyyy")}
            </CardDescription>
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
        {isLoadingMeals ? (
          // Loading skeleton
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-7 w-48" />
                      <Skeleton className="h-4 w-full max-w-md" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : mealsForDate && mealsForDate.length > 0 ? (
          mealsForDate.map((meal) => (
            <MealCard
              key={meal._id}
              meal={meal}
              getIngredientStatus={getIngredientStatus}
              assumeStaples={activePlan?.parameters?.assumeBasicStaples ?? true}
              onMarkAsConsumed={() => handleMarkAsConsumed(meal._id)}
              onRefresh={(surpriseMe) => handleRefreshMeal(meal, surpriseMe)}
              onCustomRequest={() => {
                setSelectedMeal(meal);
                setIsRefreshDialogOpen(true);
              }}
              isRegenerating={isRegenerating}
            />
          ))
        ) : activePlan ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No meals found for Day {selectedDayNumber}</p>
              <p className="text-sm text-gray-400">
                This day might not have meals generated yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No active meal plan</p>
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
