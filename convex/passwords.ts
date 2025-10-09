import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all passwords for a user
export const getPasswords = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const passwords = await ctx.db
      .query("passwords")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return passwords;
  },
});

// Add a new password
export const addPassword = mutation({
  args: {
    userId: v.string(),
    website: v.string(),
    username: v.string(),
    encryptedPassword: v.string(),
    iv: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const passwordId = await ctx.db.insert("passwords", {
      userId: args.userId,
      website: args.website,
      username: args.username,
      encryptedPassword: args.encryptedPassword,
      iv: args.iv,
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return passwordId;
  },
});

// Update a password
export const updatePassword = mutation({
  args: {
    id: v.id("passwords"),
    userId: v.string(),
    website: v.optional(v.string()),
    username: v.optional(v.string()),
    encryptedPassword: v.optional(v.string()),
    iv: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, userId, ...updates } = args;

    // Verify ownership
    const password = await ctx.db.get(id);
    if (!password || password.userId !== userId) {
      throw new Error("Password not found or unauthorized");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete a password
export const deletePassword = mutation({
  args: {
    id: v.id("passwords"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const password = await ctx.db.get(args.id);
    
    if (!password || password.userId !== args.userId) {
      throw new Error("Password not found or unauthorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});