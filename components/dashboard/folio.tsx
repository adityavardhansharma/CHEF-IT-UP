"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   FOLIO — shared dashboard primitives in the landing's design language.
   Paper, ink, ember. Serif headlines, mono microcopy. No photos.
   ------------------------------------------------------------------ */

export function PageHead({
  kicker,
  title,
  deck,
  action,
}: {
  kicker: string;
  title: React.ReactNode;
  deck?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-[#0F1E33]/15 bg-white px-3 py-1 font-mono text-[10px] tracking-[0.22em] text-[#0F1E33]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C2410C]" />
          {kicker}
        </p>
        <h1 className="mt-3 font-serif text-3xl tracking-tight text-[#0F1E33] sm:text-4xl">
          {title}
        </h1>
        {deck && (
          <p className="mt-2 text-sm font-light leading-relaxed text-[#475569]">{deck}</p>
        )}
      </div>
      {action && <div className="flex flex-wrap items-center gap-3">{action}</div>}
    </div>
  );
}

export function FolioCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#0F1E33]/12 bg-[#FFFDF6] text-[#0F1E33] shadow-[0_18px_44px_-24px_rgba(15,30,51,0.35)]",
        className
      )}
    >
      {children}
    </div>
  );
}

type StampTone = "ink" | "ember" | "moss" | "paper";

const STAMP_TONES: Record<StampTone, string> = {
  ink: "border-[#0F1E33]/25 text-[#0F1E33]",
  ember: "border-[#C2410C]/45 text-[#C2410C]",
  moss: "border-[#047857]/40 text-[#047857]",
  paper: "border-[#0F1E33]/15 text-[#5B6B82]",
};

export function Stamp({
  tone = "ink",
  className,
  children,
}: {
  tone?: StampTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border bg-white/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em]",
        STAMP_TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatPlate({
  kicker,
  value,
  sub,
}: {
  kicker: string;
  value: React.ReactNode;
  sub: string;
}) {
  return (
    <FolioCard className="p-5">
      <p className="font-mono text-[10px] tracking-[0.22em] text-[#5B6B82]">{kicker}</p>
      <p className="mt-2 font-serif text-3xl tracking-tight text-[#0F1E33]">{value}</p>
      <p className="mt-1 text-xs font-light text-[#5B6B82]">{sub}</p>
    </FolioCard>
  );
}

export function EmptyPlate({
  kicker,
  title,
  body,
  children,
}: {
  kicker: string;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <FolioCard className="px-6 py-12 text-center sm:py-16">
      <p className="font-mono text-[10px] tracking-[0.24em] text-[#C2410C]">{kicker}</p>
      <h2 className="mt-2 font-serif text-2xl tracking-tight text-[#0F1E33] sm:text-3xl">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm font-light text-[#475569]">{body}</p>
      {children && <div className="mt-6 flex justify-center">{children}</div>}
    </FolioCard>
  );
}

/** Primary + quiet button skins that sit on top of the shadcn Button. */
export const folioPrimary =
  "rounded-full bg-[#0F1E33] font-semibold text-[#FAF7F0] shadow-md hover:bg-[#C2410C] active:scale-95 whitespace-nowrap";
export const folioOutline =
  "rounded-full border-[#0F1E33]/20 font-semibold text-[#0F1E33] hover:border-[#0F1E33]/50 hover:bg-white whitespace-nowrap";
export const folioDangerOutline =
  "rounded-full border-[#C2410C]/40 font-semibold text-[#C2410C] hover:border-[#C2410C] hover:bg-[#C2410C]/5 whitespace-nowrap";

/** Mono uppercase field label used across all dashboard forms. */
export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#5B6B82]"
    >
      {children}
    </label>
  );
}
