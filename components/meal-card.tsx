"use client";

import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IngredientItem } from "@/components/ingredient-item";
import { Check, RefreshCw, ChefHat, Clock, Utensils } from "lucide-react";
import { APP_BRANDING } from "@/lib/branding";

interface MealCardProps {
  meal: any;
  getIngredientStatus: (name: string) => boolean;
  assumeStaples: boolean;
  onMarkAsConsumed: () => void;
  onRefresh: (surpriseMe: boolean) => void;
  onCustomRequest: () => void;
  isRegenerating?: boolean;
}

export const MealCard = memo(function MealCard({
  meal,
  getIngredientStatus,
  assumeStaples,
  onMarkAsConsumed,
  onRefresh,
  onCustomRequest,
  isRegenerating,
}: MealCardProps) {
  return (
    <Card className={meal.consumed ? "opacity-75" : ""}>
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
                  assumeStaples={assumeStaples}
                />
              </div>
            ))}
          </div>
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
          <p className="text-xs text-gray-500 mb-2">
            {APP_BRANDING.nutritionData.tagline} • Per serving (1 person)
          </p>
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
              <Button onClick={onMarkAsConsumed} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Mark as Eaten
              </Button>
              <Button
                variant="outline"
                onClick={() => onRefresh(true)}
                disabled={isRegenerating}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={onCustomRequest}>
                Custom Recipe
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

