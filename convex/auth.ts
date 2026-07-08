// convex/auth.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const storeUser = mutation({
  args: {
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("[storeUser] Starting with args:", args);

    try {
      // Check if user already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => 
          q.eq("tokenIdentifier", args.tokenIdentifier)
        )
        .first();

      if (existingUser) {
        console.log("[storeUser] User already exists:", existingUser._id);
        
        // Update user info
        await ctx.db.patch(existingUser._id, {
          email: args.email,
          name: args.name,
          imageUrl: args.imageUrl || existingUser.imageUrl,
          updatedAt: Date.now(),
        });
        
        return existingUser._id;
      }

      // Create new user
      console.log("[storeUser] Creating new user...");
      const userId = await ctx.db.insert("users", {
        tokenIdentifier: args.tokenIdentifier,
        email: args.email || "no-email@provided.com",
        name: args.name || "User",
        imageUrl: args.imageUrl || "",
        credits: 10,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      console.log("[storeUser] New user created with ID:", userId);

      // Create default settings
      await ctx.db.insert("userSettings", {
        userId: userId,
        preferences: {
          dailyBriefing: true,
          emailNotifications: true,
          timezone: "UTC",
          language: "en",
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      console.log("[storeUser] User settings created for:", userId);
      return userId;
    } catch (error) {
      console.error("[storeUser] Error:", error);
      throw error;
    }
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    console.log("[getCurrentUser] Starting");
    
    try {
      const identity = await ctx.auth.getUserIdentity();
      
      if (!identity) {
        console.log("[getCurrentUser] No identity found");
        return null;
      }

      console.log("[getCurrentUser] Identity found:", {
        tokenIdentifier: identity.tokenIdentifier,
        email: identity.email,
        name: identity.name,
      });

      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => 
          q.eq("tokenIdentifier", identity.tokenIdentifier)
        )
        .first();

      console.log("[getCurrentUser] User:", user ? `Found (${user._id})` : "Not found");
      return user || null;
    } catch (error) {
      console.error("[getCurrentUser] Error:", error);
      return null;
    }
  },
});