import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all passwords for a user
// export const getPasswords = query({
//   args: {
//     userId: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const passwords = await ctx.db
//       .query("passwords")
//       .withIndex("by_user", (q) => q.eq("userId", args.userId))
//       .order("desc")
//       .collect();

//     return passwords;
//   },
// });

export const getPasswords = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return await ctx.db
      .query("passwords")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

// Add a new password
export const addPassword = mutation({
  args: {
    website: v.string(),
    username: v.string(),
    encryptedPassword: v.string(),
    category: v.string(),
    iv: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

      // For testing: use a hardcoded userId if not authenticated
    // const userId = identity?.subject || "test-user-123";

    const passwordId = await ctx.db.insert("passwords", {
      userId: identity.subject,
      website: args.website,
      username: args.username,
      encryptedPassword: args.encryptedPassword,
      category: args.category,
      iv: args.iv,
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return passwordId;
  },
});

export const updatePassword = mutation({
  args: {
    id: v.id("passwords"),
    website: v.string(),
    username: v.string(),
    encryptedPassword: v.string(),
    category: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Optional: Verify the password belongs to the current user
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Password not found or unauthorized");
    }

    await ctx.db.patch(args.id, {
      website: args.website,
      username: args.username,
      encryptedPassword: args.encryptedPassword,
      category: args.category,
      notes: args.notes,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Delete a password
// Delete a password
export const deletePassword = mutation({
  args: {
    id: v.id("passwords"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify the password belongs to the current user
    const password = await ctx.db.get(args.id);
    if (!password || password.userId !== identity.subject) {
      throw new Error("Password not found or unauthorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});