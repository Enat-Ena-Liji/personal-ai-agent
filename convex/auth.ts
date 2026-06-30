import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get current user - FIXED: Handle unauthenticated case
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => 
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();
    
    return user || null;
  },
});

// Store user when they sign up - FIXED: Better error handling
export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Return null instead of throwing error
      return null;
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => 
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email ?? "",
      name: identity.name ?? "User",
      imageUrl: typeof identity.imageUrl === "string" ? identity.imageUrl : undefined,
      credits: 10, // Free credits for new users
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

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

    return userId;
  },
});