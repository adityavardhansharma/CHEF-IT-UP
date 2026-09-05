"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { APP_BRANDING } from "@/lib/branding";
import { cn } from "@/lib/utils";
import {
  PageHead,
  FolioCard,
  Stamp,
  EmptyPlate,
  FieldLabel,
  folioPrimary,
} from "@/components/dashboard/folio";

const UNIT_OPTIONS = ["kg", "g", "lb", "oz", "l", "ml", "cup", "tbsp", "tsp", "pieces"];
const CUSTOM_CATEGORIES = ["Custom", "Vegetables", "Fruits", "Proteins", "Grains", "Dairy", "Spices", "Oils", "Other"];

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
  const totalCount = pantryItems?.length ?? 0;

  // Note: `searchMode` tracks dialog context for future modes; the custom
  // creator currently flows through `setSelectedItem` directly.
  void searchMode;
  void handleAddCustomIngredient;

  const closeAddForm = () => {
    setSelectedItem(null);
    setQuantity("");
    setCustomIngredientName("");
  };

  return (
    <div className="space-y-8">
      <PageHead
        kicker="SMARTPANTRY ENGINE"
        title={APP_BRANDING.pantrySystem.name}
        deck={`${APP_BRANDING.pantrySystem.tagline} — ${APP_BRANDING.pantrySystem.description}`}
        action={
          <>
            <Stamp tone={totalCount > 0 ? "moss" : "paper"}>
              {totalCount} STOCKED
            </Stamp>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className={cn(folioPrimary, "gap-1.5 text-sm")}>
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[88vh] gap-0 overflow-hidden border-[#0F1E33]/15 bg-[#FAF7F0] p-0 text-[#0F1E33] sm:max-w-3xl">
                <div className="flex h-full max-h-[88vh] flex-col">
                  {/* Search */}
                  <div className="border-b border-[#0F1E33]/10 px-6 pb-4 pt-6">
                    <DialogHeader className="mb-4 text-left">
                      <DialogTitle className="font-serif text-2xl tracking-tight">
                        Stock the shelves
                      </DialogTitle>
                      <DialogDescription className="font-light text-[#475569]">
                        Search the pantry index, or create your own ingredient.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="relative mx-auto max-w-2xl">
                      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5B6B82]" />
                      <Input
                        placeholder="Search ingredients…"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="h-14 rounded-2xl border-[#0F1E33]/20 bg-white py-3.5 pl-12 pr-12 text-base shadow-sm placeholder:text-[#5B6B82]/70 focus-visible:border-[#C2410C] focus-visible:ring-[#C2410C]/30"
                        autoFocus
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-[#C2410C]" />
                      )}
                      {!isSearching && searchQuery && (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setApiResults([]);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5B6B82] hover:text-[#0F1E33]"
                          aria-label="Clear search"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Results */}
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {!selectedItem ? (
                      <>
                        {searchQuery.length >= 2 ? (
                          <div className="space-y-4">
                            {isSearching ? (
                              <div className="flex h-64 items-center justify-center">
                                <div className="text-center">
                                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#C2410C]" />
                                  <p className="mt-3 font-serif text-lg">Searching the index…</p>
                                  <p className="font-mono text-[10px] tracking-[0.2em] text-[#5B6B82]">
                                    FINDING THE BEST MATCHES
                                  </p>
                                </div>
                              </div>
                            ) : allResults.length > 0 ? (
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {allResults.map((item, index) => (
                                  <button
                                    key={item.id || index}
                                    onClick={() => setSelectedItem(item)}
                                    className="group rounded-2xl border border-[#0F1E33]/12 bg-[#FFFDF6] p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#C2410C]/50 hover:shadow-md"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <h4 className="flex-1 font-serif text-base leading-tight tracking-tight">
                                        {item.name}
                                      </h4>
                                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F1E33]/5 transition-colors group-hover:bg-[#C2410C] group-hover:text-white">
                                        <Plus className="h-3.5 w-3.5" />
                                      </span>
                                    </div>
                                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5B6B82]">
                                      {item.category}
                                    </p>
                                    {item.nutritionalInfo && (
                                      <div className="mt-2 flex gap-2 font-mono text-[11px] text-[#0F1E33]">
                                        <span className="rounded-md bg-[#0F1E33]/5 px-2 py-1">
                                          {item.nutritionalInfo.calories} KCAL
                                        </span>
                                        <span className="rounded-md bg-[#0F1E33]/5 px-2 py-1">
                                          {item.nutritionalInfo.protein}G PRO
                                        </span>
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="flex h-64 items-center justify-center">
                                <div className="max-w-md text-center">
                                  <p className="font-serif text-xl">
                                    No results for &ldquo;{searchQuery}&rdquo;
                                  </p>
                                  <p className="mt-1 text-sm font-light text-[#475569]">
                                    Try a different search or create your own ingredient.
                                  </p>
                                  <Button
                                    onClick={() => {
                                      setCustomIngredientName(searchQuery);
                                      const customItem = createCustomIngredient(searchQuery, "Custom");
                                      setSelectedItem({ ...customItem, isApiResult: true });
                                    }}
                                    className={cn(folioPrimary, "mt-5 gap-2")}
                                  >
                                    <Sparkles className="h-4 w-4" />
                                    Create &ldquo;{searchQuery}&rdquo;
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="mb-1 flex items-center justify-between px-1">
                              <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-[#0F1E33]">
                                <Sparkles className="h-3.5 w-3.5 text-[#C2410C]" />
                                POPULAR INGREDIENTS
                              </p>
                              <button
                                onClick={() => {
                                  const customItem = createCustomIngredient("", "Custom");
                                  setSelectedItem({ ...customItem, isApiResult: true });
                                }}
                                className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] text-[#C2410C] hover:text-[#0F1E33]"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                CREATE CUSTOM
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                              {popularIngredients.map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => setSelectedItem({ ...item, isApiResult: true })}
                                  className="group rounded-2xl border border-[#0F1E33]/12 bg-[#FFFDF6] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#C2410C]/50 hover:shadow-md"
                                >
                                  <div className="truncate font-medium text-[#0F1E33]">{item.name}</div>
                                  <div className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-[#5B6B82]">
                                    {item.category}
                                  </div>
                                  <div className="mt-1.5 font-mono text-[11px] text-[#5B6B82]">
                                    {item.nutritionalInfo.calories} KCAL
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Add form */
                      <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-[#0F1E33]/12 bg-[#FFFDF6] shadow-lg">
                        <div className="border-b border-[#0F1E33]/10 p-6">
                          <div className="flex items-start justify-between gap-3">
                            {selectedItem.id?.startsWith("custom-") ? (
                              <div className="flex-1 space-y-3">
                                <div>
                                  <FieldLabel>Ingredient name</FieldLabel>
                                  <Input
                                    placeholder="Ingredient name"
                                    value={customIngredientName || selectedItem.name}
                                    onChange={(e) => {
                                      setCustomIngredientName(e.target.value);
                                      setSelectedItem({ ...selectedItem, name: e.target.value });
                                    }}
                                    className="border-[#0F1E33]/20 bg-white font-medium focus-visible:border-[#C2410C] focus-visible:ring-[#C2410C]/30"
                                  />
                                </div>
                                <div>
                                  <FieldLabel>Category</FieldLabel>
                                  <select
                                    value={customCategory}
                                    onChange={(e) => {
                                      setCustomCategory(e.target.value);
                                      setSelectedItem({ ...selectedItem, category: e.target.value });
                                    }}
                                    className="flex h-10 w-full rounded-xl border border-[#0F1E33]/20 bg-white px-3 text-sm focus:border-[#C2410C] focus:outline-none"
                                  >
                                    {CUSTOM_CATEGORIES.map((c) => (
                                      <option key={c} value={c}>{c}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <h3 className="font-serif text-xl tracking-tight">{selectedItem.name}</h3>
                                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5B6B82]">
                                  {selectedItem.category}
                                </p>
                              </div>
                            )}
                            <button
                              onClick={closeAddForm}
                              className="text-[#5B6B82] hover:text-[#0F1E33]"
                              aria-label="Back to results"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          {selectedItem.nutritionalInfo && !selectedItem.id?.startsWith("custom-") && (
                            <div className="mt-4 flex gap-3">
                              <div className="flex-1 rounded-xl border border-[#0F1E33]/10 bg-[#FAF7F0] p-3 text-center">
                                <div className="font-serif text-2xl">{selectedItem.nutritionalInfo.calories}</div>
                                <div className="font-mono text-[10px] tracking-[0.18em] text-[#5B6B82]">
                                  KCAL
                                </div>
                              </div>
                              <div className="flex-1 rounded-xl border border-[#0F1E33]/10 bg-[#FAF7F0] p-3 text-center">
                                <div className="font-serif text-2xl">{selectedItem.nutritionalInfo.protein}g</div>
                                <div className="font-mono text-[10px] tracking-[0.18em] text-[#5B6B82]">
                                  PROTEIN
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4 p-6">
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <FieldLabel>Quantity</FieldLabel>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="h-12 border-[#0F1E33]/20 bg-white text-center font-serif text-xl focus-visible:border-[#C2410C] focus-visible:ring-[#C2410C]/30"
                              />
                            </div>
                            <div className="w-32">
                              <FieldLabel>Unit</FieldLabel>
                              <select
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="flex h-12 w-full rounded-xl border border-[#0F1E33]/20 bg-white px-3 text-sm font-medium focus:border-[#C2410C] focus:outline-none"
                              >
                                {UNIT_OPTIONS.map((u) => (
                                  <option key={u} value={u}>{u}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleAddItem(selectedItem)}
                            className={cn(folioPrimary, "h-12 w-full gap-2 text-base")}
                          >
                            <Plus className="h-5 w-5" />
                            Add to Pantry
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      {pantryItems && pantryItems.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedItems || {}).map(([category, items]: [string, any]) => (
            <FolioCard key={category}>
              <div className="flex items-center justify-between gap-2 border-b border-[#0F1E33]/10 px-6 py-4">
                <h2 className="font-serif text-xl tracking-tight">{category}</h2>
                <Stamp tone="paper">{items.length} ITEMS</Stamp>
              </div>
              <ul className="grid grid-cols-1 divide-y divide-[#0F1E33]/8 md:grid-cols-2 md:divide-y-0 lg:grid-cols-3">
                {items.map((item: any) => (
                  <li
                    key={item._id}
                    className="flex items-center justify-between gap-3 px-6 py-3.5 transition-colors hover:bg-white/60 md:border-b md:border-[#0F1E33]/8"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#0F1E33]">
                        {item.name || item.customItemName}
                      </p>
                      <p className="font-mono text-[11px] text-[#5B6B82]">
                        {(() => {
                          const q = item.quantity;
                          const u = item.unit.toLowerCase();
                          const isPreciseUnit = ['kg', 'g', 'lb', 'oz', 'l', 'ml', 'tsp', 'tbsp', 'cup'].includes(u);
                          return isPreciseUnit ? Number(q).toFixed(3) : q;
                        })()} {item.unit.toUpperCase()}
                        {item.nutritionalInfo && (
                          <span> · {item.nutritionalInfo.calories} KCAL/100G</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#5B6B82] transition-colors hover:bg-[#C2410C]/10 hover:text-[#C2410C]"
                      aria-label={`Remove ${item.name || item.customItemName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </FolioCard>
          ))}
        </div>
      ) : (
        <EmptyPlate
          kicker="EMPTY SHELVES"
          title="The pantry is bare."
          body="Stock your first ingredients and EchoAI will start planning from them."
        >
          <Button onClick={() => setIsAddDialogOpen(true)} className={cn(folioPrimary, "text-sm")}>
            Add Your First Item
          </Button>
        </EmptyPlate>
      )}

    </div>
  );
}
