"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Calendar, ChefHat, ShoppingBasket, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format, parseISO, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  PageHead,
  FolioCard,
  Stamp,
  StatPlate,
  EmptyPlate,
  folioPrimary,
  folioOutline,
} from "@/components/dashboard/folio";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const user = useQuery(api.users.getCurrentUser);
  const mealPlans = useQuery(api.mealPlans.getUserMealPlans);
  const pantryItems = useQuery(api.pantry.getUserPantry);
  const archivePlan = useMutation(api.mealPlans.archiveMealPlan);
  const { toast } = useToast();

  const activePlan = mealPlans?.find((plan) => plan.status === "active");

  // Archive an expired active plan exactly once — never during render.
  // (Mutating + toasting mid-render re-rendered in a loop → React #301 crash.)
  const archivedPlanIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!activePlan || archivedPlanIds.current.has(activePlan._id)) return;
    const startDate = parseISO(activePlan.startDate);
    const totalDays =
      activePlan.durationUnit === "weeks"
        ? activePlan.duration * 7
        : activePlan.duration;
    const endDate = addDays(startDate, totalDays);

    if (Date.now() > endDate.getTime()) {
      archivedPlanIds.current.add(activePlan._id);
      archivePlan({ planId: activePlan._id });
      toast({
        title: "Meal plan completed! 🎉",
        description: "Your meal plan has ended. Create a new one to continue.",
      });
    }
  }, [activePlan, archivePlan, toast]);

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

  const firstName = user?.name?.split(" ")[0] || user?.username || "Chef";

  return (
    <div className="space-y-8">
      <PageHead
        kicker="HOUSE LEDGER // TODAY"
        title={<>Welcome back, <span className="italic text-[#C2410C]">{firstName}.</span></>}
        deck="Here's what's cooking today — pantry synced, portions scaled, allergens locked."
        action={
          <Link href="/dashboard/meal-plans/new">
            <Button className={cn(folioPrimary, "gap-1.5 text-sm")}>
              New Meal Plan <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatPlate
          kicker="ACTIVE PLAN"
          value={
            activePlan ? (
              <>{activePlan.duration} <span className="text-xl">{activePlan.durationUnit}</span></>
            ) : (
              "—"
            )
          }
          sub={
            activePlan
              ? `Started ${format(parseISO(activePlan.startDate), "MMM dd")}`
              : "No plan on the stove"
          }
        />
        <StatPlate
          kicker="PANTRY STOCK"
          value={pantryItems?.length ?? "…"}
          sub="Items on the shelves"
        />
        <StatPlate
          kicker="EATEN TODAY"
          value={todayConsumedCalories}
          sub={`of ${todayCalories} kcal planned`}
        />
        <StatPlate
          kicker="MEALS DONE"
          value={`${todayMeals?.filter((m) => m.consumed).length || 0}/${todayMeals?.length || 0}`}
          sub="Completed today"
        />
      </div>

      {/* Today's Meals */}
      <FolioCard>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#0F1E33]/10 px-6 py-4">
          <div>
            <h2 className="font-serif text-xl tracking-tight text-[#0F1E33]">Today&apos;s table</h2>
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#5B6B82]">
              {format(new Date(), "EEEE, MMMM dd, yyyy").toUpperCase()}
            </p>
          </div>
          {activePlan && <Stamp tone="moss">PLAN ACTIVE</Stamp>}
        </div>
        {todayMeals && todayMeals.length > 0 ? (
          <ul className="divide-y divide-[#0F1E33]/8">
            {todayMeals.map((meal) => (
              <li
                key={meal._id}
                className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-white/60"
              >
                <div className="min-w-0">
                  <Stamp tone="paper" className="capitalize">{meal.mealType}</Stamp>
                  <p className="mt-1.5 truncate font-medium text-[#0F1E33]">{meal.recipeName}</p>
                  <p className="font-mono text-[11px] text-[#5B6B82]">
                    {meal.nutritionalInfo?.calories ?? 0} KCAL
                  </p>
                </div>
                <div className="shrink-0">
                  {meal.consumed ? (
                    <Stamp tone="moss">✓ EATEN</Stamp>
                  ) : (
                    <Link href={`/dashboard/meal-plans?date=${meal.date}`}>
                      <Button className={cn(folioOutline, "h-9 text-xs")}>View</Button>
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-10 text-center">
            <p className="font-serif text-lg text-[#0F1E33]">
              {activePlan ? "Nothing plated for today." : "The stove is cold."}
            </p>
            <p className="mt-1 text-sm font-light text-[#5B6B82]">
              {activePlan
                ? "No meals scheduled for today in your active plan."
                : "Write your first week pass to get cooking."}
            </p>
            <Link href="/dashboard/meal-plans/new" className="mt-5 inline-block">
              <Button className={cn(folioPrimary, "text-sm")}>Create Meal Plan</Button>
            </Link>
          </div>
        )}
      </FolioCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            href: "/dashboard/pantry",
            icon: ShoppingBasket,
            title: "Stock the pantry",
            body: "Add or update what's on your shelves.",
            tag: "SYNCED",
          },
          {
            href: "/dashboard/meal-plans/new",
            icon: Calendar,
            title: "Plan the week",
            body: "A new week pass, tuned to your pantry.",
            tag: "ECHOAI",
          },
          {
            href: "/dashboard/profile",
            icon: ChefHat,
            title: "Tune your profile",
            body: "Diets, allergies, favourites — locked in.",
            tag: "0.0 PPM",
          },
        ].map((a) => {
          const Icon = a.icon;
          return (
          <Link key={a.href} href={a.href} className="group">
            <FolioCard className="h-full p-6 transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_26px_56px_-20px_rgba(15,30,51,0.45)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F1E33] text-[#FAF7F0] transition-colors group-hover:bg-[#C2410C]">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 font-serif text-xl tracking-tight">{a.title}</h3>
              <p className="mt-1 text-sm font-light text-[#475569]">{a.body}</p>
              <p className="mt-3 font-mono text-[10px] tracking-[0.22em] text-[#C2410C]">
                {a.tag} →
              </p>
            </FolioCard>
          </Link>
          );
        })}
      </div>

      {/* Proof strip */}
      <div className="flex items-center gap-3 overflow-hidden rounded-2xl border border-[#0F1E33]/12 bg-[#0B1E3A] px-6 py-4 text-[#FAF7F0]">
        <TrendingUp className="h-4 w-4 shrink-0 text-amber-200" />
        <p className="truncate font-mono text-[10px] tracking-[0.2em] sm:text-[11px]">
          PANTRY DEDUCTS AS YOU EAT · PORTIONS 1P → 6P · 16 CUISINES
        </p>
      </div>
    </div>
  );
}
