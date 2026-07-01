import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const connectPlatform = mutation({
  args: {
    platform: v.string(),
    accountId: v.string(),
    accountEmail: v.optional(v.string()),
    accountName: v.optional(v.string()),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => 
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if platform already exists
    const existingPlatforms = await ctx.db
      .query("connectedPlatforms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const existing = existingPlatforms.find(
      p => p.platform === args.platform
    );

    if (existing) {
      await ctx.db.patch(existing._id, {
        accountId: args.accountId,
        accountEmail: args.accountEmail,
        accountName: args.accountName,
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        isConnected: true,
        lastSync: Date.now(),
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    const platformId = await ctx.db.insert("connectedPlatforms", {
      userId: user._id,
      platform: args.platform,
      accountId: args.accountId,
      accountEmail: args.accountEmail,
      accountName: args.accountName,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      isConnected: true,
      lastSync: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return platformId;
  },
});

// FIXED: Return empty array instead of throwing error
export const getPlatforms = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return []; // Return empty array instead of throwing
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => 
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (!user) {
      return []; // Return empty array instead of throwing
    }

    const platforms = await ctx.db
      .query("connectedPlatforms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return platforms;
  },
});

export const disconnectPlatform = mutation({
  args: {
    platform: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => 
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const platforms = await ctx.db
      .query("connectedPlatforms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const platform = platforms.find(p => p.platform === args.platform);

    if (!platform) {
      throw new Error("Platform not found");
    }

    await ctx.db.delete(platform._id);
  },
});