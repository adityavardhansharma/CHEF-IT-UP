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
            ? "cursor-help border-b-2 border-dotted border-[#C2410C]"
            : ""
        }`}
        onMouseEnter={() => !isAvailable && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {quantity && <span className="font-semibold">{quantity} </span>}
        {name}
        {isStaple && assumeStaples && (
          <span className="ml-1 font-mono text-[10px] tracking-[0.12em] text-[#5B6B82]">
            STAPLE
          </span>
        )}
      </span>

      {showTooltip && !isAvailable && (
        <div className="absolute -top-11 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-xl border border-[#0F1E33]/20 bg-[#0F1E33] px-3 py-2 font-mono text-[10px] tracking-[0.14em] text-[#FAF7F0] shadow-lg">
          NOT IN PANTRY
          <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#0F1E33]" />
        </div>
      )}
    </div>
  );
}
