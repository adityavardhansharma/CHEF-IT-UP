"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user } = useUser();
  const profile = useQuery(api.users.getUserProfile);
  const updateProfile = useMutation(api.users.updateUserProfile);
  
  const [allergies, setAllergies] = useState<Array<{ name: string; severity: string }>>([]);
  const [newAllergy, setNewAllergy] = useState("");
  const [allergySeverity, setAllergySeverity] = useState("moderate");
  
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState("");
  
  const [favoriteIngredients, setFavoriteIngredients] = useState<string[]>([]);
  const [newFavorite, setNewFavorite] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setAllergies(profile.allergies || []);
      setMedicalConditions(profile.medicalConditions || []);
      setFavoriteIngredients(profile.favoriteIngredients || []);
    }
  }, [profile]);

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setAllergies([...allergies, { name: newAllergy.trim(), severity: allergySeverity }]);
      setNewAllergy("");
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleAddCondition = () => {
    if (newCondition.trim() && !medicalConditions.includes(newCondition.trim())) {
      setMedicalConditions([...medicalConditions, newCondition.trim()]);
      setNewCondition("");
    }
  };

  const handleRemoveCondition = (condition: string) => {
    setMedicalConditions(medicalConditions.filter((c) => c !== condition));
  };

  const handleAddFavorite = () => {
    if (newFavorite.trim() && !favoriteIngredients.includes(newFavorite.trim())) {
      setFavoriteIngredients([...favoriteIngredients, newFavorite.trim()]);
      setNewFavorite("");
    }
  };

  const handleRemoveFavorite = (ingredient: string) => {
    setFavoriteIngredients(favoriteIngredients.filter((f) => f !== ingredient));
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        allergies,
        medicalConditions,
        favoriteIngredients,
      });

      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const commonConditions = [
    "Diabetes",
    "Hypertension",
    "Heart Disease",
    "Celiac Disease",
    "IBS",
    "GERD",
    "High Cholesterol",
  ];

  const commonAllergies = ["Peanuts", "Tree Nuts", "Dairy", "Eggs", "Soy", "Wheat", "Fish", "Shellfish"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your dietary preferences and health information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your account details from Clerk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <p className="text-lg font-medium">{user?.fullName || "Not set"}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-lg font-medium">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
            <div>
              <Label>Username</Label>
              <p className="text-lg font-medium">{user?.username || "Not set"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card>
          <CardHeader>
            <CardTitle>Allergies & Intolerances</CardTitle>
            <CardDescription>Foods you're allergic to or intolerant of</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {allergies.map((allergy, index) => (
                <Badge
                  key={index}
                  variant={
                    allergy.severity === "severe"
                      ? "destructive"
                      : allergy.severity === "moderate"
                      ? "default"
                      : "secondary"
                  }
                  className="gap-1"
                >
                  {allergy.name}
                  <button onClick={() => handleRemoveAllergy(index)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Add Allergy</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Peanuts"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddAllergy()}
                />
                <select
                  value={allergySeverity}
                  onChange={(e) => setAllergySeverity(e.target.value)}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
                <Button onClick={handleAddAllergy} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="pt-2">
              <Label className="text-xs text-gray-500">Quick add:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {commonAllergies.map((allergy) => (
                  <Button
                    key={allergy}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!allergies.some((a) => a.name === allergy)) {
                        setAllergies([...allergies, { name: allergy, severity: "moderate" }]);
                      }
                    }}
                  >
                    {allergy}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Conditions</CardTitle>
            <CardDescription>Health conditions affecting your diet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {medicalConditions.map((condition) => (
                <Badge key={condition} variant="secondary" className="gap-1">
                  {condition}
                  <button onClick={() => handleRemoveCondition(condition)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Add Condition</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Diabetes"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddCondition()}
                />
                <Button onClick={handleAddCondition} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="pt-2">
              <Label className="text-xs text-gray-500">Quick add:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {commonConditions.map((condition) => (
                  <Button
                    key={condition}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!medicalConditions.includes(condition)) {
                        setMedicalConditions([...medicalConditions, condition]);
                      }
                    }}
                  >
                    {condition}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Favorite Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle>Favorite Ingredients</CardTitle>
            <CardDescription>Ingredients you love in your meals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {favoriteIngredients.map((ingredient) => (
                <Badge key={ingredient} variant="secondary" className="gap-1 bg-orange-100 text-orange-800">
                  {ingredient}
                  <button onClick={() => handleRemoveFavorite(ingredient)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Add Favorite Ingredient</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Chicken, Broccoli"
                  value={newFavorite}
                  onChange={(e) => setNewFavorite(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddFavorite()}
                />
                <Button onClick={handleAddFavorite} size="icon" className="bg-orange-600">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Cancel
        </Button>
        <Button onClick={handleSaveProfile} className="bg-orange-600">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
