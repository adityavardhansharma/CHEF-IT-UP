"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Compass } from "lucide-react";

/** Shared Clerk theming — ink buttons, paper card, mono microcopy. */
export const authAppearance = {
  variables: {
    colorPrimary: "#0F1E33",
    colorBackground: "#FFFDF6",
    colorText: "#0F1E33",
    colorTextSecondary: "#5B6B82",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#0F1E33",
    borderRadius: "12px",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
  },
  elements: {
    rootBox: "w-full",
    card: "shadow-[0_24px_60px_-20px_rgba(15,30,51,0.35)] border border-[#0F1E33]/12 rounded-2xl",
    headerTitle: "font-serif text-[#0F1E33]",
    headerSubtitle: "text-[#5B6B82]",
    formButtonPrimary:
      "bg-[#0F1E33] hover:bg-[#C2410C] rounded-full text-sm normal-case tracking-normal transition-colors",
    footerActionLink: "text-[#C2410C] hover:text-[#0F1E33]",
    formFieldLabel: "font-mono text-[10px] tracking-[0.16em] uppercase text-[#5B6B82]",
    identityPreviewText: "text-[#0F1E33]",
    formFieldInput:
      "border-[#0F1E33]/15 focus:border-[#0F1E33]/40 rounded-xl",
    socialButtonsBlockButton:
      "border-[#0F1E33]/15 hover:border-[#0F1E33]/40 rounded-xl",
    dividerLine: "bg-[#0F1E33]/10",
    dividerText: "font-mono text-[10px] tracking-[0.2em] text-[#5B6B82]",
  },
} as const;

const SIDE = {
  "sign-in": {
    pill: "WELCOME BACK TO THE TABLE",
    headline: (
      <>
        Dinner kept your <span className="italic text-[#C2410C]">seat warm.</span>
      </>
    ),
    deck: "EchoAI held your pantry, your portions and your week exactly where you left them. Sign in and tonight is already decided.",
    photo: "photo-1542037104857-ffbb0b9155fb",
    alt: "The whole family together outdoors",
    fig: "FIG. A // THE CREW",
    sub: "still hungry, obviously",
  },
  "sign-up": {
    pill: "TAKE YOUR SEAT",
    headline: (
      <>
        Your pantry is <span className="italic text-[#C2410C]">already a week of dinners.</span>
      </>
    ),
    deck: "Join Chef It Up — EchoAI reads your pantry, locks your allergies, scales 1P→6P across 16 cuisines. First plan in minutes.",
    photo: "photo-1528605248644-14dd04022da1",
    alt: "A big group sharing dinner at one long table",
    fig: "FIG. B // THE WHOLE CREW",
    sub: "this could be tuesday",
  },
} as const;

export function AuthShell({
  mode,
  children,
}: {
  mode: "sign-in" | "sign-up";
  children: React.ReactNode;
}) {
  const s = SIDE[mode];
  const tint = mode === "sign-in" ? "gt-tint-ireland" : "gt-tint-italy";
  return (
    <div className="min-h-screen gt-paper gt-topo text-[#0F1E33] flex flex-col">
      {/* folio strip */}
      <header className="border-b border-[#0F1E33]/10 bg-[#FAF7F0]/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-[#0F1E33] text-[#FAF7F0] flex items-center justify-center">
              <Compass className="w-3.5 h-3.5" />
            </span>
            <span className="font-serif font-semibold tracking-tight">CHEF-IT-UP</span>
            <span className="text-[10px] font-mono tracking-[0.18em] text-[#5B6B82] hidden sm:inline pl-2 border-l border-[#0F1E33]/15">
              POWERED BY ECHOAI
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono tracking-[0.16em] text-[#5B6B82] hover:text-[#C2410C] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> BACK TO THE WEEK
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        {/* editorial panel */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#0F1E33]/12 shadow-sm font-mono text-[10px] tracking-[0.2em]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 gt-rec" />
            {s.pill}
          </div>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl tracking-tight leading-[1.06]">
            {s.headline}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#475569] font-light leading-relaxed max-w-md">
            {s.deck}
          </p>

          <figure className="relative gt-print -rotate-2 hover:rotate-0 mt-8 max-w-md">
            <div className="washi-tape -top-3 left-8 -rotate-6" />
            <div className={`relative aspect-[16/10] w-full gt-photo-well gt-scenic ${tint}`}>
              <Image
                src={`https://images.unsplash.com/${s.photo}?auto=format&fit=crop&w=900&q=80`}
                alt={s.alt}
                fill
                sizes="(max-width:1024px) 90vw, 480px"
                className="object-cover"
              />
              <div className="absolute inset-0 gt-grain opacity-60 pointer-events-none" />
            </div>
            <figcaption className="pt-2.5 px-1 flex items-center justify-between text-[11px] font-mono">
              <span className="font-semibold tracking-wider">{s.fig}</span>
              <span className="text-[#5B6B82] italic font-sans">{s.sub}</span>
            </figcaption>
          </figure>

          <ul className="mt-6 space-y-2 text-sm">
            {["Pantry-synced plans", "Allergen lock 0.0 ppm", "Portions 1P → 6P"].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#0F1E33] text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span className="font-light">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* clerk card in a taped frame */}
        <div className="relative w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rotate-2 z-10 pointer-events-none">
            <div className="washi-tape !static !w-24" />
          </div>
          {children}
          <p className="mt-4 text-center font-mono text-[10px] tracking-[0.18em] text-[#5B6B82]">
            ★ CHEF-IT-UP · POWERED BY ECHOAI ★
          </p>
        </div>
      </main>

      <footer className="border-t border-[#0F1E33]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between gap-1 font-mono text-[10px] tracking-[0.18em] text-[#5B6B82]">
          <span>NOT DELIVERY — PLANNED FROM YOUR PANTRY</span>
          <span>0.0 PPM LOCK // ZERO WASTE</span>
        </div>
      </footer>
    </div>
  );
}
