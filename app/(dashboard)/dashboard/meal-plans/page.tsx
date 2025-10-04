"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { format, parseISO, isToday, startOfDay, endOfDay, differenceInDays, addDays } from "date-fns";
import { Calendar, Check, RefreshCw, ChefHat, Clock, Utensils, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";

export default function MealPlansPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  // Parse date from URL
  const urlDate = searchParams.get("date");
  const parsedDate = urlDate ? parseISO(urlDate) : new Date();
  
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [isRefreshDialogOpen, setIsRefreshDialogOpen] = useState(false);
  const [customRequest, setCustomRequest] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const mealPlans = useQuery(api.mealPlans.getUserMealPlans) ?? [];
  const activePlan = mealPlans?.find((plan) => plan.status === "active");
  const isLoadingPlans = mealPlans === undefined;

  // Archive completed plans
  const archivePlan = useMutation(api.mealPlans.archiveMealPlan);
  
  // Check if plan is expired and archive it
  useEffect(() => {
    if (activePlan) {
      const startDate = parseISO(activePlan.startDate);
      const totalDays = activePlan.durationUnit === "weeks" 
        ? activePlan.duration * 7 
        : activePlan.duration;
      const endDate = addDays(startDate, totalDays);
      
      if (endOfDay(new Date()) > endOfDay(endDate)) {
        // Plan is expired, archive it
        archivePlan({ planId: activePlan._id });
        toast({
          title: "Meal plan completed! 🎉",
          description: "Your meal plan has ended. Create a new one to continue.",
        });
        return;
      }
    }
  }, [activePlan, archivePlan, toast]);

  // Calculate date range for active plan
  const totalDays = activePlan
    ? activePlan.durationUnit === "weeks"
      ? activePlan.duration * 7
      : activePlan.duration
    : 0;

  const startDate = activePlan ? parseISO(activePlan.startDate) : new Date();
  
  // Calculate which day today is in the plan
  let todayDayNumber = 1;
  if (activePlan && isToday(startDate)) {
    todayDayNumber = 1;
  } else if (activePlan) {
    const today = new Date();
    const daysSinceStart = differenceInDays(today, startDate);
    todayDayNumber = Math.max(1, Math.min(totalDays, daysSinceStart + 1));
  }

  // Set initial day based on URL or today - only run once on mount
  useEffect(() => {
    if (activePlan && totalDays > 0) {
      let targetDay = 1;

      if (urlDate) {
        const dateDiff = differenceInDays(parsedDate, startDate);
        targetDay = Math.max(1, Math.min(totalDays, dateDiff + 1));
      } else {
        targetDay = todayDayNumber;
      }

      setSelectedDayNumber(targetDay);
    }
  }, []); // Only run once on mount

  const currentDate = new Date(startDate);
  currentDate.setUTCDate(startDate.getUTCDate() + (selectedDayNumber - 1));
  const selectedDate = format(currentDate, "yyyy-MM-dd");

  const mealsForDate = useQuery(
    activePlan ? api.mealPlans.getMealsByDate : "skip",
    activePlan ? { date: selectedDate, planId: activePlan._id } : "skip"
  ) ?? [];
  const isLoadingMeals = mealsForDate === undefined;
  
  const markAsConsumed = useMutation(api.mealPlans.markMealAsConsumed);
  const deleteMeal = useMutation(api.mealPlans.deleteMeal);
  const deleteMealPlan = useMutation(api.mealPlans.deleteMealPlan);
  const addMealToPlan = useMutation(api.mealPlans.addMealToPlan);
  const regenerateMealAction = useAction(api.mealPlans.regenerateMealAction);
  
  // Prefetched queries - instant from cache
  const pantryItems = useQuery(api.pantry.getUserPantry) ?? [];
  const profile = useQuery(api.users.getUserProfile);

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
        router.push("/dashboard/meal-plans/new");
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
    if (!meal || !meal._id) {
      toast({
        title: "Error",
        description: "No meal selected",
        variant: "destructive",
      });
      return;
    }

    setIsRegenerating(true);
    
    // Show loading toast
    toast({
      title: customReq ? "🧑‍🍳 Creating your custom recipe..." : "🎲 Generating a surprise meal...",
      description: customReq || "Finding the perfect recipe from your pantry",
    });

    try {
      await regenerateMealAction({
        mealId: meal._id,
        customRequest: customReq || undefined,
      });

      // Success toast
      toast({
        title: "✨ Recipe regenerated successfully!",
        description: customReq 
          ? `Your custom ${meal.mealType} is ready!` 
          : `New ${meal.mealType} has been created!`,
      });

      setIsRefreshDialogOpen(false);
      setCustomRequest("");
    } catch (error: any) {
      console.error("Error regenerating meal:", error);
      toast({
        title: "❌ Oops! Something went wrong",
        description: error.message || "Failed to regenerate meal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  // Update URL when day changes - only when state changes, not on URL changes
  useEffect(() => {
    if (activePlan && selectedDayNumber > 0) {
      const currentDate = new Date(startDate);
      currentDate.setUTCDate(startDate.getUTCDate() + (selectedDayNumber - 1));
      const dateStr = format(currentDate, "yyyy-MM-dd");

      // Always update URL when selectedDayNumber changes (but don't trigger re-renders)
      router.replace(`/dashboard/meal-plans?date=${dateStr}`, { scroll: false });
    }
  }, [selectedDayNumber, activePlan, startDate, router]); // Removed searchParams to prevent loops

  const totalCalories = mealsForDate?.reduce((sum, meal) => sum + (meal.nutritionalInfo?.calories || 0), 0) || 0;
  const consumedCalories =
    mealsForDate
      ?.filter((meal) => meal.consumed)
      .reduce((sum, meal) => sum + (meal.nutritionalInfo?.calories || 0), 0) || 0;

  if (isLoadingPlans) {
    return <div>Loading...</div>;
  }

  if (!activePlan) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Meal Plans</h1>
            <p className="text-gray-600">View and manage your meal plans</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">No active meal plan</p>
            <Button onClick={() => router.push("/dashboard/meal-plans/new")}>
              Create Meal Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Meal Plans</h1>
          <p className="text-gray-600">View and manage your meal plans</p>
        </div>
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
      </div>

      {/* Day Timeline Navigation */}
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
              <Button onClick={() => router.push("/dashboard/meal-plans/new")}>
                Create Meal Plan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Refresh Meal Dialog */}
      <Dialog open={isRefreshDialogOpen} onOpenChange={(open) => {
        if (!isRegenerating) {
          setIsRefreshDialogOpen(open);
          if (!open) setCustomRequest("");
        }
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-orange-600" />
              Regenerate {selectedMeal?.mealType || "Meal"}
            </DialogTitle>
            <DialogDescription className="text-base">
              Choose how you'd like to regenerate this meal
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Quick Action Buttons */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Quick Actions</Label>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleRegenerateMeal(selectedMeal, undefined)}
                  disabled={isRegenerating}
                  className="h-auto py-4 flex items-start gap-3 hover:bg-orange-50 hover:border-orange-300 transition-all"
                >
                  <RefreshCw className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-base">Surprise Me!</div>
                    <div className="text-sm text-gray-500 font-normal">
                      Generate a random recipe based on your pantry
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or customize</span>
              </div>
            </div>

            {/* Custom Request */}
            <div className="space-y-3">
              <Label htmlFor="customRequest" className="text-sm font-semibold text-gray-700">
                Tell us what you're craving
              </Label>
              <div className="relative">
                <Utensils className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="customRequest"
                  placeholder="e.g., Spicy chicken pasta with garlic and tomatoes"
                  value={customRequest}
                  onChange={(e) => setCustomRequest(e.target.value)}
                  disabled={isRegenerating}
                  className="pl-10 h-12 text-base"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customRequest.trim() && !isRegenerating) {
                      handleRegenerateMeal(selectedMeal, customRequest);
                    }
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                Press Enter or click below to generate your custom recipe
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => handleRegenerateMeal(selectedMeal, customRequest)}
                disabled={isRegenerating || !customRequest.trim()}
                className="flex-1 h-11 text-base font-semibold"
              >
                {isRegenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ChefHat className="h-4 w-4 mr-2" />
                    Generate Custom Recipe
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRefreshDialogOpen(false);
                  setCustomRequest("");
                }}
                disabled={isRegenerating}
                className="h-11"
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
