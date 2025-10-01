import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, UtensilsCrossed, Calendar, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { APP_BRANDING, FEATURE_DESCRIPTIONS } from "@/lib/branding";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <ChefHat className="h-20 w-20 text-orange-600" />
          </div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            {APP_BRANDING.appFullName}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {APP_BRANDING.tagline}. {FEATURE_DESCRIPTIONS.pantryManagement}, {FEATURE_DESCRIPTIONS.aiRecipes}, and {FEATURE_DESCRIPTIONS.nutritionTracking}.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <ShoppingBasket className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>{APP_BRANDING.pantrySystem.name}</CardTitle>
              <CardDescription>
                {APP_BRANDING.pantrySystem.description} with automatic updates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <ChefHat className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>{APP_BRANDING.aiRecipeGenerator.name}</CardTitle>
              <CardDescription>
                {APP_BRANDING.aiRecipeGenerator.description}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Meal Planning</CardTitle>
              <CardDescription>
                Plan meals for days or weeks with automatic nutrition tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <UtensilsCrossed className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Family-Friendly</CardTitle>
              <CardDescription>
                Customize portions for your family size and manage everyone's dietary needs
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl text-center">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Set Up Your Profile</h3>
                  <p className="text-gray-600">
                    Tell us about your dietary preferences, allergies, and favorite ingredients
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Add to Your Pantry</h3>
                  <p className="text-gray-600">
                    Fill your virtual pantry with ingredients you have on hand
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Generate Meal Plans</h3>
                  <p className="text-gray-600">
                    Our AI creates personalized meal plans based on your preferences and available ingredients
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Cook & Track</h3>
                  <p className="text-gray-600">
                    Follow step-by-step instructions and automatically update your pantry as you cook
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
