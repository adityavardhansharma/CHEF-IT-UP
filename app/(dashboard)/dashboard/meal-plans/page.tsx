"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { MealCard } from "@/components/meal-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, parseISO, isToday, differenceInDays, addDays, endOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, RefreshCw, ChefHat, Trash2, Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import {
  PageHead,
  FolioCard,
  Stamp,
  EmptyPlate,
  FieldLabel,
  folioPrimary,
  folioOutline,
  folioDangerOutline,
} from "@/components/dashboard/folio";
import { cn } from "@/lib/utils";

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

  // Archive completed plans (once per plan — the query object identity can
  // change while the server is still archiving)
  const archivePlan = useMutation(api.mealPlans.archiveMealPlan);
  const archivedPlanIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (activePlan && !archivedPlanIds.current.has(activePlan._id)) {
      const startDate = parseISO(activePlan.startDate);
      const totalDays = activePlan.durationUnit === "weeks"
        ? activePlan.duration * 7
        : activePlan.duration;
      const endDate = addDays(startDate, totalDays);

      if (endOfDay(new Date()) > endOfDay(endDate)) {
        // Plan is expired, archive it
        archivedPlanIds.current.add(activePlan._id);
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
  const deleteMealPlan = useMutation(api.mealPlans.deleteMealPlan);
  const regenerateMealAction = useAction(api.mealPlans.regenerateMealAction);

  // Prefetched queries - instant from cache
  const pantryItems = useQuery(api.pantry.getUserPantry) ?? [];
  const profile = useQuery(api.users.getUserProfile);
  void profile;

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
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-full bg-[#0F1E33]/10" />
        <div className="h-64 animate-pulse rounded-2xl bg-[#0F1E33]/5" />
      </div>
    );
  }

  if (!activePlan) {
    return (
      <div className="space-y-8">
        <PageHead
          kicker="WEEK PASSES"
          title="Meal plans."
          deck="Every week gets its own pass — planned from your pantry, scaled to your table."
        />
        <EmptyPlate
          kicker="NO ACTIVE PASS"
          title="No week on the stove."
          body="Write your first week pass and EchoAI will plate every day from your pantry."
        >
          <Button onClick={() => router.push("/dashboard/meal-plans/new")} className={cn(folioPrimary, "text-sm")}>
            Create Meal Plan
          </Button>
        </EmptyPlate>
      </div>
    );
  }

  const progress = totalCalories > 0 ? Math.min((consumedCalories / totalCalories) * 100, 100) : 0;

  return (
    <div className="space-y-8">
      <PageHead
        kicker={`WEEK PASS // DAY ${selectedDayNumber} OF ${totalDays}`}
        title="Meal plans."
        deck="Walk the week day by day — mark plates as eaten and the pantry deducts itself."
        action={
          <>
            <Stamp tone="moss">
              ACTIVE · {activePlan.duration} {activePlan.durationUnit.toUpperCase()}
            </Stamp>
            <Button
              variant="outline"
              onClick={() => handleDeleteMealPlan(activePlan._id)}
              className={cn(folioDangerOutline, "gap-2 text-xs")}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete pass
            </Button>
          </>
        }
      />

      {/* Day rail */}
      <FolioCard className="p-4 sm:p-6">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={() => setSelectedDayNumber(Math.max(1, selectedDayNumber - 1))}
            disabled={selectedDayNumber === 1}
            className="shrink-0 rounded-full bg-[#0F1E33]/5 p-2 transition-all hover:bg-[#0F1E33] hover:text-[#FAF7F0] disabled:opacity-30 disabled:hover:bg-[#0F1E33]/5 disabled:hover:text-[#0F1E33]"
            title="Previous day"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center justify-start gap-2 overflow-x-auto px-1 py-1 sm:justify-center">
            {Array.from({ length: totalDays }, (_, i) => {
              const dayNum = i + 1;
              const isActive = selectedDayNumber === dayNum;
              const dayDate = new Date(startDate);
              dayDate.setUTCDate(startDate.getUTCDate() + i);

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDayNumber(dayNum)}
                  className={cn(
                    "shrink-0 rounded-2xl border px-3.5 py-2.5 text-center transition-all",
                    isActive
                      ? "border-[#0F1E33] bg-[#0F1E33] text-[#FAF7F0] shadow-lg"
                      : "border-[#0F1E33]/15 bg-white text-[#0F1E33] hover:border-[#C2410C]/60"
                  )}
                >
                  <div className={cn("font-mono text-[9px] tracking-[0.2em]", isActive ? "text-[#FAF7F0]/70" : "text-[#5B6B82]")}>
                    {format(dayDate, "EEE").toUpperCase()}
                  </div>
                  <div className="font-serif text-lg leading-tight">{format(dayDate, "dd")}</div>
                  <div className={cn("font-mono text-[9px]", isActive ? "text-[#C2410C]" : "text-[#5B6B82]", isActive && "text-amber-200")}>
                    DAY {dayNum}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setSelectedDayNumber(Math.min(totalDays, selectedDayNumber + 1))}
            disabled={selectedDayNumber === totalDays}
            className="shrink-0 rounded-full bg-[#0F1E33]/5 p-2 transition-all hover:bg-[#0F1E33] hover:text-[#FAF7F0] disabled:opacity-30 disabled:hover:bg-[#0F1E33]/5 disabled:hover:text-[#0F1E33]"
            title="Next day"
            aria-label="Next day"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="font-serif text-lg tracking-tight">
            {format(currentDate, "EEEE, MMMM dd, yyyy")}
          </p>
          <p className="font-mono text-[10px] tracking-[0.2em] text-[#5B6B82]">
            DAY {selectedDayNumber} OF {totalDays}
          </p>
        </div>
      </FolioCard>

      {/* Day fuel */}
      {mealsForDate && mealsForDate.length > 0 && (
        <FolioCard className="p-6">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-serif text-xl tracking-tight">Day fuel</h2>
            <p className="font-mono text-xs text-[#5B6B82]">
              <span className="font-semibold text-[#0F1E33]">{consumedCalories}</span> / {totalCalories} KCAL
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#0F1E33]/10">
            <div
              className="h-full rounded-full bg-[#C2410C] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </FolioCard>
      )}

      {/* Meals */}
      <div className="space-y-4">
        {isLoadingMeals ? (
          <>
            {[1, 2, 3].map((i) => (
              <FolioCard key={i} className="space-y-4 p-6">
                <div className="h-5 w-24 animate-pulse rounded-full bg-[#0F1E33]/10" />
                <div className="h-7 w-56 animate-pulse rounded-lg bg-[#0F1E33]/10" />
                <div className="h-28 animate-pulse rounded-xl bg-[#0F1E33]/5" />
              </FolioCard>
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
        ) : (
          <EmptyPlate
            kicker={`DAY ${selectedDayNumber}`}
            title="Nothing plated this day."
            body="This day has no meals generated yet."
          />
        )}
      </div>

      {/* Regenerate dialog */}
      <Dialog open={isRefreshDialogOpen} onOpenChange={(open) => {
        if (!isRegenerating) {
          setIsRefreshDialogOpen(open);
          if (!open) setCustomRequest("");
        }
      }}>
        <DialogContent className="border-[#0F1E33]/15 bg-[#FAF7F0] text-[#0F1E33] sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif text-2xl tracking-tight">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F1E33] text-[#FAF7F0]">
                <ChefHat className="h-4 w-4" />
              </span>
              Re-deal <span className="capitalize">{selectedMeal?.mealType || "meal"}</span>
            </DialogTitle>
            <DialogDescription className="font-light text-[#475569]">
              Surprise yourself, or tell EchoAI exactly what you&apos;re craving.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <FieldLabel>Quick actions</FieldLabel>
              <Button
                variant="outline"
                onClick={() => handleRegenerateMeal(selectedMeal, undefined)}
                disabled={isRegenerating}
                className="flex h-auto w-full items-start gap-3 rounded-2xl border-[#0F1E33]/15 bg-white py-4 text-left transition-all hover:border-[#C2410C]/60"
              >
                <RefreshCw className={`mt-0.5 h-5 w-5 shrink-0 text-[#C2410C] ${isRegenerating ? "animate-spin" : ""}`} />
                <span className="flex-1">
                  <span className="block font-serif text-base">Surprise me</span>
                  <span className="block text-sm font-light text-[#475569]">
                    A random plate from your pantry.
                  </span>
                </span>
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#0F1E33]/15" />
              </div>
              <div className="relative flex justify-center font-mono text-[10px] tracking-[0.2em]">
                <span className="bg-[#FAF7F0] px-2 text-[#5B6B82]">OR ASK</span>
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="customRequest">What are you craving</FieldLabel>
              <div className="relative">
                <Utensils className="absolute left-3 top-3.5 h-4 w-4 text-[#5B6B82]" />
                <Input
                  id="customRequest"
                  placeholder="e.g. Spicy chicken pasta with garlic"
                  value={customRequest}
                  onChange={(e) => setCustomRequest(e.target.value)}
                  disabled={isRegenerating}
                  className="h-12 border-[#0F1E33]/20 bg-white pl-10 text-base placeholder:text-[#5B6B82]/70 focus-visible:border-[#C2410C] focus-visible:ring-[#C2410C]/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customRequest.trim() && !isRegenerating) {
                      handleRegenerateMeal(selectedMeal, customRequest);
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handleRegenerateMeal(selectedMeal, customRequest)}
                disabled={isRegenerating || !customRequest.trim()}
                className={cn(folioPrimary, "h-11 flex-1 gap-2 text-base")}
              >
                {isRegenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Plating…
                  </>
                ) : (
                  <>
                    <ChefHat className="h-4 w-4" />
                    Generate Custom Plate
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
                className={cn(folioOutline, "h-11")}
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
