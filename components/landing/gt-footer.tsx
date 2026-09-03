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
            A road-trip scrapbook for dinner. Pantry-synced, portion-aware,
            allergen-locked — from Moher fog to Jaipur spice to the home hearth at 19:15.
          </p>
          <p className="font-mono text-[11px] text-[#047857]">● SmartPantry Engine // 0.0 PPM Active</p>
        </div>
        <div className="space-y-2">
          <p className="font-mono tracking-[0.18em] text-[#0F1E33]">MILES</p>
          <a href="#mile-ireland" className="block hover:text-[#C2410C]">Ireland Trek</a>
          <a href="#mile-italy" className="block hover:text-[#C2410C]">Italy Cycle</a>
          <a href="#mile-greece" className="block hover:text-[#C2410C]">Greece Picnic</a>
          <a href="#mile-india" className="block hover:text-[#C2410C]">India Family</a>
          <a href="#guestbook" className="block hover:text-[#C2410C]">Guestbook</a>
        </div>
        <div className="space-y-2">
          <p className="font-mono tracking-[0.18em] text-[#0F1E33]">ENGINE</p>
          <Link href="/onboarding" className="block hover:text-[#C2410C]">Pantry Sync</Link>
          <Link href="/onboarding" className="block hover:text-[#C2410C]">Portions 1P–6P</Link>
          <Link href="/onboarding" className="block hover:text-[#C2410C]">Allergen Lock</Link>
          <Link href="/onboarding" className="block hover:text-[#C2410C]">Surprise Me</Link>
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
          <span>© {new Date().getFullYear()} CHEF-IT-UP — Grand Tour Vol.II</span>
          <span>Moher → Dolomites → Oia → Jaipur → Home</span>
        </div>
      </div>
    </footer>
  );
}
