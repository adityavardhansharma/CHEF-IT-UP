"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_BRANDING } from "@/lib/branding";
import {
  ArrowRight,
  Sparkles,
  ChefHat,
  Apple,
  Carrot,
  Fish,
  Wheat,
  Egg,
  Leaf,
  Brain,
  Calendar,
  ShoppingBasket,
  Activity,
  Clock,
  Star,
  Check,
  Zap,
  ScanLine,
  Salad,
  Soup,
  UtensilsCrossed,
  TrendingUp,
  Shield,
  Heart,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0d12] text-slate-100 antialiased overflow-x-hidden">
      {/* Ambient background */}
      <BackgroundOrbs />

      <SiteHeader />

      <main className="relative">
        <Hero />
        <LogoStrip />
        <BrainMap />
        <BentoFeatures />
        <Flowchart />
        <Stats />
        <Testimonials />
        <Pricing />
        <FinalCTA />
      </main>

      <SiteFooter />
    </div>
  );
}

/* ---------------- Background ---------------- */

function BackgroundOrbs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-emerald-500/20 blur-[120px]" />
      <div className="absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-amber-400/10 blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-[120px]" />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

/* ---------------- Header ---------------- */

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0b0d12]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
            <ChefHat className="h-5 w-5 text-emerald-950" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-white">
              {APP_BRANDING.appFullName}
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-400">
              {APP_BRANDING.tagline}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#how" className="hover:text-white">How it works</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#testimonials" className="hover:text-white">Customers</a>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/sign-in">
            <Button
              variant="ghost"
              className="h-9 px-3 text-slate-200 hover:bg-white/5 hover:text-white"
            >
              Sign in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="group h-9 gap-1.5 rounded-lg bg-gradient-to-b from-emerald-400 to-emerald-600 px-3.5 font-medium text-emerald-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-300 hover:to-emerald-500">
              Try free
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 md:pt-24 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300 backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span>Now with SmartRecipe AI™ v2 — pantry-aware planning</span>
          </div>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
            Plan a delicious week
            <span className="relative ml-2 inline-block bg-gradient-to-r from-emerald-300 via-amber-200 to-emerald-300 bg-clip-text text-transparent">
              in a single click.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-slate-300 md:text-lg">
            {APP_BRANDING.appName} maps your pantry, taste, and schedule into a
            balanced 7‑day meal plan — with adaptive portions, smart shopping
            lists, and clear nutrition. No spreadsheets. No guessing.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/sign-up">
              <Button className="group h-12 gap-2 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 px-6 text-base font-semibold text-emerald-950 shadow-xl shadow-emerald-500/30 hover:from-emerald-300 hover:to-emerald-500">
                Start free for 14 days
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <a
              href="#how"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-slate-200 backdrop-blur hover:bg-white/[0.06]"
            >
              See how it works
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" /> No credit card
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" /> 50k+ recipes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" /> 4.9★ on the App Store
            </span>
          </div>
        </div>

        <div className="lg:col-span-6">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -inset-6 -z-10 rounded-[2.2rem] bg-gradient-to-br from-emerald-500/20 via-amber-300/10 to-sky-500/20 blur-2xl" />

      <div className="relative rounded-[1.8rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-3 shadow-2xl backdrop-blur-xl">
        <div className="rounded-[1.4rem] border border-white/10 bg-[#0e1118] p-5">
          {/* Window controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            </div>
            <div className="rounded-md border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-slate-400">
              this week
            </div>
          </div>

          {/* Today */}
          <div className="mt-5 flex items-start justify-between rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-emerald-500/0 p-4">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-widest text-emerald-300">
                Today · Wed
              </div>
              <div className="mt-1.5 text-lg font-semibold text-white">
                Miso‑glazed salmon bowl
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> 25m
                </span>
                <span>•</span>
                <span>420 kcal</span>
                <span>•</span>
                <span>Serves 2</span>
              </div>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-lg shadow-amber-500/30">
              <Fish className="h-6 w-6" strokeWidth={2.4} />
            </div>
          </div>

          {/* Macros */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Macro label="Protein" value="24g" pct={70} color="emerald" />
            <Macro label="Carbs" value="45g" pct={55} color="amber" />
            <Macro label="Fat" value="12g" pct={30} color="sky" />
          </div>

          {/* Week strip */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-widest text-slate-400">
              <span>Week of Apr 27</span>
              <span className="text-emerald-300">Balanced ✓</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {[
                { d: "M", icon: Salad, color: "emerald" },
                { d: "T", icon: Soup, color: "amber" },
                { d: "W", icon: Fish, color: "sky" },
                { d: "T", icon: UtensilsCrossed, color: "rose" },
                { d: "F", icon: Egg, color: "amber" },
                { d: "S", icon: Carrot, color: "emerald" },
                { d: "S", icon: Apple, color: "rose" },
              ].map((item, i) => (
                <DayChip key={i} day={item.d} Icon={item.icon} active={i === 2} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating side card – pantry */}
      <div className="absolute -left-6 -bottom-8 hidden w-56 rotate-[-3deg] rounded-2xl border border-white/10 bg-[#0e1118]/95 p-3.5 shadow-2xl backdrop-blur md:block">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-400">
          <ScanLine className="h-3.5 w-3.5 text-emerald-300" />
          SmartPantry™
        </div>
        <div className="mt-2 text-sm font-semibold text-white">3 items expiring</div>
        <div className="mt-2 space-y-1.5">
          <PantryRow Icon={Apple} name="Granny Smith" tag="2d" />
          <PantryRow Icon={Wheat} name="Sourdough" tag="3d" />
          <PantryRow Icon={Leaf} name="Basil" tag="1d" warn />
        </div>
      </div>

      {/* Floating side card – AI */}
      <div className="absolute -right-4 -top-8 hidden w-60 rotate-[3deg] rounded-2xl border border-white/10 bg-[#0e1118]/95 p-3.5 shadow-2xl backdrop-blur md:block">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-emerald-300">
          <Sparkles className="h-3.5 w-3.5" /> SmartRecipe AI™
        </div>
        <div className="mt-2 text-sm text-slate-200">
          “I noticed you have salmon and miso. Want a 25‑min bowl tonight?”
        </div>
        <div className="mt-2 flex gap-1.5">
          <span className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-200">
            Yes, plan it
          </span>
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
            Swap
          </span>
        </div>
      </div>
    </div>
  );
}

function Macro({ label, value, pct, color }: { label: string; value: string; pct: number; color: "emerald" | "amber" | "sky" }) {
  const ring = {
    emerald: "from-emerald-400 to-emerald-600",
    amber: "from-amber-300 to-amber-500",
    sky: "from-sky-400 to-sky-600",
  }[color];
  const text = {
    emerald: "text-emerald-300",
    amber: "text-amber-200",
    sky: "text-sky-300",
  }[color];
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
      <div className="text-[10px] uppercase tracking-widest text-slate-400">{label}</div>
      <div className={`mt-0.5 text-sm font-semibold ${text}`}>{value}</div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full bg-gradient-to-r ${ring}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DayChip({ day, Icon, active }: { day: string; Icon: any; active?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-lg border py-2 ${
        active
          ? "border-emerald-400/40 bg-emerald-400/10"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className={`text-[10px] font-semibold ${active ? "text-emerald-300" : "text-slate-400"}`}>{day}</div>
      <Icon className={`h-3.5 w-3.5 ${active ? "text-emerald-300" : "text-slate-300"}`} />
    </div>
  );
}

function PantryRow({ Icon, name, tag, warn }: { Icon: any; name: string; tag: string; warn?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.02] px-2 py-1.5 text-xs">
      <div className="flex items-center gap-1.5 text-slate-200">
        <Icon className="h-3.5 w-3.5 text-slate-300" />
        {name}
      </div>
      <span className={`rounded px-1.5 text-[10px] ${warn ? "bg-rose-500/15 text-rose-300" : "bg-amber-300/10 text-amber-200"}`}>
        {tag}
      </span>
    </div>
  );
}

/* ---------------- Logo strip ---------------- */

function LogoStrip() {
  return (
    <section className="border-y border-white/5 bg-white/[0.015]">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 md:flex-row md:justify-between">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
            Loved by home cooks at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-slate-400/90">
            {["FreshKitchen", "Verde Co.", "MealLab", "PantryHQ", "Bistronaut", "ChefStack"].map(
              (n) => (
                <span
                  key={n}
                  className="text-sm font-semibold tracking-tight opacity-70 transition hover:opacity-100"
                >
                  {n}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Brain Map ---------------- */

function BrainMap() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Inside the AI"
        title="A brain that thinks like a chef."
        description="SmartRecipe AI™ connects ingredients you already have to recipes, nutrition, taste, and time — to compose plans that feel custom-built for you."
      />

      <div className="mt-14 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="relative aspect-[5/4] w-full">
            <svg viewBox="0 0 600 480" className="h-full w-full">
              <defs>
                <radialGradient id="core" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#059669" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#022c22" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="link" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.0" />
                  <stop offset="50%" stopColor="#34d399" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* connector lines from outer nodes -> center */}
              {[
                [90, 90],
                [510, 80],
                [60, 250],
                [540, 250],
                [110, 410],
                [490, 410],
                [300, 50],
                [300, 440],
              ].map(([x, y], i) => (
                <line
                  key={i}
                  x1={x}
                  y1={y}
                  x2={300}
                  y2={240}
                  stroke="url(#link)"
                  strokeWidth="1.4"
                  strokeDasharray="3 5"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-16"
                    dur={`${2 + (i % 3)}s`}
                    repeatCount="indefinite"
                  />
                </line>
              ))}

              {/* Core glow */}
              <circle cx="300" cy="240" r="160" fill="url(#core)" />
              <circle
                cx="300"
                cy="240"
                r="78"
                fill="#0e1118"
                stroke="#34d39955"
                strokeWidth="1.5"
              />
              <circle
                cx="300"
                cy="240"
                r="60"
                fill="none"
                stroke="#34d399"
                strokeOpacity="0.3"
                strokeDasharray="2 4"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 300 240"
                  to="360 300 240"
                  dur="22s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>

            {/* Core label */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-300 to-emerald-600 shadow-2xl shadow-emerald-500/40">
                <Brain className="h-8 w-8 text-emerald-950" strokeWidth={2.2} />
              </div>
              <div className="mt-2 text-sm font-semibold text-white">SmartRecipe AI™</div>
              <div className="text-[11px] text-slate-400">The chef-brain</div>
            </div>

            {/* Node labels positioned over SVG */}
            <BrainNode x="6%"   y="14%" Icon={Apple}  label="Pantry"      tone="emerald" />
            <BrainNode x="80%"  y="10%" Icon={Heart}  label="Taste"       tone="rose" />
            <BrainNode x="0%"   y="48%" Icon={Activity} label="Nutrition" tone="sky" />
            <BrainNode x="86%"  y="48%" Icon={Calendar} label="Schedule"  tone="amber" />
            <BrainNode x="10%"  y="80%" Icon={ShoppingBasket} label="Budget" tone="emerald" />
            <BrainNode x="78%"  y="80%" Icon={Salad}  label="Goals"       tone="emerald" />
            <BrainNode x="46%"  y="2%"  Icon={Wheat}  label="Allergies"   tone="amber" />
            <BrainNode x="46%"  y="90%" Icon={Soup}   label="Cuisine"     tone="rose" />
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="space-y-4">
            <BrainPoint
              Icon={Apple}
              title="Pantry-aware reasoning"
              desc="Reads your SmartPantry™ first, then suggests meals that use what you already have."
              tone="emerald"
            />
            <BrainPoint
              Icon={Activity}
              title="Nutritional balance"
              desc="Tracks macros across the whole week — not just per meal — to keep you on target."
              tone="sky"
            />
            <BrainPoint
              Icon={Heart}
              title="Taste & habits"
              desc="Learns what you cook again and what gets swapped. The plan adapts every week."
              tone="rose"
            />
            <BrainPoint
              Icon={Calendar}
              title="Schedule fit"
              desc="Quick meals on busy nights, slow cooks on weekends — automatically sorted."
              tone="amber"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function BrainNode({
  x,
  y,
  Icon,
  label,
  tone,
}: {
  x: string;
  y: string;
  Icon: any;
  label: string;
  tone: "emerald" | "amber" | "sky" | "rose";
}) {
  const styles = {
    emerald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    amber: "border-amber-300/30 bg-amber-300/10 text-amber-100",
    sky: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    rose: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  }[tone];
  return (
    <div
      className="absolute"
      style={{ left: x, top: y }}
    >
      <div
        className={`flex items-center gap-2 rounded-full border ${styles} px-3 py-1.5 text-xs font-medium backdrop-blur shadow-lg shadow-black/30`}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
    </div>
  );
}

function BrainPoint({
  Icon,
  title,
  desc,
  tone,
}: {
  Icon: any;
  title: string;
  desc: string;
  tone: "emerald" | "amber" | "sky" | "rose";
}) {
  const styles = {
    emerald: "from-emerald-400/20 to-emerald-500/0 text-emerald-300",
    amber: "from-amber-300/20 to-amber-400/0 text-amber-200",
    sky: "from-sky-400/20 to-sky-500/0 text-sky-300",
    rose: "from-rose-400/20 to-rose-500/0 text-rose-300",
  }[tone];
  return (
    <div className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]">
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${styles} ring-1 ring-white/10`}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="mt-1 text-sm text-slate-400">{desc}</div>
      </div>
    </div>
  );
}

/* ---------------- Bento features ---------------- */

function BentoFeatures() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Features"
        title="Built end-to-end for your kitchen."
        description="Every part of meal planning, intentionally designed — and stitched together so you stop tab-juggling."
      />

      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[180px]">
        {/* Big card */}
        <BentoCard className="md:col-span-4 md:row-span-2 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent">
          <div className="flex h-full flex-col justify-between">
            <div>
              <BentoTag tone="emerald" Icon={Sparkles}>SmartRecipe AI™</BentoTag>
              <h3 className="mt-4 text-2xl font-semibold leading-tight text-white">
                Generate a complete week in seconds — then tweak anything.
              </h3>
              <p className="mt-3 max-w-md text-sm text-slate-300">
                Drag to rearrange, swap a meal with one click, or regenerate
                just one day. Your plan stays balanced as you edit.
              </p>
            </div>

            {/* Mini timeline */}
            <div className="mt-6 grid grid-cols-7 gap-2">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => (
                <div
                  key={d}
                  className={`rounded-xl border ${
                    i === 2
                      ? "border-emerald-400/40 bg-emerald-400/10"
                      : "border-white/10 bg-white/[0.02]"
                  } p-2`}
                >
                  <div className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                    {d}
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-white/10">
                    <div
                      className={`h-1.5 rounded-full ${
                        i === 2 ? "bg-emerald-300 w-3/4" : "bg-white/30 w-1/2"
                      }`}
                    />
                  </div>
                  <div className="mt-1 truncate text-[10px] text-slate-300">
                    {["Salad","Soup","Bowl","Pasta","Tacos","Roast","Brunch"][i]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BentoCard>

        <BentoCard className="md:col-span-2 bg-gradient-to-br from-amber-300/10 via-amber-400/5 to-transparent">
          <BentoTag tone="amber" Icon={ScanLine}>SmartPantry™</BentoTag>
          <h3 className="mt-3 text-lg font-semibold text-white">Scan & track</h3>
          <p className="mt-1 text-sm text-slate-400">
            Add items in 2 seconds. Get expiry alerts before food turns.
          </p>
        </BentoCard>

        <BentoCard className="md:col-span-2 bg-gradient-to-br from-sky-400/10 via-sky-500/5 to-transparent">
          <BentoTag tone="sky" Icon={Activity}>NutriTrack™</BentoTag>
          <h3 className="mt-3 text-lg font-semibold text-white">Macros, simplified</h3>
          <div className="mt-3 flex items-end gap-1.5">
            {[40, 70, 55, 85, 60, 75, 50].map((h, i) => (
              <div
                key={i}
                className="w-3 rounded-sm bg-gradient-to-t from-sky-400/20 to-sky-300"
                style={{ height: `${h * 0.4}px` }}
              />
            ))}
          </div>
        </BentoCard>

        <BentoCard className="md:col-span-2 bg-gradient-to-br from-rose-400/10 via-rose-500/5 to-transparent">
          <BentoTag tone="rose" Icon={ShoppingBasket}>Shopping</BentoTag>
          <h3 className="mt-3 text-lg font-semibold text-white">One smart list</h3>
          <p className="mt-1 text-sm text-slate-400">
            Auto‑grouped by aisle, deduped, and pantry‑subtracted.
          </p>
        </BentoCard>

        <BentoCard className="md:col-span-2 bg-gradient-to-br from-emerald-400/10 via-emerald-500/5 to-transparent">
          <BentoTag tone="emerald" Icon={Heart}>Family</BentoTag>
          <h3 className="mt-3 text-lg font-semibold text-white">Portions & allergies</h3>
          <p className="mt-1 text-sm text-slate-400">
            Set a household. We scale and substitute automatically.
          </p>
        </BentoCard>

        <BentoCard className="md:col-span-2 bg-gradient-to-br from-violet-400/10 via-violet-500/5 to-transparent">
          <BentoTag tone="sky" Icon={Shield}>Privacy</BentoTag>
          <h3 className="mt-3 text-lg font-semibold text-white">Yours, locked.</h3>
          <p className="mt-1 text-sm text-slate-400">
            Encrypted at rest. Export or delete anytime.
          </p>
        </BentoCard>
      </div>
    </section>
  );
}

function BentoCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:bg-white/[0.04] ${className}`}
    >
      {children}
    </div>
  );
}

function BentoTag({
  tone,
  Icon,
  children,
}: {
  tone: "emerald" | "amber" | "sky" | "rose";
  Icon: any;
  children: React.ReactNode;
}) {
  const styles = {
    emerald: "text-emerald-200 ring-emerald-400/30 bg-emerald-400/10",
    amber: "text-amber-200 ring-amber-300/30 bg-amber-300/10",
    sky: "text-sky-200 ring-sky-400/30 bg-sky-400/10",
    rose: "text-rose-200 ring-rose-400/30 bg-rose-400/10",
  }[tone];
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-widest ring-1 ${styles}`}>
      <Icon className="h-3 w-3" />
      {children}
    </div>
  );
}

/* ---------------- Flowchart ---------------- */

function Flowchart() {
  const steps = [
    {
      n: "01",
      Icon: ChefHat,
      title: "Tell us your style",
      desc: "Diet, allergies, schedule, household size, cuisines you love.",
      tone: "emerald" as const,
    },
    {
      n: "02",
      Icon: ScanLine,
      title: "Scan your pantry",
      desc: "Snap, search, or import. SmartPantry™ understands what you have.",
      tone: "amber" as const,
    },
    {
      n: "03",
      Icon: Brain,
      title: "AI composes the week",
      desc: "Balanced macros, smart variety, and quick‑win nights handled.",
      tone: "sky" as const,
    },
    {
      n: "04",
      Icon: UtensilsCrossed,
      title: "Cook, track, repeat",
      desc: "Step‑by‑step recipes, auto shopping list, weekly nutrition recap.",
      tone: "rose" as const,
    },
  ];
  return (
    <section
      id="how"
      className="relative border-y border-white/5 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="How it works"
          title="From empty fridge to plated, in four steps."
          description="A clean handoff between you and the AI — every step is editable, transparent, and undoable."
        />

        <div className="relative mt-16">
          {/* Connector line */}
          <div className="pointer-events-none absolute left-0 right-0 top-10 hidden lg:block">
            <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <FlowStep key={s.n} {...s} isLast={i === steps.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowStep({
  n,
  Icon,
  title,
  desc,
  tone,
  isLast,
}: {
  n: string;
  Icon: any;
  title: string;
  desc: string;
  tone: "emerald" | "amber" | "sky" | "rose";
  isLast: boolean;
}) {
  const ring = {
    emerald: "from-emerald-400 to-emerald-600 text-emerald-950 shadow-emerald-500/30",
    amber: "from-amber-300 to-amber-500 text-amber-950 shadow-amber-400/30",
    sky: "from-sky-400 to-sky-600 text-sky-950 shadow-sky-500/30",
    rose: "from-rose-400 to-rose-600 text-rose-950 shadow-rose-500/30",
  }[tone];
  return (
    <div className="relative">
      <div className="relative z-10 flex flex-col items-start rounded-2xl border border-white/10 bg-[#0e1118]/80 p-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <div
            className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${ring} shadow-lg`}
          >
            <Icon className="h-5 w-5" strokeWidth={2.4} />
          </div>
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
            Step {n}
          </span>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
        <p className="mt-1.5 text-sm text-slate-400">{desc}</p>
      </div>

      {!isLast && (
        <div className="pointer-events-none absolute right-[-14px] top-12 z-20 hidden lg:block">
          <ArrowRight className="h-5 w-5 text-emerald-300/70" />
        </div>
      )}
    </div>
  );
}

/* ---------------- Stats ---------------- */

function Stats() {
  const items = [
    { value: "50k+", label: "Recipes generated", Icon: Sparkles },
    { value: "4.9★", label: "Average rating", Icon: Star },
    { value: "9 hrs", label: "Saved per week", Icon: Clock },
    { value: "32%", label: "Less food waste", Icon: Leaf },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 md:grid-cols-4 md:p-8">
        {items.map((s) => (
          <div key={s.label} className="flex items-center gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
              <s.Icon className="h-[18px] w-[18px] text-emerald-300" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-white">{s.value}</div>
              <div className="text-xs uppercase tracking-widest text-slate-400">
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */

function Testimonials() {
  const items = [
    {
      quote:
        "I haven’t opened a recipe tab in three weeks. The plan just shows up and the shopping list is already done.",
      name: "Maya R.",
      role: "Working parent of two",
      tag: "Family plan",
    },
    {
      quote:
        "Macros without spreadsheets. I hit my protein target every week without thinking about it.",
      name: "Daniel V.",
      role: "Marathon runner",
      tag: "Performance",
    },
    {
      quote:
        "The pantry awareness is the killer feature. It actually uses the herbs I forgot I bought.",
      name: "Priya S.",
      role: "Home cook, Brooklyn",
      tag: "Pantry-first",
    },
  ];

  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Loved by cooks"
        title="The most thoughtful plan you’ve never had to make."
      />

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {items.map((t) => (
          <figure
            key={t.name}
            className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6"
          >
            <div>
              <div className="flex gap-0.5 text-amber-300">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-[15px] leading-relaxed text-slate-200">
                “{t.quote}”
              </blockquote>
            </div>
            <figcaption className="mt-6 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">{t.name}</div>
                <div className="text-xs text-slate-400">{t.role}</div>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-emerald-200">
                {t.tag}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Pricing ---------------- */

function Pricing() {
  const tiers = [
    {
      name: "Starter",
      price: "$0",
      cadence: "forever",
      blurb: "For curious cooks getting started.",
      features: [
        "Weekly meal plan",
        "Up to 30 pantry items",
        "Basic nutrition view",
      ],
      cta: "Start free",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$9",
      cadence: "/ month",
      blurb: "Best for individuals & small households.",
      features: [
        "Unlimited pantry & plans",
        "SmartRecipe AI™ regenerations",
        "Macro & micro tracking",
        "Smart shopping list export",
      ],
      cta: "Try Pro free",
      highlight: true,
    },
    {
      name: "Family",
      price: "$15",
      cadence: "/ month",
      blurb: "For households up to 6 people.",
      features: [
        "Everything in Pro",
        "Per‑member preferences",
        "Allergy & diet profiles",
        "Priority support",
      ],
      cta: "Go family",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Pricing"
        title="Simple plans. Cancel anytime."
        description="Start free. Upgrade when the plan starts cooking for you."
      />

      <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`relative rounded-2xl border p-6 ${
              t.highlight
                ? "border-emerald-400/40 bg-gradient-to-b from-emerald-500/10 to-transparent shadow-2xl shadow-emerald-500/10"
                : "border-white/10 bg-white/[0.02]"
            }`}
          >
            {t.highlight && (
              <div className="absolute -top-3 left-6 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-200">
                Most popular
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-semibold text-white">{t.name}</h3>
              <Zap className={`h-4 w-4 ${t.highlight ? "text-emerald-300" : "text-slate-400"}`} />
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-4xl font-semibold tracking-tight text-white">
                {t.price}
              </span>
              <span className="text-sm text-slate-400">{t.cadence}</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">{t.blurb}</p>

            <ul className="mt-5 space-y-2.5 text-sm text-slate-200">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link href="/sign-up" className="mt-6 block">
              <Button
                className={`h-11 w-full rounded-xl font-semibold ${
                  t.highlight
                    ? "bg-gradient-to-b from-emerald-400 to-emerald-600 text-emerald-950 shadow-lg shadow-emerald-500/30 hover:from-emerald-300 hover:to-emerald-500"
                    : "bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {t.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Final CTA ---------------- */

function FinalCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent p-10 md:p-14">
        <div
          className="absolute inset-0 -z-10 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #34d399 0, transparent 40%), radial-gradient(circle at 80% 80%, #fbbf24 0, transparent 40%)",
          }}
        />
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Plan less. Cook better. Eat happier.
            </h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              Start your free trial today. Your first weekly plan generates in
              under 30 seconds.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link href="/sign-up">
              <Button className="h-12 gap-2 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 px-6 font-semibold text-emerald-950 shadow-xl shadow-emerald-500/30 hover:from-emerald-300 hover:to-emerald-500">
                Start free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                variant="ghost"
                className="h-12 rounded-xl border border-white/10 px-5 text-slate-100 hover:bg-white/5"
              >
                I already have an account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */

function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0c11]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 sm:px-6 md:grid-cols-5 lg:px-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600">
              <ChefHat className="h-5 w-5 text-emerald-950" />
            </div>
            <span className="text-sm font-semibold text-white">
              {APP_BRANDING.appFullName}
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-slate-400">
            Your personal AI cooking assistant. Pantry‑aware plans, simple
            nutrition, family‑sized portions.
          </p>
          <div className="mt-5 flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              Trusted by 12k+ home cooks
            </span>
          </div>
        </div>
        <FooterCol
          title="Product"
          links={["Features", "Pricing", "How it works", "Changelog"]}
        />
        <FooterCol
          title="Company"
          links={["About", "Careers", "Press", "Contact"]}
        />
        <FooterCol
          title="Legal"
          links={["Privacy", "Terms", "Security", "DMCA"]}
        />
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 text-xs text-slate-500 sm:px-6 lg:px-8">
          <div>© {new Date().getFullYear()} {APP_BRANDING.appFullName}. All rights reserved.</div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            All systems normal
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-slate-300">
        {title}
      </div>
      <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="hover:text-white">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Shared ---------------- */

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-300">
        <span className="h-1 w-1 rounded-full bg-emerald-400" />
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base text-slate-300 md:text-lg">{description}</p>
      )}
    </div>
  );
}
