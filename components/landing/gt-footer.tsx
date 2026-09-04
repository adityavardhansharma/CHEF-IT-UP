"use client";

import Link from "next/link";
import { Compass } from "lucide-react";

export function GTFooter() {
  return (
    <footer className="bg-[#FAF7F0] border-t border-[#0F1E33]/12 text-[#475569]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
        <div className="col-span-2 space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#0F1E33] text-white flex items-center justify-center">
              <Compass className="w-3.5 h-3.5" />
            </span>
            <span className="font-serif font-semibold text-[#0F1E33] text-sm">CHEF-IT-UP</span>
          </Link>
          <p className="font-light leading-relaxed max-w-sm">
            Chef It Up is the AI meal planner powered by EchoAI — it cooks from
            your pantry, respects your choices and allergies, and scales every
            meal from gym dawns and lunchboxes to the family table.
          </p>
          <p className="font-mono text-[11px] text-[#047857]">● SmartPantry Engine // 0.0 PPM Active</p>
        </div>
        <div className="space-y-2">
          <p className="font-mono tracking-[0.18em] text-[#0F1E33]">MILES</p>
          <a href="#mile-morning" className="block hover:text-[#C2410C]">06:40 Gym</a>
          <a href="#mile-kids" className="block hover:text-[#C2410C]">Kids Table</a>
          <a href="#mile-afterwork" className="block hover:text-[#C2410C]">18:15 Rescue</a>
          <a href="#mile-family" className="block hover:text-[#C2410C]">Family Table</a>
          <a href="#mile-weekend" className="block hover:text-[#C2410C]">Van Weekend</a>
          <a href="#guestbook" className="block hover:text-[#C2410C]">Guestbook</a>
        </div>
        <div className="space-y-2">
          <p className="font-mono tracking-[0.18em] text-[#0F1E33]">ENGINE</p>
          <Link href="/sign-up" className="block hover:text-[#C2410C]">Pantry Sync</Link>
          <Link href="/sign-up" className="block hover:text-[#C2410C]">Portions 1P–6P</Link>
          <Link href="/sign-up" className="block hover:text-[#C2410C]">Allergen Lock</Link>
          <Link href="/sign-up" className="block hover:text-[#C2410C]">Surprise Me</Link>
        </div>
        <div className="space-y-2">
          <p className="font-mono tracking-[0.18em] text-[#0F1E33]">STANDARD</p>
          <span className="block text-[#047857]">Zero Beef Policy</span>
          <span className="block">Wild Seafood</span>
          <span className="block">Pasture Poultry</span>
          <span className="block">Zero Waste</span>
        </div>
      </div>
      <div className="border-t border-[#0F1E33]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between gap-2 font-mono text-[11px] text-[#5B6B82]">
          <span>© {new Date().getFullYear()} CHEF-IT-UP — A Week in Dinners, Vol.II</span>
          <span>06:40 → 19:30 → Weekend → Home</span>
        </div>
      </div>
    </footer>
  );
}
