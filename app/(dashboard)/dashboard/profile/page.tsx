"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  PageHead,
  FolioCard,
  Stamp,
  FieldLabel,
  folioPrimary,
  folioOutline,
} from "@/components/dashboard/folio";
import { cn } from "@/lib/utils";

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

  const inputSkin =
    "border-[#0F1E33]/20 bg-white placeholder:text-[#5B6B82]/70 focus-visible:border-[#C2410C] focus-visible:ring-[#C2410C]/30";

  const quickAddSkin =
    "h-8 rounded-full border-[#0F1E33]/20 bg-white px-3 font-mono text-[11px] tracking-[0.08em] text-[#0F1E33] hover:border-[#C2410C]/60 hover:text-[#C2410C]";

  return (
    <div className="space-y-8">
      <PageHead
        kicker="HOUSE PROFILE"
        title="Your tastes, locked in."
        deck="EchoAI plans around all of this — allergies at 0.0 ppm, favourites first."
        action={
          <Button onClick={handleSaveProfile} className={cn(folioPrimary, "text-sm")}>
            Save Changes
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Personal Information */}
        <FolioCard className="p-6">
          <h2 className="font-serif text-xl tracking-tight">On the pass</h2>
          <p className="font-mono text-[10px] tracking-[0.2em] text-[#5B6B82]">
            ACCOUNT DETAILS · VIA CLERK
          </p>
          <dl className="mt-5 space-y-4">
            {[
              ["Name", user?.fullName || "Not set"],
              ["Email", user?.primaryEmailAddress?.emailAddress || "Not set"],
              ["Username", user?.username || "Not set"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-b border-[#0F1E33]/8 pb-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5B6B82]">
                  {k}
                </dt>
                <dd className="truncate font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </FolioCard>

        {/* Allergies */}
        <FolioCard className="p-6">
          <h2 className="font-serif text-xl tracking-tight">Allergen lock</h2>
          <p className="font-mono text-[10px] tracking-[0.2em] text-[#5B6B82]">
            0.0 PPM · NON-NEGOTIABLE
          </p>
          {allergies.length > 0 && (
            <div className="mb-4 mt-4 flex flex-wrap gap-2">
              {allergies.map((allergy, index) => (
                <Stamp
                  key={index}
                  tone={allergy.severity === "severe" ? "ember" : allergy.severity === "moderate" ? "ink" : "paper"}
                >
                  {allergy.name} · {allergy.severity.toUpperCase()}
                  <button onClick={() => handleRemoveAllergy(index)} aria-label={`Remove ${allergy.name}`}>
                    <X className="h-3 w-3" />
                  </button>
                </Stamp>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-2">
            <FieldLabel>Add allergy</FieldLabel>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Peanuts"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddAllergy()}
                className={inputSkin}
              />
              <select
                value={allergySeverity}
                onChange={(e) => setAllergySeverity(e.target.value)}
                className="h-10 shrink-0 rounded-xl border border-[#0F1E33]/20 bg-white px-2 text-sm focus:border-[#C2410C] focus:outline-none"
                aria-label="Severity"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
              <Button onClick={handleAddAllergy} className={cn(folioPrimary, "h-10 w-10 shrink-0 !p-0")} aria-label="Add allergy">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="pt-3">
            <p className="font-mono text-[10px] tracking-[0.18em] text-[#5B6B82]">QUICK ADD</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {commonAllergies.map((allergy) => (
                <Button
                  key={allergy}
                  variant="outline"
                  onClick={() => {
                    if (!allergies.some((a) => a.name === allergy)) {
                      setAllergies([...allergies, { name: allergy, severity: "moderate" }]);
                    }
                  }}
                  className={quickAddSkin}
                >
                  {allergy}
                </Button>
              ))}
            </div>
          </div>
        </FolioCard>

        {/* Medical Conditions */}
        <FolioCard className="p-6">
          <h2 className="font-serif text-xl tracking-tight">Health notes</h2>
          <p className="font-mono text-[10px] tracking-[0.2em] text-[#5B6B82]">
            CONDITIONS ECHOAI COOKS AROUND
          </p>
          {medicalConditions.length > 0 && (
            <div className="mb-4 mt-4 flex flex-wrap gap-2">
              {medicalConditions.map((condition) => (
                <Stamp key={condition} tone="paper">
                  {condition}
                  <button onClick={() => handleRemoveCondition(condition)} aria-label={`Remove ${condition}`}>
                    <X className="h-3 w-3" />
                  </button>
                </Stamp>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-2">
            <FieldLabel>Add condition</FieldLabel>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Diabetes"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCondition()}
                className={inputSkin}
              />
              <Button onClick={handleAddCondition} className={cn(folioPrimary, "h-10 w-10 shrink-0 !p-0")} aria-label="Add condition">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="pt-3">
            <p className="font-mono text-[10px] tracking-[0.18em] text-[#5B6B82]">QUICK ADD</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {commonConditions.map((condition) => (
                <Button
                  key={condition}
                  variant="outline"
                  onClick={() => {
                    if (!medicalConditions.includes(condition)) {
                      setMedicalConditions([...medicalConditions, condition]);
                    }
                  }}
                  className={quickAddSkin}
                >
                  {condition}
                </Button>
              ))}
            </div>
          </div>
        </FolioCard>

        {/* Favorite Ingredients */}
        <FolioCard className="p-6">
          <h2 className="font-serif text-xl tracking-tight">House favourites</h2>
          <p className="font-mono text-[10px] tracking-[0.2em] text-[#5B6B82]">
            FIRST ONTO THE PLAN
          </p>
          {favoriteIngredients.length > 0 && (
            <div className="mb-4 mt-4 flex flex-wrap gap-2">
              {favoriteIngredients.map((ingredient) => (
                <Stamp key={ingredient} tone="moss">
                  {ingredient}
                  <button onClick={() => handleRemoveFavorite(ingredient)} aria-label={`Remove ${ingredient}`}>
                    <X className="h-3 w-3" />
                  </button>
                </Stamp>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-2">
            <FieldLabel>Add favourite</FieldLabel>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Chicken, Broccoli"
                value={newFavorite}
                onChange={(e) => setNewFavorite(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddFavorite()}
                className={inputSkin}
              />
              <Button onClick={handleAddFavorite} className={cn(folioPrimary, "h-10 w-10 shrink-0 !p-0")} aria-label="Add favourite">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </FolioCard>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => window.location.reload()} className={cn(folioOutline, "text-sm")}>
          Discard
        </Button>
        <Button onClick={handleSaveProfile} className={cn(folioPrimary, "text-sm")}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
