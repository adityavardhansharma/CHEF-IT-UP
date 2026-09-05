"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserSync } from "@/components/user-sync";
import { PrefetchQueries } from "@/components/prefetch-queries";
import { folioPrimary } from "@/components/dashboard/folio";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Pantry", href: "/dashboard/pantry" },
    { name: "Meal Plans", href: "/dashboard/meal-plans" },
    { name: "Profile", href: "/dashboard/profile" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F0] font-sans text-[#0F1E33]">
      <UserSync />
      <PrefetchQueries />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#0F1E33]/10 bg-[#FAF7F0]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F1E33] text-[#FAF7F0] shadow-md">
              <Compass className="h-4 w-4" />
            </span>
            <span className="font-serif text-base font-semibold tracking-tight text-[#0F1E33]">
              CHEF-IT-UP
            </span>
            <span className="hidden border-l border-[#0F1E33]/15 pl-2 font-mono text-[10px] tracking-[0.18em] text-[#5B6B82] sm:inline">
              HOUSE COPY
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/meal-plans/new">
              <Button className={cn(folioPrimary, "h-9 gap-1.5 px-4 text-xs")}>
                <Plus className="h-3.5 w-3.5" />
                New Meal Plan
              </Button>
            </Link>
            <UserButton />
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-t border-[#0F1E33]/10">
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
            {navigation.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative whitespace-nowrap px-4 py-3 font-mono text-[11px] tracking-[0.16em] transition-colors",
                    isActive
                      ? "text-[#C2410C]"
                      : "text-[#5B6B82] hover:text-[#0F1E33]"
                  )}
                >
                  {item.name.toUpperCase()}
                  {isActive && (
                    <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#C2410C]" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>

      <footer className="border-t border-[#0F1E33]/10">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-1 px-4 py-4 font-mono text-[10px] tracking-[0.18em] text-[#5B6B82] sm:flex-row sm:px-6">
          <span>CHEF-IT-UP · POWERED BY ECHOAI</span>
          <span>0.0 PPM LOCK // ZERO WASTE</span>
        </div>
      </footer>
    </div>
  );
}
