"use client";

import { useState, useEffect } from "react";
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
import { Plus, Search, Trash2, Loader2, X, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import { searchIngredients, createCustomIngredient, getPopularIngredients, initializeSearchCache } from "@/lib/food-api";
import { APP_BRANDING, UI_TEXT } from "@/lib/branding";
import { cn } from "@/lib/utils";

export default function PantryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [isSearching, setIsSearching] = useState(false);
  const [apiResults, setApiResults] = useState<any[]>([]);
  const [customIngredientName, setCustomIngredientName] = useState("");
  const [customCategory, setCustomCategory] = useState("Custom");
  const [searchMode, setSearchMode] = useState<"search" | "popular" | "custom">("popular");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

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

  // Initialize cache on component mount
  useEffect(() => {
    initializeSearchCache();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (query.length < 2) {
      setApiResults([]);
      setIsSearching(false);
      return;
    }

    // Show loading immediately
    setIsSearching(true);
    
    // Debounce API call - minimal delay for instant feel
    const timeout = setTimeout(async () => {
      try {
        const results = await searchIngredients(query);
        setApiResults(results);
      } catch (error) {
        console.error("Search error:", error);
        setApiResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 150); // Wait 150ms after user stops typing (instant feel!)
    
    setSearchTimeout(timeout);
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
      setSearchMode("popular");
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
          <DialogContent className="max-w-6xl h-[85vh] p-0 gap-0 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Floating Search */}
              <div className="relative z-10 px-6 pt-6 pb-4">
                <div className="relative max-w-2xl mx-auto">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-50" />
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search ingredients..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="h-14 pl-12 pr-12 text-lg bg-background/95 backdrop-blur-xl border-2 border-border shadow-2xl rounded-2xl"
                      autoFocus
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />
                    )}
                    {!isSearching && searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setApiResults([]);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Masonry Grid Results */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                {!selectedItem ? (
                <>
                  {searchQuery.length >= 2 ? (
                    <div className="space-y-4">
                      {isSearching ? (
                        <div className="h-[450px] flex items-center justify-center">
                          <div className="text-center space-y-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                              <Loader2 className="relative h-12 w-12 animate-spin text-primary mx-auto" />
                            </div>
                            <div>
                              <p className="font-medium">Searching...</p>
                              <p className="text-sm text-muted-foreground mt-1">Finding the best matches</p>
                            </div>
                          </div>
                        </div>
                      ) : allResults.length > 0 ? (
                        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                          {allResults.map((item, index) => (
                            <div
                              key={item.id || index}
                              className="break-inside-avoid"
                            >
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="w-full p-4 text-left bg-card hover:bg-accent/50 border border-border/40 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 group"
                              >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <h4 className="font-semibold text-sm leading-tight flex-1">
                                    {item.name}
                                  </h4>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                                      <Plus className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground capitalize mb-3">{item.category}</p>
                                {item.nutritionalInfo && (
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="px-2 py-1 bg-background/50 rounded">
                                      <span className="font-medium">{item.nutritionalInfo.calories}</span> cal
                                    </div>
                                    <div className="px-2 py-1 bg-background/50 rounded">
                                      <span className="font-medium">{item.nutritionalInfo.protein}g</span> pro
                                    </div>
                                  </div>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-[450px] flex items-center justify-center">
                          <div className="text-center space-y-6 max-w-md">
                            <div className="relative">
                              <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full" />
                              <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-2xl flex items-center justify-center">
                                <Search className="h-10 w-10 text-orange-500" />
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-lg mb-2">No results for "{searchQuery}"</p>
                              <p className="text-sm text-muted-foreground">Try a different search or create your own ingredient</p>
                            </div>
                            <Button 
                              onClick={() => {
                                setCustomIngredientName(searchQuery);
                                const customItem = createCustomIngredient(searchQuery, "Custom");
                                setSelectedItem({ ...customItem, isApiResult: true });
                              }}
                              size="lg"
                              className="gap-2"
                            >
                              <Sparkles className="h-4 w-4" />
                              Create "{searchQuery}"
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1 mb-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <p className="text-sm font-semibold">Popular Ingredients</p>
                        </div>
                        <button
                          onClick={() => {
                            const customItem = createCustomIngredient("", "Custom");
                            setSelectedItem({ ...customItem, isApiResult: true });
                          }}
                          className="text-sm text-primary hover:underline flex items-center gap-1.5"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Create custom
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {popularIngredients.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setSelectedItem({ ...item, isApiResult: true })}
                            className="group relative p-4 border border-border rounded-xl hover:border-primary hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-200 text-left bg-card"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
                            <div className="relative space-y-1">
                              <div className="font-medium text-sm truncate">{item.name}</div>
                              <div className="text-xs text-muted-foreground capitalize truncate">{item.category}</div>
                              <div className="text-xs text-muted-foreground/70 pt-1">
                                {item.nutritionalInfo.calories} cal
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Floating Add Form */
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                  <div className="w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="p-6 border-b border-border/40">
                      <div className="flex items-start justify-between mb-4">
                        {selectedItem.id?.startsWith("custom-") ? (
                          <div className="flex-1 space-y-3">
                            <Input
                              placeholder="Ingredient name"
                              value={customIngredientName || selectedItem.name}
                              onChange={(e) => {
                                setCustomIngredientName(e.target.value);
                                setSelectedItem({ ...selectedItem, name: e.target.value });
                              }}
                              className="text-base font-semibold"
                            />
                            <select
                              value={customCategory}
                              onChange={(e) => {
                                setCustomCategory(e.target.value);
                                setSelectedItem({ ...selectedItem, category: e.target.value });
                              }}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
                        ) : (
                          <div>
                            <h3 className="text-xl font-semibold mb-1">{selectedItem.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{selectedItem.category}</p>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setSelectedItem(null);
                            setQuantity("");
                            setCustomIngredientName("");
                          }}
                          className="text-muted-foreground hover:text-foreground ml-3"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      {selectedItem.nutritionalInfo && !selectedItem.id?.startsWith("custom-") && (
                        <div className="flex gap-3">
                          <div className="flex-1 p-3 bg-muted/50 rounded-lg text-center">
                            <div className="text-2xl font-bold">{selectedItem.nutritionalInfo.calories}</div>
                            <div className="text-xs text-muted-foreground mt-1">Calories</div>
                          </div>
                          <div className="flex-1 p-3 bg-muted/50 rounded-lg text-center">
                            <div className="text-2xl font-bold">{selectedItem.nutritionalInfo.protein}g</div>
                            <div className="text-xs text-muted-foreground mt-1">Protein</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Form */}
                    <div className="p-6 space-y-4">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground mb-2 block">Quantity</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="h-12 text-xl font-semibold text-center"
                          />
                        </div>
                        <div className="w-32">
                          <Label className="text-xs text-muted-foreground mb-2 block">Unit</Label>
                          <select
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="flex h-12 w-full rounded-md border border-input bg-background px-3 text-sm font-medium"
                          >
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="lb">lb</option>
                            <option value="oz">oz</option>
                            <option value="l">l</option>
                            <option value="ml">ml</option>
                            <option value="cup">cup</option>
                            <option value="tbsp">tbsp</option>
                            <option value="tsp">tsp</option>
                            <option value="pieces">pcs</option>
                          </select>
                        </div>
                      </div>

                      <Button 
                        onClick={() => handleAddItem(selectedItem)} 
                        className="w-full h-12 text-base"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add to Pantry
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              </div>
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