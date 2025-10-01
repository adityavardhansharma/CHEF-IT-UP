"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Home, ShoppingBasket, Calendar, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserSync } from "@/components/user-sync";
import { PrefetchQueries } from "@/components/prefetch-queries";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Pantry", href: "/dashboard/pantry", icon: ShoppingBasket },
    { name: "Meal Plans", href: "/dashboard/meal-plans", icon: Calendar },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <UserSync />
      <PrefetchQueries />
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ChefHat className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                AI Chef
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/dashboard/meal-plans/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Meal Plan
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <button
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative",
                      isActive
                        ? "text-orange-600"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
                    )}
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
