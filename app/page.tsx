"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_BRANDING } from "@/lib/branding";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 text-white rounded-md flex items-center justify-center font-bold">{APP_BRANDING.appShort || 'W'}</div>
            <div className="text-sm font-semibold">{APP_BRANDING.appFullName}</div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#product" className="hover:text-slate-900">Product</a>
            <a href="#how" className="hover:text-slate-900">How it works</a>
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/sign-in"><Button variant="ghost" className="h-9 px-3" aria-label="Sign in">Sign in</Button></Link>
            <Link href="/sign-up"><Button className="h-9 px-3 bg-blue-600 text-white" aria-label="Start free trial">Try free</Button></Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <p className="text-sm font-semibold text-blue-600">Personalized meal planning</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold leading-tight">Plan your week effortlessly — tailored to what you already have.</h1>
            <p className="mt-4 text-base text-slate-600 max-w-xl">Generate balanced weekly meal plans, adjust portions for your household, and keep your pantry synced — all with minimal setup and clear, actionable guidance.</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/sign-up"><Button className="h-11 px-6 bg-blue-600 text-white" aria-label="Start free trial">Start free — 14 days</Button></Link>
              <a href="#how" className="text-sm font-medium text-slate-700 hover:text-slate-900">How it works →</a>
            </div>

            {/* Quick chips */}
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-3 py-1">✅ Pantry-aware</span>
              <span className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-3 py-1">✅ Family portions</span>
              <span className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-3 py-1">✅ Clear nutrition</span>
            </div>
          </div>

          <aside className="md:col-span-5">
            <PreviewCard />
          </aside>
        </section>

        {/* Compact metrics strip */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 flex items-center justify-around text-sm text-slate-700">
            <div className="text-center">
              <div className="text-base font-semibold">50k+</div>
              <div className="text-xs text-slate-500">recipes generated</div>
            </div>
            <div className="text-center">
              <div className="text-base font-semibold">99%</div>
              <div className="text-xs text-slate-500">satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-base font-semibold">24/7</div>
              <div className="text-xs text-slate-500">AI assistance</div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="product" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-6">
            <SimpleFeature title="Weekly plans in seconds" desc="Fast setup, instant plans you can edit."/>
            <SimpleFeature title="Pantry-aware" desc="Recipes adapt to ingredients you already own."/>
            <SimpleFeature title="Readable nutrition" desc="Easy per-meal summaries that help choices."/>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-xl font-semibold">How it works</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Step number={1} title="Tell us about you" desc="Preferences, allergies, schedule." />
            <Step number={2} title="Add your pantry" desc="Scan barcodes or search quickly." />
            <Step number={3} title="Generate & cook" desc="One-click regenerate and track nutrition." />
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-lg border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Ready to plan less and eat better?</h3>
              <p className="text-sm text-slate-600 mt-1">Start your free trial and see your first week generated.</p>
            </div>
            <div>
              <Link href="/sign-up"><Button className="h-10 px-4 bg-blue-600 text-white">Start free</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between text-sm text-slate-600">
          <div>© 2025 {APP_BRANDING.appFullName}</div>
          <div className="flex gap-6">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PreviewCard(){
  return (
    <div className="rounded-lg border border-slate-200 p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Today</div>
          <div className="mt-1 text-slate-700 font-medium">Chicken bowl</div>
          <div className="text-xs text-slate-500">Ready in 25m</div>
        </div>
        <div className="text-xs text-slate-500">420 kcal</div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-600">
        <div className="p-2 rounded-md border text-center">Protein<br/>24g</div>
        <div className="p-2 rounded-md border text-center">Carbs<br/>45g</div>
        <div className="p-2 rounded-md border text-center">Fat<br/>12g</div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <div>Serves 2</div>
        <div className="text-blue-600 font-medium">Add to calendar →</div>
      </div>
    </div>
  );
}

function SimpleFeature({title, desc}:{title:string; desc:string}){
  return (
    <div className="rounded-lg border border-slate-200 p-5 bg-white hover:shadow transition-shadow">
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
    </div>
  );
}

function Step({number, title, desc}:{number:number; title:string; desc:string}){
  return (
    <div className="rounded-lg border border-slate-200 p-4 bg-white">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-semibold">{number}</div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-slate-600">{desc}</div>
        </div>
      </div>
    </div>
  );
}
