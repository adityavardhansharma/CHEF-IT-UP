"use client";

import * as React from "react";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CUISINES = [
  { value: "italian", label: "Italian", emoji: "🇮🇹" },
  { value: "indian", label: "Indian", emoji: "🇮🇳" },
  { value: "japanese", label: "Japanese", emoji: "🇯🇵" },
  { value: "mexican", label: "Mexican", emoji: "🇲🇽" },
  { value: "chinese", label: "Chinese", emoji: "🇨🇳" },
  { value: "thai", label: "Thai", emoji: "🇹🇭" },
  { value: "french", label: "French", emoji: "🇫🇷" },
  { value: "mediterranean", label: "Mediterranean", emoji: "🌊" },
  { value: "greek", label: "Greek", emoji: "🇬🇷" },
  { value: "korean", label: "Korean", emoji: "🇰🇷" },
  { value: "vietnamese", label: "Vietnamese", emoji: "🇻🇳" },
  { value: "spanish", label: "Spanish", emoji: "🇪🇸" },
  { value: "american", label: "American", emoji: "🇺🇸" },
  { value: "middle-eastern", label: "Middle Eastern", emoji: "🌍" },
  { value: "caribbean", label: "Caribbean", emoji: "🏝️" },
  { value: "brazilian", label: "Brazilian", emoji: "🇧🇷" },
];

// Smart pairing suggestions
const PAIRINGS: Record<string, string[]> = {
  italian: ["mediterranean", "french", "greek"],
  indian: ["thai", "vietnamese", "middle-eastern"],
  japanese: ["korean", "chinese", "thai"],
  mexican: ["caribbean", "brazilian", "american"],
  chinese: ["japanese", "korean", "thai"],
  thai: ["vietnamese", "indian", "chinese"],
  french: ["italian", "mediterranean", "spanish"],
  mediterranean: ["greek", "middle-eastern", "italian"],
  greek: ["mediterranean", "middle-eastern", "italian"],
  korean: ["japanese", "chinese", "thai"],
  vietnamese: ["thai", "chinese", "japanese"],
  spanish: ["french", "mediterranean", "italian"],
  american: ["mexican", "italian", "caribbean"],
  "middle-eastern": ["mediterranean", "greek", "indian"],
  caribbean: ["mexican", "brazilian", "american"],
  brazilian: ["caribbean", "mexican", "spanish"],
};

interface CuisineSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function CuisineSelector({ value, onChange }: CuisineSelectorProps) {
  const selectedSet = React.useMemo(() => new Set(value), [value]);

  // Get suggested pairings based on last selected
  const suggested = React.useMemo(() => {
    if (value.length === 0) return new Set<string>();
    const lastSelected = value[value.length - 1];
    const pairs = PAIRINGS[lastSelected] || [];
    return new Set(pairs.filter(p => !selectedSet.has(p)));
  }, [value, selectedSet]);

  const toggle = (id: string) => {
    if (selectedSet.has(id)) {
      onChange(value.filter(v => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const quickPick = () => {
    // Pick 3 diverse cuisines
    const picks = ["mediterranean", "japanese", "mexican"];
    onChange(picks);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5B6B82]">Cuisines</label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={quickPick}
            className="h-7 px-2 text-xs text-[#C2410C] hover:bg-[#C2410C]/10 hover:text-[#C2410C]"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Quick pick
          </Button>
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="font-mono text-[11px] tracking-[0.12em] text-[#5B6B82] hover:text-[#0F1E33]"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Clean symmetric grid */}
      <div className="flex flex-wrap gap-2.5 justify-start">
        {CUISINES.map(c => {
          const isSelected = selectedSet.has(c.value);
          const isPaired = suggested.has(c.value);

          return (
            <button
              key={c.value}
              type="button"
              onClick={() => toggle(c.value)}
              className={cn(
                "relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                "border transition-all duration-200",
                isSelected && "bg-[#0F1E33] text-[#FAF7F0] border-[#0F1E33] shadow-md",
                !isSelected && !isPaired && "bg-white border-[#0F1E33]/20 text-[#0F1E33] hover:border-[#C2410C]/60 hover:shadow-sm",
                !isSelected && isPaired && "bg-[#C2410C]/5 border-[#C2410C]/60 text-[#0F1E33] animate-pulse-subtle shadow-sm"
              )}
              style={{
                animationDuration: isPaired ? "2s" : undefined,
              }}
            >
              {isPaired && !isSelected && (
                <span className="absolute inset-0 rounded-full border-2 border-[#C2410C] animate-border-glow shadow-[0_0_12px_rgba(194,65,12,0.35)]" />
              )}
              <span className="relative z-10 text-base">{c.emoji}</span>
              <span className="relative z-10 tracking-wide">{c.label}</span>
              {isSelected && (
                <X className="relative z-10 w-3.5 h-3.5 ml-1 opacity-70" />
              )}
            </button>
          );
        })}
      </div>

      {value.length > 0 && suggested.size > 0 && (
        <p className="font-mono text-[11px] tracking-[0.08em] text-[#5B6B82]">
          ✦ Glowing cuisines pair well with {CUISINES.find(c => c.value === value[value.length - 1])?.label}
        </p>
      )}

      {value.length === 0 && (
        <p className="font-mono text-[11px] tracking-[0.08em] text-[#5B6B82]">
          TAP TO SELECT · QUICK PICK FOR INSTANT SUGGESTIONS
        </p>
      )}

      <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        @keyframes border-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        .animate-border-glow {
          animation: border-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export { CUISINES };
