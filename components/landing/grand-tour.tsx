"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  animate,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Camera,
  Castle,
  Check,
  Compass,
  Dices,
  Flame,
  Landmark,
  Mail,
  MapPin,
  Navigation2,
  Stamp,
  Waves,
} from "lucide-react";

/* ------------------------------------------------------------------
   THE GRAND TOUR — a road-trip scrapbook for CHEF-IT-UP.
   Paper map page, taped film prints, tickets, passport stamps.
   Scenery is the blurry dream. Food is the sharp souvenir.
   ------------------------------------------------------------------ */

const U = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const INK = "#0F1E33";

/* ================================================================
   ATOMS
   ================================================================ */

function Tape({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`washi-tape ${className}`} />;
}

/** Counts up when scrolled into view. */
function CountUp({
  to,
  decimals = 0,
  suffix = "",
}: {
  to: number;
  decimals?: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) =>
    v.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );
  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, to, { duration: 2.4, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [inView, mv, to]);
  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{text}</motion.span>
      {suffix}
    </span>
  );
}

/** Circular passport ink stamp. */
function PassportStamp({
  icon: Icon,
  top,
  bottom,
  className = "",
}: {
  icon: React.ElementType;
  top: string;
  bottom: string;
  className?: string;
}) {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 1.5, rotate: -20 }}
      whileInView={{ opacity: 1, scale: 1, rotate: -12 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`gt-passport text-[#B45309] w-[5.5rem] h-[5.5rem] flex-col items-center justify-center font-mono text-[7px] tracking-[0.2em] uppercase text-center select-none pointer-events-none flex ${className}`}
    >
      <span className="px-3 leading-tight">{top}</span>
      <Icon className="w-4 h-4 my-1" strokeWidth={1.5} />
      <span className="px-3 leading-tight">{bottom}</span>
    </motion.div>
  );
}

/** Camcorder furniture drawn inside a photo well. */
function CamChrome({
  time,
  iso = "ISO 800",
  coords,
  plate,
}: {
  time: string;
  iso?: string;
  coords: string;
  plate?: string;
}) {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none font-mono text-[8px] sm:text-[10px] tracking-[0.18em] gt-chrome">
      <span className="absolute top-2.5 left-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 gt-rec" />
        REC <span className="opacity-75 ml-0.5">{time}</span>
      </span>
      <span className="absolute top-2.5 right-3 opacity-75">{iso}</span>
      <span className="absolute bottom-2.5 left-3 opacity-90">{coords}</span>
      {plate && <span className="absolute bottom-2.5 right-3 opacity-75">{plate}</span>}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 opacity-50">
        <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/80" />
        <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/80" />
        <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/80" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/80" />
      </span>
    </div>
  );
}

/** White taped print holding dusk-graded scenery. */
function FilmPrint({
  src,
  alt,
  fig,
  sub,
  tint = "gt-tint-italy",
  rotate = "-rotate-2",
  tapePos = "left-6 -rotate-6",
  aspect = "aspect-[4/3]",
  chrome,
  prism = false,
  sizes = "(max-width: 768px) 92vw, 620px",
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  fig: string;
  sub: string;
  tint?: string;
  rotate?: string;
  tapePos?: string;
  aspect?: string;
  chrome?: React.ReactNode;
  prism?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`relative gt-print ${rotate} w-full ${className}`}
    >
      <Tape className={`-top-3 ${tapePos}`} />
      <div
        className={`relative ${aspect} w-full gt-photo-well gt-scenic ${tint} ${
          prism ? "gt-prism-fringe" : ""
        }`}
      >
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
        {prism && <div aria-hidden className="gt-prism" />}
        <div aria-hidden className="absolute inset-[-8%] z-[5] gt-grain gt-grain-anim opacity-70 pointer-events-none" />
        {chrome}
      </div>
      <figcaption className="pt-2.5 px-1 flex items-baseline justify-between gap-3 text-[10px] sm:text-[11px] font-mono text-[#0F1E33]">
        <span className="font-semibold tracking-[0.14em] uppercase">{fig}</span>
        <span className="text-[#5B6B82] italic font-serif text-xs sm:text-sm tracking-normal normal-case text-right">
          {sub}
        </span>
      </figcaption>
    </motion.figure>
  );
}

/** Small square polaroid — the sharp souvenir. */
function FoodPolaroid({
  src,
  alt,
  caption,
  stamp,
  className = "",
  rotate = "rotate-3",
  tint = "",
  delay = 0.2,
}: {
  src: string;
  alt: string;
  caption: string;
  stamp?: string;
  className?: string;
  rotate?: string;
  tint?: string;
  delay?: number;
}) {
  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.9, y: 16 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`gt-print ${rotate} z-20 ${className}`}
    >
      <Tape className="-top-2.5 left-1/2 -translate-x-1/2 rotate-2 !w-14 !h-[18px]" />
      <div className={`relative aspect-square w-full gt-photo-well gt-food ${tint}`}>
        <Image src={src} alt={alt} fill sizes="240px" className="object-cover" />
        <div aria-hidden className="absolute inset-[-8%] z-[5] gt-grain opacity-40 pointer-events-none" />
        {stamp && (
          <span className="absolute bottom-1.5 left-1.5 z-10 px-1.5 py-0.5 bg-[#FFFDF6]/95 border border-[#0F1E33]/25 rounded-[2px] font-mono text-[8px] sm:text-[9px] tracking-[0.14em] text-[#0F1E33] font-semibold uppercase">
            {stamp}
          </span>
        )}
      </div>
      <figcaption className="pt-1.5 text-center font-serif italic text-[11px] sm:text-xs text-[#475569]">
        {caption}
      </figcaption>
    </motion.figure>
  );
}

/** Perforated travel ticket — every feature ships as one. */
function TravelTicket({
  title,
  route,
  rows,
  stampText,
  rotate = "-rotate-1",
  notch = "62%",
  className = "",
}: {
  title: string;
  route: string;
  rows: [string, string, string?][];
  stampText: string;
  rotate?: string;
  notch?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`gt-ticket-wrap ${rotate} ${className}`}
    >
      <div className="gt-ticket rounded-lg" style={{ "--notch": notch } as React.CSSProperties}>
        <div className="flex items-center justify-between gap-4 px-4 pt-3 pb-2 border-b border-[#0F1E33]/10">
          <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-[#5B6B82] uppercase">
            {title}
          </span>
          <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] font-bold text-[#0F1E33]">
            {route}
          </span>
        </div>
        <div className="px-4 py-2.5 space-y-1.5 font-mono text-[11px] text-[#0F1E33]">
          {rows.map(([k, v, c]) => (
            <div key={k} className="flex justify-between gap-6">
              <span className="text-[#5B6B82]">{k}</span>
              <span className={`font-semibold text-right ${c ?? ""}`}>{v}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-dashed border-[#0F1E33]/25 px-4 py-2.5 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[3px] bg-[#0F1E33] text-[#FAF7F0] font-mono text-[8px] sm:text-[9px] tracking-[0.18em] uppercase">
            <Stamp className="w-3 h-3" /> {stampText}
          </span>
          <span aria-hidden className="gt-barcode h-6 w-20 sm:w-24 text-[#0F1E33]/80" />
        </div>
      </div>
    </motion.div>
  );
}

/** Faint monument line-engraving — place without breaking the haze. */
function Engraving({
  variant,
  className = "",
}: {
  variant: "castle" | "arch" | "dome" | "lattice";
  className?: string;
}) {
  const g = { fill: "none", stroke: INK, strokeWidth: 1.5, strokeLinecap: "round" as const };
  return (
    <div aria-hidden className={`absolute pointer-events-none opacity-[0.07] ${className}`}>
      {variant === "castle" && (
        <svg viewBox="0 0 200 260" className="w-full h-auto">
          <g {...g}>
            <path d="M60 250 V62 h12 v10 h14 v-10 h14 v10 h14 v-10 h14 v10 h14 v-10 h12 V250" />
            <path d="M88 250 v-32 a12 13 0 0 1 24 0 v32" />
            <path d="M78 100 v20 M100 94 v26 M122 100 v20" />
            <path d="M78 156 v18 M122 156 v18" />
            <path d="M60 140 h80 M60 196 h80" />
            <path d="M20 250 h160" />
            <path d="M28 258 h34 M84 258 h44 M148 258 h26" />
          </g>
        </svg>
      )}
      {variant === "arch" && (
        <svg viewBox="0 0 280 200" className="w-full h-auto">
          <g {...g}>
            <path d="M30 190 v-40 a22 22 0 0 1 44 0 v40" />
            <path d="M104 190 v-40 a22 22 0 0 1 44 0 v40" />
            <path d="M178 190 v-40 a22 22 0 0 1 44 0 v40" />
            <path d="M18 132 h244 M18 124 h244" />
            <path d="M41 124 v-20 a16 16 0 0 1 32 0 v20" />
            <path d="M115 124 v-20 a16 16 0 0 1 32 0 v20" />
            <path d="M189 124 v-20 a16 16 0 0 1 32 0 v20" />
            <path d="M18 84 h244 M26 76 h228" />
            <path d="M10 190 h260" />
          </g>
        </svg>
      )}
      {variant === "dome" && (
        <svg viewBox="0 0 200 230" className="w-full h-auto">
          <g {...g}>
            <path d="M45 120 a55 55 0 0 1 110 0" />
            <path d="M100 65 v-16 M91 57 h18" />
            <path d="M69 76 q-10 20 -10 44 M100 66 v54 M131 76 q10 20 10 44" />
            <path d="M40 120 h120" />
            <path d="M48 120 v90 M152 120 v90 M40 210 h120" />
            <path d="M88 210 v-28 a12 12 0 0 1 24 0 v28" />
            <path d="M60 144 h16 v22 h-16 z M124 144 h16 v22 h-16 z" />
          </g>
        </svg>
      )}
      {variant === "lattice" && (
        <svg viewBox="0 0 240 260" className="w-full h-auto">
          <g {...g}>
            <path d="M12 32 q54 -22 108 -22 q54 0 108 22" />
            <rect x="12" y="32" width="216" height="218" />
            {Array.from({ length: 5 }).map((_, r) =>
              Array.from({ length: 4 }).map((_, c) => {
                const x = 30 + c * 48;
                const y = 84 + r * 40;
                return (
                  <path
                    key={`${r}-${c}`}
                    d={`M${x} ${y} v-14 q0 -11 14 -11 q14 0 14 11 v14 z`}
                  />
                );
              })
            )}
          </g>
        </svg>
      )}
    </div>
  );
}

/** Running editorial header — hairline, folio number. */
function SectionRule({
  left,
  right,
  className = "",
}: {
  left: string;
  right: string;
  className?: string;
}) {
  return (
    <div className={`max-w-6xl mx-auto px-4 sm:px-6 ${className}`}>
      <div className="flex items-end justify-between gap-4 border-b border-[#0F1E33]/12 pb-2 font-mono text-[9px] sm:text-[10px] tracking-[0.22em] text-[#5B6B82] uppercase">
        <span>{left}</span>
        <span className="text-right shrink-0">{right}</span>
      </div>
    </div>
  );
}

/* ================================================================
   HERO — the map cover
   ================================================================ */

function Hero() {
  const { scrollY } = useScroll();
  const topoY = useTransform(scrollY, [0, 900], [0, -110]);
  return (
    <section className="relative pt-32 sm:pt-40 pb-10 px-4 sm:px-6 overflow-hidden">
      {/* parallax map engraving */}
      <motion.div
        aria-hidden
        style={{ y: topoY }}
        className="absolute inset-x-0 -top-20 h-[130%] gt-topo pointer-events-none"
      />
      {/* margin furniture */}
      <span
        aria-hidden
        className="hidden xl:block absolute left-7 top-[30rem] font-mono text-[9px] tracking-[0.34em] text-[#5B6B82]/80 [writing-mode:vertical-rl]"
      >
        VOL. II — SHOT ON THE ROAD, 2003 STOCK
      </span>
      <span
        aria-hidden
        className="hidden xl:block absolute right-7 top-[30rem] font-mono text-[9px] tracking-[0.34em] text-[#5B6B82]/80 [writing-mode:vertical-rl]"
      >
        FIG. 00 — COVER PLATE // 0.0 PPM LOCK
      </span>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-[#0F1E33]/12 shadow-sm font-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-[#0F1E33]"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 gt-rec" />
            REC — THE GRAND TOUR, VOL. II
            <span className="text-[#5B6B82] hidden sm:inline">· ONE VAN · FOUR COUNTRIES · EVERY DINNER</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 font-serif text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-[4.75rem] tracking-tight text-[#0F1E33]"
          >
            Eat like you <span className="italic text-[#C2410C]">live</span> everywhere.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 text-sm sm:text-lg text-[#475569] font-light max-w-2xl mx-auto leading-relaxed"
          >
            One long drive — Irish storm, Dolomite dawn, Aegean noon, a Jaipur family
            table — and dinner simply knew. Pantry, portions and allergies packed,
            synced, riding shotgun the whole way.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.34 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0F1E33] hover:bg-[#C2410C] text-[#FAF7F0] text-sm font-semibold shadow-lg transition-colors active:scale-95"
            >
              Begin the tour <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#mile-ireland"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white border border-[#0F1E33]/15 text-sm font-semibold text-[#0F1E33] hover:border-[#0F1E33]/40 transition-colors"
            >
              <MapPin className="w-4 h-4" /> Follow the route
            </a>
          </motion.div>

          <p className="mt-5 font-mono text-[9px] sm:text-[11px] tracking-[0.18em] text-[#5B6B82]">
            DEP 53°55′N MOHER · VIA 46°29′N GIAU · 36°39′N OIA · 26°91′N JAIPUR · ARR HOME 19:15
          </p>
        </div>

        {/* the cover plate — one wide film print, artifacts taped over it */}
        <div className="relative mt-14 sm:mt-16 mb-16 sm:mb-24">
          <FilmPrint
            src={U("photo-1469854523086-cc02fe5d8800", 1800)}
            alt="Camper van on an open dusk road"
            fig="PLATE 00 // THE ROAD OUT"
            sub="day one — everything we need is in the back"
            rotate="-rotate-1"
            tapePos="left-10 -rotate-6"
            aspect="aspect-[16/10] sm:aspect-[21/9]"
            prism
            priority
            sizes="(max-width: 768px) 96vw, 1152px"
            chrome={
              <CamChrome
                time="00:06:04"
                iso="ISO 800 · 24 FPS"
                coords="46°29′N — SOMEWHERE PAST THE BORDER"
                plate="AWB ● AUTO"
              />
            }
          />
          <Tape className="-top-3 right-10 rotate-6 hidden sm:block" />

          <PassportStamp
            icon={Compass}
            top="Grand Tour"
            bottom="Vol. II"
            className="absolute -top-8 left-1/2 -translate-x-[10rem] sm:-translate-x-0 sm:left-24 z-30 hidden sm:flex"
          />

          <FoodPolaroid
            src={U("photo-1547592166-23ac45744acd", 600)}
            alt="Hearty stew in a dark bowl"
            caption="first pot of the trip"
            stamp="SHARP SOUVENIR"
            className="absolute w-32 sm:w-44 -bottom-10 left-2 sm:left-8"
            rotate="-rotate-6"
            tint="gt-tint-ireland"
            delay={0.35}
          />

          <div className="absolute -bottom-12 right-2 sm:right-8 w-[280px] sm:w-[310px] hidden md:block z-30">
            <TravelTicket
              title="Boarding Pass"
              route="HOME → HOME"
              rows={[
                ["Traveller", "you + the van"],
                ["Pantry", "synced · auto-deduct", "text-[#047857]"],
                ["Allergens", "locked · 0.0 ppm"],
              ]}
              stampText="ALL MILES"
              rotate="rotate-2"
              notch="58%"
            />
          </div>
        </div>

        <p className="text-center font-serif italic text-sm sm:text-base text-[#5B6B82] -mt-2">
          — day 62. nobody asked “what’s for dinner.” not once. —
        </p>
      </div>
    </section>
  );
}

/* ================================================================
   TICKER — proof marquee
   ================================================================ */

const TICKER_ITEMS = [
  "MEALS PLANNED 128,400",
  "PANTRY AUTO-DEDUCT ACTIVE",
  "HOURS RECLAIMED 18,200",
  "16 CUISINES ON ROUTE",
  "ALLERGEN LOCK 0.0 PPM",
  "WASTE SAVED 6.4 T",
  "PORTIONS 1P → 6P",
];

function Ticker() {
  return (
    <div className="border-y border-[#0F1E33]/12 bg-white/70 backdrop-blur overflow-hidden">
      <div className="gt-marquee-track flex whitespace-nowrap py-3 font-mono text-[10px] sm:text-[11px] tracking-[0.18em] text-[#0F1E33] w-max">
        {[0, 1].map((k) => (
          <span key={k} className="flex gap-10 pr-10" aria-hidden={k === 1}>
            {TICKER_ITEMS.map((t) => (
              <span key={t} className="flex items-center gap-10">
                <span className="text-[#C2410C]">✦</span>
                {t}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   MILES — the four chapters on a drawn route
   ================================================================ */

type Mile = {
  id: string;
  n: string;
  country: string;
  plate: string;
  coords: string;
  kicker: string;
  headline: React.ReactNode;
  deck: string;
  notes: { lead: string; rest: string }[];
  scenic: { src: string; alt: string; fig: string; sub: string; time: string; iso: string };
  food: { src: string; alt: string; caption: string; stamp: string };
  food2?: { src: string; alt: string; caption: string; stamp: string };
  ticket: { title: string; route: string; rows: [string, string, string?][]; stampText: string };
  tint: string;
  engraving: "castle" | "arch" | "dome" | "lattice";
  passport: { icon: React.ElementType; top: string; bottom: string };
  flip?: boolean;
};

const MILES: Mile[] = [
  {
    id: "mile-ireland",
    n: "01",
    country: "IRELAND",
    plate: "PLATE NO. 02",
    coords: "53°55′N — CLIFFS OF MOHER",
    kicker: "IRELAND — THE TREK LEG",
    headline: (
      <>
        Storm on the glass. <span className="italic text-[#C2410C]">Stew on the stove.</span>
      </>
    ),
    deck: "Rain hammering the van roof, fog swallowing the cliff path, the harbor town shutting early below. None of it matters — tonight’s pot was planned before you left, from what’s already aboard.",
    notes: [
      {
        lead: "Pantry rides shotgun",
        rest: "— the plan cooks from what you packed, and deducts it as you eat.",
      },
      {
        lead: "Zero store runs",
        rest: "— no wet dash to a closed village shop. The stew was always in the plan.",
      },
      {
        lead: "Trek-day portions",
        rest: "— colder, steeper days scale the pot up before you feel the difference.",
      },
    ],
    scenic: {
      src: U("photo-1506905925346-21bda4d32df4", 1200),
      alt: "Misty green cliffs in fog",
      fig: "FIG. 03 // GREEN HAZE",
      sub: "the cliff road, day 4",
      time: "09:41",
      iso: "ISO 800",
    },
    food: {
      src: U("photo-1547592166-23ac45744acd", 600),
      alt: "Hearty one-pot stew",
      caption: "cliff stew, still warming",
      stamp: "0 RUNS IN THE RAIN",
    },
    ticket: {
      title: "Rain Pass · Coastal Van",
      route: "DUB → MOHER",
      rows: [
        ["Grocery runs", "0 in the storm"],
        ["Pot", "one · 22 min"],
        ["Pantry after", "auto-deducted", "text-[#047857]"],
      ],
      stampText: "HEARTY / HOT",
    },
    tint: "gt-tint-ireland",
    engraving: "castle",
    passport: { icon: Castle, top: "Éire", bottom: "Mile 01" },
  },
  {
    id: "mile-italy",
    n: "02",
    country: "ITALIA",
    plate: "PLATE NO. 03",
    coords: "46°29′N — PASSO GIAU → TUSCANY",
    kicker: "ITALY — THE CLIMB LEG",
    headline: (
      <>
        Climb on carbs. <span className="italic text-[#C2410C]">Descend on Tuscany.</span>
      </>
    ),
    deck: "Out at dawn for the pass, freewheeling into a farmhouse dusk. The day’s effort writes the menu — more on the plate the morning you climb, protein waiting at the table the night you recover.",
    notes: [
      {
        lead: "Macros follow the ride",
        rest: "— 68g of carbs load before the pass, 52g of protein waits at the bottom.",
      },
      {
        lead: "1P → 6P at the table",
        rest: "— the riders you met on the climb? The pot rescales while you shower.",
      },
      {
        lead: "Cuisine set to place",
        rest: "— Tuscan tonight, coastal salmon tomorrow. Same pantry, different country.",
      },
    ],
    scenic: {
      src: U("photo-1464822759023-fed622ff2c3b", 1200),
      alt: "Alpine peaks in first light",
      fig: "FIG. 04 // THE PASS",
      sub: "Passo Giau, first light",
      time: "06:12",
      iso: "ISO 800",
    },
    food: {
      src: U("photo-1598515214211-89d3c73ae83b", 600),
      alt: "Tuscan roast chicken plate",
      caption: "farmhouse chicken, night 12",
      stamp: "52G PROTEIN",
    },
    food2: {
      src: U("photo-1467003909585-2f8a72700288", 500),
      alt: "Coastal salmon plate",
      caption: "coast salmon, night 13",
      stamp: "ON PLAN",
    },
    ticket: {
      title: "Giro Pass · Ride + Table",
      route: "GIAU → SIENA",
      rows: [
        ["Carbs, ride morning", "68 g"],
        ["Protein, recovery", "52 g"],
        ["Table setting", "1P → 6P"],
      ],
      stampText: "FUELLED, NOT STUFFED",
    },
    tint: "gt-tint-italy",
    engraving: "arch",
    passport: { icon: Landmark, top: "Italia", bottom: "Mile 02" },
    flip: true,
  },
  {
    id: "mile-greece",
    n: "03",
    country: "HELLAS",
    plate: "PLATE NO. 04",
    coords: "36°39′N — OIA, SANTORINI",
    kicker: "GREECE — THE PICNIC LEG",
    headline: (
      <>
        Pack light. <span className="italic text-[#C2410C]">Eat golden.</span>
      </>
    ),
    deck: "A blanket on warm stone, ferry horn somewhere below, everything white and blue. Lunch came out of one paper bag — light enough for the heat, safe for the one of you who can’t touch nuts.",
    notes: [
      {
        lead: "Built to travel",
        rest: "— a 390 kcal mezze that survives a ferry crossing without a cooler.",
      },
      {
        lead: "Allergy lock",
        rest: "— nut-free stays nut-free in every suggestion. 0.0 ppm, non-negotiable.",
      },
      {
        lead: "Light diets, real joy",
        rest: "— coastal Mediterranean tuned down in weight, never in flavor.",
      },
    ],
    scenic: {
      src: U("photo-1613395877344-13d4a8e0d49e", 1200),
      alt: "White Santorini houses over blue sea",
      fig: "FIG. 05 // AEGEAN NOON",
      sub: "Oia, from the blanket",
      time: "13:05",
      iso: "ISO 200",
    },
    food: {
      src: U("photo-1540189549336-e6e99c3679fe", 600),
      alt: "Bright packable mezze bowl",
      caption: "the paper-bag mezze",
      stamp: "390 KCAL PACKED",
    },
    ticket: {
      title: "Ferry Pass · Deck Seat",
      route: "OIA → NAXOS",
      rows: [
        ["Pack weight", "one bag"],
        ["Allergens", "0.0 ppm", "text-[#047857]"],
        ["Ice packs", "none needed"],
      ],
      stampText: "SEA-PROOF LUNCH",
    },
    tint: "gt-tint-greece",
    engraving: "dome",
    passport: { icon: Waves, top: "Hellas", bottom: "Mile 03" },
  },
  {
    id: "mile-india",
    n: "04",
    country: "BHARAT",
    plate: "PLATE NO. 05",
    coords: "26°91′N — JAIPUR, VIA THE MIST",
    kicker: "INDIA — THE FAMILY LEG",
    headline: (
      <>
        Six plates. <span className="italic text-[#C2410C]">One calm cook.</span>
      </>
    ),
    deck: "Himalayan mist in the morning, the pink city by evening, and a table that keeps gaining chairs. Grandmother eats Jain, the kids want seconds — and nobody is doing math at the stove.",
    notes: [
      {
        lead: "Family scaling",
        rest: "— 1P to 6P and the spice curve scales with it. Heat stays right, never ×6.",
      },
      {
        lead: "16 cuisines deep",
        rest: "— regional Indian included, veg and Jain toggles on the same pot.",
      },
      {
        lead: "Medical-aware",
        rest: "— sugar, dairy and nut flags respected on every plate at the table.",
      },
    ],
    scenic: {
      src: U("photo-1544735716-392fe2489ffa", 1200),
      alt: "Himalayan ridges in morning mist",
      fig: "FIG. 06 // MIST RIDGE",
      sub: "the foothills, day 51",
      time: "06:48",
      iso: "ISO 800",
    },
    food: {
      src: U("photo-1585937421612-70a008356fbe", 600),
      alt: "Turmeric curry bowls",
      caption: "turmeric night, all six of us",
      stamp: "1P → 6P",
    },
    ticket: {
      title: "Family Pass · Six Seats",
      route: "MIST → JAIPUR",
      rows: [
        ["Portions", "1P → 6P"],
        ["Veg / Jain", "both · one pot"],
        ["Math at the stove", "zero"],
      ],
      stampText: "EVERYONE FED",
    },
    tint: "gt-tint-india",
    engraving: "lattice",
    passport: { icon: Flame, top: "Bharat", bottom: "Mile 04" },
    flip: true,
  },
];

function MileSpread(m: Mile) {
  return (
    <section id={m.id} className="relative scroll-mt-28">
      <SectionRule left={`MILE ${m.n} // ${m.country}`} right={m.plate} className="pt-16 sm:pt-20" />

      {/* mile medallion on the route rail */}
      <motion.div
        aria-hidden
        initial={{ scale: 0, rotate: -30 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="hidden lg:flex absolute left-10 top-40 -translate-x-1/2 z-10 w-10 h-10 rounded-full bg-[#FFFDF6] border border-[#0F1E33]/25 shadow-md items-center justify-center font-mono text-[11px] font-bold text-[#0F1E33]"
      >
        {m.n}
      </motion.div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-16 sm:pb-20">
        <Engraving
          variant={m.engraving}
          className={`top-4 w-52 sm:w-64 hidden md:block ${m.flip ? "left-4" : "right-4"}`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* editorial column */}
          <div className={`lg:col-span-5 relative ${m.flip ? "lg:order-2" : ""}`}>
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full gt-stamp font-mono text-[9px] sm:text-[10px] text-[#0F1E33]">
                <MapPin className="w-3 h-3" /> {m.coords}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full gt-stamp font-mono text-[9px] sm:text-[10px] text-[#5B6B82]">
                <Camera className="w-3 h-3" /> SHOT {m.scenic.time}
              </span>
            </div>
            <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.24em] text-[#C2410C] mb-3">
              {m.kicker}
            </p>
            <h2 className="font-serif text-3xl sm:text-[2.75rem] leading-[1.08] tracking-tight text-[#0F1E33]">
              {m.headline}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#475569] font-light leading-relaxed max-w-lg">
              {m.deck}
            </p>
            <ul className="mt-6 space-y-3">
              {m.notes.map((n) => (
                <li key={n.lead} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 w-5 h-5 rounded-[4px] bg-[#0F1E33] text-[#FAF7F0] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="leading-relaxed text-[#475569] font-light">
                    <span className="font-medium text-[#0F1E33]">{n.lead}</span> {n.rest}
                  </span>
                </li>
              ))}
            </ul>
            <TravelTicket className="mt-8 max-w-sm" {...m.ticket} rotate={m.flip ? "rotate-1" : "-rotate-1"} />
          </div>

          {/* collage column */}
          <div className={`lg:col-span-7 relative px-1 sm:px-6 pb-16 ${m.flip ? "lg:order-1" : ""}`}>
            <FilmPrint
              src={m.scenic.src}
              alt={m.scenic.alt}
              fig={m.scenic.fig}
              sub={m.scenic.sub}
              tint={m.tint}
              rotate={m.flip ? "rotate-2" : "-rotate-2"}
              tapePos={m.flip ? "right-6 rotate-6" : "left-6 -rotate-6"}
              chrome={<CamChrome time={m.scenic.time} iso={m.scenic.iso} coords={m.coords} />}
            />
            <FoodPolaroid
              src={m.food.src}
              alt={m.food.alt}
              caption={m.food.caption}
              stamp={m.food.stamp}
              tint={m.tint}
              rotate={m.flip ? "-rotate-3" : "rotate-3"}
              className={`absolute w-36 sm:w-48 -bottom-6 ${m.flip ? "left-2 sm:left-8" : "right-2 sm:right-8"}`}
            />
            {m.food2 && (
              <FoodPolaroid
                src={m.food2.src}
                alt={m.food2.alt}
                caption={m.food2.caption}
                stamp={m.food2.stamp}
                tint={m.tint}
                rotate="rotate-6"
                delay={0.32}
                className={`absolute w-28 sm:w-36 -bottom-10 hidden md:block ${m.flip ? "right-10" : "left-10"}`}
              />
            )}
            <PassportStamp
              icon={m.passport.icon}
              top={m.passport.top}
              bottom={m.passport.bottom}
              className={`absolute -top-9 z-30 hidden sm:flex ${m.flip ? "left-10" : "right-10"}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Route rail that draws itself as you drive down the page. */
function MilesJourney({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.85"] });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.4 });
  const markerTop = useTransform(progress, (v) => `${Math.min(1, Math.max(0, v)) * 100}%`);
  return (
    <div ref={ref} className="relative">
      <div aria-hidden className="hidden lg:block absolute left-10 top-0 bottom-0 w-[2px] gt-route-ghost" />
      <motion.div
        aria-hidden
        style={{ scaleY: progress }}
        className="hidden lg:block absolute left-10 top-0 bottom-0 w-[2px] gt-route-line origin-top"
      />
      <motion.div
        aria-hidden
        style={{ top: markerTop }}
        className="hidden lg:flex absolute left-10 -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#0F1E33] text-[#FAF7F0] items-center justify-center shadow-lg border-2 border-[#FAF7F0]"
      >
        <Navigation2 className="w-3.5 h-3.5 rotate-180" />
      </motion.div>
      {children}
    </div>
  );
}

/* ================================================================
   POSTCARDS — breadth without breaking the film
   ================================================================ */

const POSTCARDS = [
  {
    s: U("photo-1506744038136-46273834b3fb", 700),
    f: U("photo-1504674900247-0877df9cc836", 400),
    sc: "HIGHLANDS",
    fc: "venison pie, dusk",
    coords: "57°N",
    tint: "gt-tint-ireland",
  },
  {
    s: U("photo-1507525428034-b723cf961d3e", 700),
    f: U("photo-1512621776951-a57141f2eefd", 400),
    sc: "CÔTE D’AZUR",
    fc: "market bowl, noon",
    coords: "43°N",
    tint: "gt-tint-greece",
  },
  {
    s: U("photo-1485965120184-e220f721d03e", 700),
    f: U("photo-1473093295043-cdd812d0e601", 400),
    sc: "PROVENCE",
    fc: "roadside al limone",
    coords: "43°42′N",
    tint: "gt-tint-italy",
  },
  {
    s: U("photo-1599661046289-e31897846e41", 700),
    f: U("photo-1490645935967-10de6ba17061", 400),
    sc: "AMALFI",
    fc: "citrus morning",
    coords: "40°38′N",
    tint: "gt-tint-italy",
  },
];

function Postcards() {
  return (
    <section id="postcards" className="relative bg-[#F5F3EC]/70 border-y border-[#0F1E33]/10 scroll-mt-28">
      <SectionRule left="INTERMISSION // POSTCARDS" right="PLATE NO. 06" className="pt-16 sm:pt-20" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pb-20">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-[#C2410C]" />
          <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.24em] text-[#C2410C]">
            SENT FROM THE ROAD, NEVER MAILED
          </p>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl tracking-tight text-[#0F1E33]">
          Four more stamps, <span className="italic text-[#C2410C]">same film.</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#475569] font-light max-w-xl">
          Wherever the van points next, the grade holds: scenery stays the blurry dream,
          dinner stays the sharp souvenir.
        </p>

        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {POSTCARDS.map((c, i) => (
            <motion.div
              key={c.sc}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={`relative gt-print ${i % 2 ? "rotate-1" : "-rotate-1"}`}
            >
              <Tape className="-top-3 left-1/2 -translate-x-1/2 !w-14 !h-[18px]" />
              <div className={`relative aspect-[4/3] gt-photo-well gt-scenic ${c.tint}`}>
                <Image src={c.s} alt={c.sc} fill sizes="300px" className="object-cover" />
                <div aria-hidden className="absolute inset-[-8%] z-[5] gt-grain opacity-60 pointer-events-none" />
                <span className="absolute bottom-2 left-2.5 z-10 font-mono text-[8px] tracking-[0.2em] gt-chrome">
                  {c.coords}
                </span>
              </div>
              <div className="flex items-center gap-2.5 mt-2 px-0.5">
                <div className={`relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 gt-photo-well gt-food rounded-[2px] ${c.tint}`}>
                  <Image src={c.f} alt={c.fc} fill sizes="120px" className="object-cover" />
                </div>
                <div className="font-mono text-[9px] leading-relaxed min-w-0">
                  <p className="font-bold tracking-[0.16em] text-[#0F1E33]">{c.sc}</p>
                  <p className="text-[#5B6B82] truncate font-serif italic text-[11px] tracking-normal">{c.fc}</p>
                </div>
                <div
                  aria-hidden
                  className="ml-auto w-10 h-10 shrink-0 rounded-full border border-[#0F1E33]/30 hidden sm:flex flex-col items-center justify-center font-mono text-[6px] tracking-[0.12em] text-[#0F1E33]/55 -rotate-12 leading-tight"
                >
                  <span>POSTE</span>
                  <span>·2003·</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* surprise-me artifact */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="mt-12 flex justify-center"
        >
          <div className="gt-ticket-wrap rotate-1 max-w-lg">
            <div className="gt-ticket rounded-lg px-5 py-4 flex items-center gap-4" style={{ "--notch": "50%" } as React.CSSProperties}>
              <span className="w-10 h-10 rounded-full bg-[#0F1E33] text-[#FAF7F0] flex items-center justify-center shrink-0">
                <Dices className="w-5 h-5" />
              </span>
              <div>
                <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-[#C2410C]">
                  SURPRISE ME — SINGLE-MEAL RE-ROLL
                </p>
                <p className="text-sm text-[#475569] font-light mt-0.5">
                  Tonight looks boring? One tap re-deals the dish. The rest of the week doesn’t move.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================
   TRIP METER — running totals (the only dark panel before home)
   ================================================================ */

const METER = [
  { label: "MEALS PLANNED", value: 128400, sub: "plated across 16 cuisines" },
  { label: "HOURS RECLAIMED", value: 18200, sub: "not spent deciding" },
  { label: "STORE RUNS SKIPPED", value: 41300, sub: "rain or otherwise" },
  { label: "WASTE SAVED", value: 6.4, decimals: 1, suffix: " T", sub: "eaten, not binned" },
];

function TripMeter() {
  return (
    <section className="relative">
      <SectionRule left="TRIP METER // RUNNING TOTALS" right="PLATE NO. 07" className="pt-16 sm:pt-20" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl bg-[#0B1E3A] border border-[#0F1E33]/20 shadow-[0_30px_70px_-24px_rgba(11,30,58,0.55)]"
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none mix-blend-screen"
            style={{
              background:
                "radial-gradient(70% 60% at 85% 10%, rgba(255,75,0,0.30), transparent 60%), radial-gradient(60% 55% at 8% 95%, rgba(0,194,255,0.22), transparent 60%)",
            }}
          />
          <div aria-hidden className="absolute inset-[-6%] gt-grain gt-grain-anim opacity-50 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between px-6 sm:px-10 py-3.5 border-b border-white/10 font-mono text-[9px] sm:text-[10px] tracking-[0.22em] text-[#8FA3C2]">
              <span className="flex items-center gap-2 text-[#FAF7F0]">
                <span className="w-2 h-2 rounded-full bg-red-500 gt-rec" /> TRIP B — ODOMETER
              </span>
              <span>SINCE VOL. I</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 px-6 sm:px-10 py-10 sm:py-12">
              {METER.map((mtr) => (
                <div key={mtr.label}>
                  <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.22em] text-[#8FA3C2]">
                    {mtr.label}
                  </p>
                  <p className="mt-2 font-mono text-3xl sm:text-4xl font-semibold text-[#FAF7F0]">
                    <CountUp to={mtr.value} decimals={mtr.decimals ?? 0} suffix={mtr.suffix ?? ""} />
                  </p>
                  <p className="mt-1.5 text-xs text-[#8FA3C2] font-light">{mtr.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================
   GUESTBOOK — signed at the table
   ================================================================ */

const GUESTBOOK = [
  {
    city: "GALWAY",
    time: "09:41",
    quote:
      "It rained for four days straight. We never once drove to a shop — the van pantry just kept being right.",
    name: "Aoife · trek leg",
    tag: "PANTRY SYNC",
  },
  {
    city: "TRENTO",
    time: "06:12",
    quote:
      "I set it to ride mornings. It fed the climb, then it fed the recovery. By day three I’d stopped thinking about food entirely.",
    name: "Marco & Lena · climb leg",
    tag: "MACROS ON PLAN",
  },
  {
    city: "JAIPUR",
    time: "19:15",
    quote:
      "Six of us, two diets, one pot. My mother-in-law checked the plate twice — then she asked for the plan.",
    name: "Priya’s table · family leg",
    tag: "1P→6P · JAIN",
  },
];

function Guestbook() {
  return (
    <section id="guestbook" className="relative scroll-mt-28">
      <SectionRule left="GUESTBOOK // SIGNED AT THE TABLE" right="PLATE NO. 08" className="pt-4" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-20 sm:pb-24">
        <h2 className="font-serif text-3xl sm:text-5xl tracking-tight text-[#0F1E33]">
          Strangers of the road, <span className="italic text-[#C2410C]">fed on time.</span>
        </h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {GUESTBOOK.map((c, i) => (
            <motion.figure
              key={c.city}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`gt-print ${i === 1 ? "rotate-1" : "-rotate-1"} flex flex-col`}
            >
              <Tape className={`-top-3 ${i === 1 ? "right-8 rotate-6" : "left-8 -rotate-6"}`} />
              <div className="rounded-[2px] bg-[#0B1E3A] px-3 py-2 flex items-center justify-between font-mono text-[8px] sm:text-[9px] tracking-[0.18em] gt-chrome">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 gt-rec" /> REC
                </span>
                <span>
                  {c.city} — {c.time}
                </span>
              </div>
              <blockquote className="px-1.5 pt-4 pb-4 font-serif italic text-[15px] leading-relaxed text-[#0F1E33] flex-1">
                “{c.quote}”
              </blockquote>
              <figcaption className="px-1.5 pb-1 flex items-center justify-between gap-2">
                <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.14em] text-[#5B6B82] uppercase">
                  {c.name}
                </span>
                <span className="px-2 py-0.5 rounded-full gt-stamp font-mono text-[8px] sm:text-[9px] text-[#0F1E33] shrink-0">
                  {c.tag}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   HEARTH — full-bleed dusk finale, the road ends at a table
   ================================================================ */

function Hearth() {
  return (
    <section id="hearth" className="relative border-y border-[#0F1E33]/12 scroll-mt-28">
      <div className="relative overflow-hidden gt-photo-well gt-scenic gt-tint-italy rounded-none">
        <Image
          src={U("photo-1556911220-e15b29be8c8f", 1900)}
          alt="A dim home kitchen at night, one lamp on"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-[-6%] z-[5] gt-grain gt-grain-anim opacity-70 pointer-events-none" />

        {/* camcorder chrome */}
        <div className="absolute inset-0 z-10 pointer-events-none font-mono text-[9px] sm:text-[10px] tracking-[0.2em] gt-chrome">
          <span className="absolute top-4 left-4 sm:left-6 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 gt-rec" /> REC 19:15
          </span>
          <span className="absolute top-4 right-4 sm:right-6 opacity-80">OCT 12 2003 · BATT ▮▮▮▯</span>
          <span className="absolute bottom-4 left-4 sm:left-6 opacity-90">MILE 3,842 — HOME</span>
          <span className="absolute bottom-4 right-4 sm:right-6 opacity-80">TAPE END</span>
        </div>

        {/* content */}
        <div className="relative z-20 max-w-3xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-mono text-[10px] sm:text-[11px] tracking-[0.28em] text-amber-200/90"
          >
            FINALE — THE HEARTH
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 font-serif text-4xl sm:text-6xl tracking-tight leading-[1.06] text-[#FAF7F0]"
          >
            Every road ends <span className="italic text-[#FBBF24]">at a table.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-5 text-sm sm:text-base text-[#C7D2E4] font-light leading-relaxed max-w-xl mx-auto"
          >
            Unpack the tour into one quiet kitchen. The pantry deducts itself as you eat,
            portions rescale to whoever showed up, allergens stay locked — and tomorrow
            is already packed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.28 }}
            className="mt-8 mx-auto max-w-sm gt-ticket-wrap rotate-1 text-left"
          >
            <div className="gt-ticket rounded-lg" style={{ "--notch": "56%" } as React.CSSProperties}>
              <div className="px-4 pt-3 pb-2 border-b border-[#0F1E33]/10 flex justify-between font-mono text-[9px] tracking-[0.2em] text-[#5B6B82] uppercase">
                <span>Hearth Pass</span>
                <span className="font-bold text-[#0F1E33]">ROAD → HOME</span>
              </div>
              <div className="px-4 py-2.5 space-y-1.5 font-mono text-[11px] text-[#0F1E33]">
                <div className="flex justify-between gap-6">
                  <span className="text-[#5B6B82]">Tonight</span>
                  <span className="font-semibold">salmon · 2P · 18 min</span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-[#5B6B82]">Pantry after</span>
                  <span className="font-semibold text-[#047857]">−200 g · synced</span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-[#5B6B82]">Tomorrow</span>
                  <span className="font-semibold">mezze · packed</span>
                </div>
              </div>
              <div className="border-t border-dashed border-[#0F1E33]/25 px-4 py-2.5 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[3px] bg-[#0F1E33] text-[#FAF7F0] font-mono text-[8px] tracking-[0.18em] uppercase">
                  <Stamp className="w-3 h-3" /> HOME, CALM, FED
                </span>
                <span aria-hidden className="gt-barcode h-6 w-20 text-[#0F1E33]/80" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.36 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#FAF7F0] text-[#0F1E33] hover:bg-[#FF4B00] hover:text-[#FAF7F0] text-sm font-semibold shadow-xl transition-colors active:scale-95"
            >
              Open your folio <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center px-7 py-3 rounded-full border border-[#FAF7F0]/40 text-[#FAF7F0] text-sm font-semibold hover:border-[#FAF7F0]/80 transition-colors"
            >
              Sign in
            </Link>
          </motion.div>

          <p className="mt-6 font-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-[#C7D2E4]/70">
            ★ 0.0 PPM LOCK // ZERO WASTE // SURPRISE ME LOADED ★
          </p>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   PAGE
   ================================================================ */

export function GrandTour() {
  return (
    <div className="gt-paper text-[#0F1E33] overflow-x-hidden">
      <Hero />
      <Ticker />
      <MilesJourney>
        {MILES.map((m) => (
          <MileSpread key={m.id} {...m} />
        ))}
      </MilesJourney>
      <Postcards />
      <TripMeter />
      <Guestbook />
      <Hearth />
    </div>
  );
}
