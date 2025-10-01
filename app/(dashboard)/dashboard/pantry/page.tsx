"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import { searchIngredients, createCustomIngredient, getPopularIngredients } from "@/lib/food-api";
import { APP_BRANDING, UI_TEXT } from "@/lib/branding";

export default function PantryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [isSearching, setIsSearching] = useState(false);
  const [apiResults, setApiResults] = useState<any[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customIngredientName, setCustomIngredientName] = useState("");
  const [customCategory, setCustomCategory] = useState("Custom");

  const pantryItems = useQuery(api.pantry.getUserPantry);
  const localResults = useQuery(
    api.pantry.searchGlobalPantryItems,
    searchQuery.length >= 2 ? { searchQuery } : "skip"
  );

  const addPantryItem = useMutation(api.pantry.addPantryItem);
  const addCustomIngredient = useMutation(api.pantry.addCustomPantryItem);
  const addApiItemToGlobal = useMutation(api.pantry.addApiItemToGlobalPantry);
  const deletePantryItem = useMutation(api.pantry.deletePantryItem);

  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setApiResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchIngredients(query);
      setApiResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setApiResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddItem = async (item: any) => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    try {
      if (item.isApiResult) {
        // API result: Add to global pantry first, then to user pantry
        const globalItemId = await addApiItemToGlobal({
          name: item.name,
          category: item.category || "Uncategorized",
          nutritionalInfo: item.nutritionalInfo,
        });
        
        // Now add to user's pantry with the global ID
        await addPantryItem({
          itemId: globalItemId,
          quantity: parseFloat(quantity),
          unit,
        });
      } else if (item.id?.startsWith("custom-")) {
        // Truly custom ingredient (user created)
        await addCustomIngredient({
          name: item.name,
          category: item.category || "Custom",
          quantity: parseFloat(quantity),
          unit,
          nutritionalInfo: item.nutritionalInfo,
        });
      } else {
        // Already in global pantry
        await addPantryItem({
          itemId: item._id,
          quantity: parseFloat(quantity),
          unit,
        });
      }

      toast({
        title: "Item added!",
        description: `${item.name} (${item.category}) has been added to your pantry`,
      });

      setIsAddDialogOpen(false);
      setSearchQuery("");
      setApiResults([]);
      setQuantity("");
      setSelectedItem(null);
      setShowCustomInput(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to pantry",
        variant: "destructive",
      });
    }
  };

  const handleAddCustomIngredient = () => {
    if (!customIngredientName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter an ingredient name",
        variant: "destructive",
      });
      return;
    }

    const customItem = createCustomIngredient(customIngredientName, customCategory);
    setSelectedItem({ ...customItem, isApiResult: true });
    setShowCustomInput(false);
    setCustomIngredientName("");
  };

  const handleDeleteItem = async (itemId: Id<"userPantry">) => {
    try {
      await deletePantryItem({ pantryItemId: itemId });
      toast({
        title: "Item removed",
        description: "Item has been removed from your pantry",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const groupedItems = pantryItems?.reduce((acc: any, item) => {
    const category = item.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  // Combine results from local DB and API
  const allResults = [
    ...(localResults || []),
    ...apiResults.map((item) => ({ ...item, isApiResult: true })),
  ];

  const popularIngredients = getPopularIngredients();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">{APP_BRANDING.pantrySystem.name}</h1>
          <p className="text-gray-600">{APP_BRANDING.pantrySystem.tagline} - {APP_BRANDING.pantrySystem.description}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Pantry Item</DialogTitle>
              <DialogDescription>
                {APP_BRANDING.ingredientSearch.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Search Ingredients</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={UI_TEXT.pantry.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {UI_TEXT.pantry.searchPoweredBy}
                </p>
              </div>

              {!selectedItem && searchQuery.length === 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Popular Ingredients:</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {popularIngredients.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItem({ ...item, isApiResult: true })}
                        className="text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.category}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchQuery.length >= 2 && allResults.length > 0 && !selectedItem && (
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  {allResults.map((item, index) => (
                    <button
                      key={item.id || index}
                      onClick={() => setSelectedItem(item)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.category}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && allResults.length === 0 && !isSearching && (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-gray-500 mb-4">{UI_TEXT.pantry.noResults} for "{searchQuery}"</p>
                  <Button onClick={() => setShowCustomInput(true)} variant="outline">
                    {UI_TEXT.pantry.addCustom}
                  </Button>
                </div>
              )}

              {showCustomInput && (
                <div className="space-y-4 p-4 border rounded-lg bg-orange-50">
                  <div>
                    <Label htmlFor="customName">Custom Ingredient Name</Label>
                    <Input
                      id="customName"
                      placeholder="e.g., Homemade Sauce"
                      value={customIngredientName}
                      onChange={(e) => setCustomIngredientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customCategory">Category</Label>
                    <select
                      id="customCategory"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                    >
                      <option value="Custom">Custom</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Proteins">Proteins</option>
                      <option value="Grains">Grains</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Spices">Spices</option>
                      <option value="Oils">Oils</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <Button onClick={handleAddCustomIngredient} className="w-full">
                    Create Custom Ingredient
                  </Button>
                </div>
              )}

              {selectedItem && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      {selectedItem.image && (
                        <img
                          src={selectedItem.image}
                          alt={selectedItem.name}
                          className="w-16 h-16 rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{selectedItem.name}</h3>
                        <p className="text-sm text-gray-600">Category: {selectedItem.category}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs mt-3">
                      <div>
                        <span className="text-gray-500">Calories:</span>
                        <br />
                        <span className="font-semibold">
                          {selectedItem.nutritionalInfo?.calories || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Protein:</span>
                        <br />
                        <span className="font-semibold">
                          {selectedItem.nutritionalInfo?.protein || 0}g
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Carbs:</span>
                        <br />
                        <span className="font-semibold">
                          {selectedItem.nutritionalInfo?.carbs || 0}g
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Fat:</span>
                        <br />
                        <span className="font-semibold">
                          {selectedItem.nutritionalInfo?.fat || 0}g
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <select
                        id="unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="kg">Kilograms (kg)</option>
                        <option value="g">Grams (g)</option>
                        <option value="lb">Pounds (lb)</option>
                        <option value="oz">Ounces (oz)</option>
                        <option value="l">Liters (l)</option>
                        <option value="ml">Milliliters (ml)</option>
                        <option value="cup">Cups</option>
                        <option value="tbsp">Tablespoons</option>
                        <option value="tsp">Teaspoons</option>
                        <option value="pieces">Pieces</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleAddItem(selectedItem)} className="flex-1">
                      Add to Pantry
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedItem(null);
                        setQuantity("");
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              {!selectedItem && !showCustomInput && searchQuery.length < 2 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-2">Can't find what you're looking for?</p>
                  <Button onClick={() => setShowCustomInput(true)} variant="outline" size="sm">
                    Add Custom Ingredient
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {pantryItems && pantryItems.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedItems || {}).map(([category, items]: [string, any]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
                <CardDescription>{items.length} items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item: any) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name || item.customItemName}</h3>
                        <p className="text-sm text-gray-600">
                          {(() => {
                            const q = item.quantity;
                            const u = item.unit.toLowerCase();
                            const isPreciseUnit = ['kg', 'g', 'lb', 'oz', 'l', 'ml', 'tsp', 'tbsp', 'cup'].includes(u);
                            return isPreciseUnit ? Number(q).toFixed(3) : q;
                          })()} {item.unit}
                        </p>
                        {item.nutritionalInfo && (
                          <p className="text-xs text-gray-500">
                            {item.nutritionalInfo.calories} cal/100g
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(item._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">Your pantry is empty</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>Add Your First Item</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}