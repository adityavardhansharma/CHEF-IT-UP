import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Add an API ingredient to the global pantry database
 * This makes it available to all users and properly categorized
 */
export const addApiItemToGlobalPantry = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    nutritionalInfo: v.optional(v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // Check if item already exists in global pantry
    const existingItem = await ctx.db
      .query("globalPantryItems")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existingItem) {
      return existingItem._id;
    }

    // Add to global pantry with proper category
    const itemId = await ctx.db.insert("globalPantryItems", {
      name: args.name,
      category: args.category,
      nutritionalInfo: args.nutritionalInfo || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
    });

    return itemId;
  },
});

export const addPantryItem = mutation({
  args: {
    itemId: v.optional(v.id("globalPantryItems")),
    customItemName: v.optional(v.string()),
    quantity: v.number(),
    unit: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Check if item already exists in user's pantry
    const existingItem = await ctx.db
      .query("userPantry")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => {
        if (args.itemId) {
          return q.eq(q.field("itemId"), args.itemId);
        } else {
          return q.eq(q.field("customItemName"), args.customItemName);
        }
      })
      .first();

    if (existingItem) {
      // Update quantity
      await ctx.db.patch(existingItem._id, {
        quantity: args.quantity,
        unit: args.unit,
        updatedAt: Date.now(),
      });
      return existingItem._id;
    }

    return await ctx.db.insert("userPantry", {
      userId: user._id,
      itemId: args.itemId,
      customItemName: args.customItemName,
      quantity: args.quantity,
      unit: args.unit,
      updatedAt: Date.now(),
    });
  },
});

export const addCustomPantryItem = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    quantity: v.number(),
    unit: v.string(),
    nutritionalInfo: v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // First, create or find the custom ingredient
    let customIngredient = await ctx.db
      .query("customIngredients")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (!customIngredient) {
      const ingredientId = await ctx.db.insert("customIngredients", {
        userId: user._id,
        name: args.name,
        category: args.category,
        nutritionalInfo: args.nutritionalInfo,
        createdAt: Date.now(),
      });
      customIngredient = await ctx.db.get(ingredientId);
    }

    // Check if already in pantry
    const existingPantryItem = await ctx.db
      .query("userPantry")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("customItemName"), args.name))
      .first();

    if (existingPantryItem) {
      await ctx.db.patch(existingPantryItem._id, {
        quantity: args.quantity,
        unit: args.unit,
        updatedAt: Date.now(),
      });
      return existingPantryItem._id;
    }

    // Add to pantry
    return await ctx.db.insert("userPantry", {
      userId: user._id,
      customItemName: args.name,
      quantity: args.quantity,
      unit: args.unit,
      updatedAt: Date.now(),
    });
  },
});

export const getUserPantry = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const pantryItems = await ctx.db
      .query("userPantry")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Enrich with global item data or custom ingredient data
    const enrichedItems = await Promise.all(
      pantryItems.map(async (item) => {
        if (item.itemId) {
          // Item from global pantry (including API items)
          const globalItem = await ctx.db.get(item.itemId);
          return {
            ...item,
            name: globalItem?.name,
            category: globalItem?.category,
            nutritionalInfo: globalItem?.nutritionalInfo,
          };
        } else if (item.customItemName) {
          // Custom ingredient - get category from customIngredients table
          const customIngredient = await ctx.db
            .query("customIngredients")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("name"), item.customItemName))
            .first();
          
          return {
            ...item,
            name: item.customItemName,
            category: customIngredient?.category || "Custom",
            nutritionalInfo: customIngredient?.nutritionalInfo,
          };
        }
        return {
          ...item,
          name: item.customItemName,
          category: "Custom",
        };
      })
    );

    return enrichedItems;
  },
});

export const updatePantryItemQuantity = mutation({
  args: {
    pantryItemId: v.id("userPantry"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    if (args.quantity <= 0) {
      await ctx.db.delete(args.pantryItemId);
      return null;
    }

    await ctx.db.patch(args.pantryItemId, {
      quantity: args.quantity,
      updatedAt: Date.now(),
    });

    return args.pantryItemId;
  },
});

export const deletePantryItem = mutation({
  args: {
    pantryItemId: v.id("userPantry"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await ctx.db.delete(args.pantryItemId);
    return args.pantryItemId;
  },
});

export const searchGlobalPantryItems = query({
  args: {
    searchQuery: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.searchQuery || args.searchQuery.length < 2) {
      return [];
    }

    const results = await ctx.db
      .query("globalPantryItems")
      .withSearchIndex("search_name", (q) => {
        let search = q.search("name", args.searchQuery);
        if (args.category) {
          search = search.eq("category", args.category);
        }
        return search;
      })
      .take(20);

    return results;
  },
});

export const getAllGlobalPantryItems = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("globalPantryItems")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    }
    return await ctx.db.query("globalPantryItems").collect();
  },
});
