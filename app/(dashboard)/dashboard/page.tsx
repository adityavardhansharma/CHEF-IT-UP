"use client";

import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChefHat, ShoppingBasket, TrendingUp } from "lucide-react";
import Link from "next/link";
import { format, parseISO, addDays, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const user = useQuery(api.users.getCurrentUser);
  const mealPlans = useQuery(api.mealPlans.getUserMealPlans);
  const pantryItems = useQuery(api.pantry.getUserPantry);
  const archivePlan = useMutation(api.mealPlans.archiveMealPlan);
  const { toast } = useToast();
  
  const activePlan = mealPlans?.find((plan) => plan.status === "active");
  
  // Check if active plan is expired and archive it
  if (activePlan) {
    const startDate = parseISO(activePlan.startDate);
    const totalDays = activePlan.durationUnit === "weeks" 
      ? activePlan.duration * 7 
      : activePlan.duration;
    const endDate = addDays(startDate, totalDays);
    
    if (Date.now() > endDate.getTime()) {
      archivePlan({ planId: activePlan._id });
      toast({
        title: "Meal plan completed! 🎉",
        description: "Your meal plan has ended. Create a new one to continue.",
      });
    }
  }
  
  // Calculate today's meals based on active plan
  const todayMeals = useQuery(
    activePlan ? api.mealPlans.getMealsByDate : "skip",
    activePlan ? { 
      date: format(new Date(), "yyyy-MM-dd"), 
      planId: activePlan._id 
    } : "skip"
  ) ?? [];
  
  const todayCalories =
    todayMeals?.reduce((sum, meal) => sum + (meal.nutritionalInfo?.calories || 0), 0) || 0;
  const todayConsumedCalories =
    todayMeals
      ?.filter((meal) => meal.consumed)
      .reduce((sum, meal) => sum + (meal.nutritionalInfo?.calories || 0), 0) || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user?.name || user?.username || "Chef"}! 👋
        </h1>
        <p className="text-gray-600">Here's what's cooking today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Meal Plan</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activePlan ? (
                <>
                  {activePlan.duration} {activePlan.durationUnit}
                </>
              ) : (
                "None"
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {activePlan
                ? `Started ${format(parseISO(activePlan.startDate), "MMM dd")}`
                : "Create your first meal plan"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pantry Items</CardTitle>
            <ShoppingBasket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pantryItems?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Items in your pantry</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Calories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayConsumedCalories}</div>
            <p className="text-xs text-muted-foreground">of {todayCalories} planned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Meals</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayMeals?.filter((m) => m.consumed).length || 0}/{todayMeals?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Meals completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Meals */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Meals</CardTitle>
          <CardDescription>{format(new Date(), "EEEE, MMMM dd, yyyy")}</CardDescription>
        </CardHeader>
        <CardContent>
          {todayMeals && todayMeals.length > 0 ? (
            <div className="space-y-4">
              {todayMeals.map((meal) => (
                <div
                  key={meal._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold capitalize">{meal.mealType}</h3>
                    <p className="text-sm text-gray-600">{meal.recipeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {meal.nutritionalInfo?.calories} calories
                    </p>
                  </div>
                  <div>
                    {meal.consumed ? (
                      <span className="text-sm text-green-600 font-medium">✓ Completed</span>
                    ) : (
                      <Link href={`/dashboard/meal-plans?date=${meal.date}`}>
                        <Button size="sm">View</Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {activePlan 
                  ? "No meals scheduled for today in your active plan" 
                  : "No meals planned for today"
                }
              </p>
              <Link href="/dashboard/meal-plans/new">
                <Button>Create Meal Plan</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/pantry">
            <CardHeader>
              <ShoppingBasket className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Manage Pantry</CardTitle>
              <CardDescription>Add or update your pantry items</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/meal-plans/new">
            <CardHeader>
              <Calendar className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Plan Meals</CardTitle>
              <CardDescription>Create a new meal plan with AI</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/profile">
            <CardHeader>
              <ChefHat className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Update Profile</CardTitle>
              <CardDescription>Set dietary preferences and restrictions</CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  );
}
