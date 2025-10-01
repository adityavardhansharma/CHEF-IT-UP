"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Prefetch common queries in the background for instant navigation
 * Convex will cache these and keep them updated in real-time
 * This runs once when the dashboard layout loads
 */
export function PrefetchQueries() {
  // Subscribe to real-time updates - Convex keeps these fresh automatically
  useQuery(api.pantry.getUserPantry);
  useQuery(api.mealPlans.getUserMealPlans);
  useQuery(api.users.getUserProfile);

  // Component doesn't render anything - just subscribes to data
  return null;
}

