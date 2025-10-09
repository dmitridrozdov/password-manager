import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Check if user has set up their vault
export const checkVaultSetup = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const vaultKey = await ctx.db
      .query("vaultKeys")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return {
      isSetup: vaultKey !== null,
      vaultKey: vaultKey ?? null,
    };
  },
});

// Initialize vault with master password
export const initializeVault = mutation({
  args: {
    userId: v.string(),
    encryptedMasterKey: v.string(),
    salt: v.string(),
    iv: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if vault already exists
    const existing = await ctx.db
      .query("vaultKeys")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      throw new Error("Vault already initialized");
    }

    const vaultKeyId = await ctx.db.insert("vaultKeys", {
      userId: args.userId,
      encryptedMasterKey: args.encryptedMasterKey,
      salt: args.salt,
      iv: args.iv,
    });

    return vaultKeyId;
  },
});

// Get vault key for verification
export const getVaultKey = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const vaultKey = await ctx.db
      .query("vaultKeys")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!vaultKey) {
      return null;
    }

    return {
      encryptedMasterKey: vaultKey.encryptedMasterKey,
      salt: vaultKey.salt,
      iv: vaultKey.iv,
    };
  },
});