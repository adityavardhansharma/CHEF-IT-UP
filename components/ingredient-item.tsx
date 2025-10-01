"use client";

import { useState } from "react";
import { isBasicStaple } from "@/lib/staples";

interface IngredientItemProps {
  name: string;
  quantity?: string;
  isInPantry: boolean;
  assumeStaples?: boolean;
}

export function IngredientItem({
  name,
  quantity,
  isInPantry,
  assumeStaples = true,
}: IngredientItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // If it's a basic staple and we assume staples, treat as available
  const isStaple = isBasicStaple(name);
  const isAvailable = isInPantry || (assumeStaples && isStaple);
  
  return (
    <div className="relative inline-block">
      <span
        className={`${
          !isAvailable
            ? "border-b-2 border-red-500 border-dotted cursor-help"
            : ""
        }`}
        onMouseEnter={() => !isAvailable && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {quantity && <span className="font-semibold">{quantity} </span>}
        {name}
        {isStaple && assumeStaples && (
          <span className="text-xs text-gray-400 ml-1">(staple)</span>
        )}
      </span>
      
      {showTooltip && !isAvailable && (
        <div className="absolute z-50 -top-10 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap">
          <div className="flex items-center gap-1">
            <span>⚠️</span>
            <span>Not in pantry</span>
          </div>
          <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600"></div>
        </div>
      )}
    </div>
  );
}
