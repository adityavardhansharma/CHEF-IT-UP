"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { IngredientItem } from "@/components/ingredient-item";
import { Check, RefreshCw, ChefHat, Clock, Utensils } from "lucide-react";
import { APP_BRANDING } from "@/lib/branding";
import { FolioCard, Stamp, folioPrimary, folioOutline } from "@/components/dashboard/folio";
import { cn } from "@/lib/utils";

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
    <FolioCard className={meal.consumed ? "opacity-75" : ""}>
      <div className="flex items-start justify-between gap-4 p-6 pb-0">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Stamp tone="ink" className="capitalize">
              {meal.mealType}
            </Stamp>
            {meal.consumed && (
              <Stamp tone="moss">
                <Check className="h-3 w-3" />
                EATEN
              </Stamp>
            )}
          </div>
          <h3 className="mt-2 font-serif text-2xl tracking-tight text-[#0F1E33]">
            {meal.recipeName}
          </h3>
          {meal.recipeDescription && (
            <p className="mt-1 text-sm font-light leading-relaxed text-[#475569]">
              {meal.recipeDescription}
            </p>
          )}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F1E33]/5 text-[#0F1E33]">
          <ChefHat className="h-5 w-5" />
        </span>
      </div>

      <div className="space-y-5 p-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] tracking-[0.12em] text-[#5B6B82]">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {meal.recipeData.cookingTime} MIN
          </span>
          <span className="flex items-center gap-1.5 uppercase">
            <Utensils className="h-3.5 w-3.5" />
            {meal.recipeData.difficulty}
          </span>
          <span className="font-semibold text-[#0F1E33]">
            {meal.nutritionalInfo?.calories} KCAL
          </span>
        </div>

        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5B6B82]">
            Ingredients
          </h4>
          <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-2">
            {meal.recipeData.ingredients.map((ing: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="h-1 w-1 shrink-0 rounded-full bg-[#C2410C]" />
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
          <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5B6B82]">
            Method
          </h4>
          <ol className="mt-2 space-y-2 text-sm font-light leading-relaxed text-[#0F1E33]">
            {meal.recipeData.instructions.map((instruction: string, idx: number) => (
              <li key={idx} className="flex gap-2.5">
                <span className="font-mono text-xs font-semibold text-[#C2410C]">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5B6B82]">
            At the stove
          </h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {meal.recipeData.utensils.map((utensil: string, idx: number) => (
              <Stamp key={idx} tone="paper">
                {utensil}
              </Stamp>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#0F1E33]/10 bg-[#FAF7F0] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5B6B82]">
            Per serving · {APP_BRANDING.nutritionData.tagline}
          </p>
          <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
            {[
              ["Protein", `${meal.nutritionalInfo?.protein}g`],
              ["Carbs", `${meal.nutritionalInfo?.carbs}g`],
              ["Fat", `${meal.nutritionalInfo?.fat}g`],
              ["Fiber", `${meal.nutritionalInfo?.fiber || 0}g`],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#5B6B82]">
                  {label}
                </p>
                <p className="mt-0.5 font-serif text-lg text-[#0F1E33]">{val}</p>
              </div>
            ))}
          </div>
          {meal.portionSize && meal.portionSize > 1 && (
            <p className="mt-2 font-mono text-[11px] text-[#047857]">
              1P → {meal.portionSize}P · QUANTITIES SCALED FOR THE TABLE
            </p>
          )}
        </div>

        {!meal.consumed && (
          <div className="flex gap-2 border-t border-[#0F1E33]/10 pt-4">
            <Button onClick={onMarkAsConsumed} className={cn(folioPrimary, "flex-1 gap-2 text-sm")}>
              <Check className="h-4 w-4" />
              Mark as Eaten
            </Button>
            <Button
              variant="outline"
              onClick={() => onRefresh(true)}
              disabled={isRegenerating}
              className={cn(folioOutline, "px-3")}
              title="Surprise me with a random recipe"
            >
              <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="outline"
              onClick={onCustomRequest}
              disabled={isRegenerating}
              className={cn(folioOutline, "gap-2 text-sm")}
              title="Create a custom recipe"
            >
              <ChefHat className="h-4 w-4" />
              Custom
            </Button>
          </div>
        )}
      </div>
    </FolioCard>
  );
});
