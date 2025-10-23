// convex/vaultSettings.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get the salt for the current user
export const getSalt = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const settings = await ctx.db
      .query("vaultSettings")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    return settings?.salt || null;
  },
});

// Create or update the salt for the current user
export const setSalt = mutation({
  args: {
    salt: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if salt already exists
    const existing = await ctx.db
      .query("vaultSettings")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) {
      // Don't overwrite existing salt
      return existing._id;
    }

    // Create new salt entry
    const settingsId = await ctx.db.insert("vaultSettings", {
      userId: identity.subject,
      salt: args.salt,
      createdAt: Date.now(),
    });

    return settingsId;
  },
});