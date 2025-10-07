// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Store user's encrypted encryption key
  vaultKeys: defineTable({
    userId: v.string(), // Clerk user ID
    encryptedMasterKey: v.string(), // Master key encrypted with password
    salt: v.string(), // For key derivation
    iv: v.string(), // Initialization vector
  }).index("by_user", ["userId"]),
  
  // Store encrypted passwords
  passwords: defineTable({
    userId: v.string(),
    website: v.string(),
    username: v.string(),
    encryptedPassword: v.string(),
    iv: v.string(), // Initialization vector for this entry
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});