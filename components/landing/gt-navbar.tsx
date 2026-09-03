"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Menu, X, ArrowRight, Compass } from "lucide-react";

const LINKS = [
  { label: "01 IRELAND", href: "#mile-ireland" },
  { label: "02 ITALY", href: "#mile-italy" },
  { label: "03 GREECE", href: "#mile-greece" },
  { label: "04 INDIA", href: "#mile-india" },
  { label: "POSTCARDS", href: "#postcards" },
  { label: "GUESTBOOK", href: "#guestbook" },
];

/** Scroll position rendered as trip kilometres. */
function Odometer() {
  const { scrollYProgress } = useScroll();
  const eased = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.3 });
  const odo = useTransform(eased, (v) =>
    String(Math.round(Math.min(1, Math.max(0, v)) * 3842)).padStart(4, "0")
  );
  return (
    <span className="flex items-center gap-1.5">
      ODO
      <motion.span className="text-[#0F1E33] font-semibold tabular-nums">{odo}</motion.span>
      KM
    </span>
  );
}

export function GTNavbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-[#0F1E33]/10 bg-[#FAF7F0]/88 backdrop-blur-xl">
      {/* folio strip */}
      <div className="hidden md:block border-b border-[#0F1E33]/8 bg-[#F5F3EC]/60">
        <div className="max-w-6xl mx-auto px-6 h-7 flex items-center justify-between font-mono text-[9px] tracking-[0.24em] text-[#5B6B82]">
          <span>VOL. II — THE GRAND TOUR // A COOKBOOK SHOT FROM A VAN</span>
          <span className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 gt-rec" /> REC
            </span>
            <Odometer />
          </span>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0F1E33] flex items-center justify-center text-[#FAF7F0] shadow-md">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-serif font-semibold tracking-tight text-[#0F1E33] text-base">
            CHEF-IT-UP
          </span>
          <span className="text-[10px] font-mono tracking-[0.18em] text-[#5B6B82] hidden sm:inline pl-2 border-l border-[#0F1E33]/15">
            GRAND TOUR VOL.II
          </span>
        </Link>
        <nav aria-label="Grand Tour chapters" className="hidden md:flex items-center gap-5 text-[10px] font-mono tracking-[0.14em] text-[#5B6B82]">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className="hover:text-[#C2410C] transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/sign-in" className="text-[11px] font-mono tracking-widest text-[#5B6B82] hover:text-[#0F1E33] px-2 py-1">
            Sign In
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0F1E33] hover:bg-[#C2410C] text-white text-xs font-semibold transition-all shadow-md active:scale-95"
          >
            <span>Begin the tour</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-1.5 text-[#0F1E33]"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <nav aria-label="Grand Tour chapters" className="md:hidden bg-[#FAF7F0] border-t border-[#0F1E33]/10 px-4 py-5 space-y-3 text-xs font-mono tracking-widest">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="block text-[#0F1E33]">
              {l.label}
            </a>
          ))}
          <Link href="/onboarding" className="block text-center py-2.5 rounded-full bg-[#0F1E33] text-white font-semibold mt-2">
            Begin the tour
          </Link>
        </nav>
      )}
    </header>
  );
}
