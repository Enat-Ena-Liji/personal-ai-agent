import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Connect a platform
export const connectPlatform = mutation({
  args: {
    platform: v.union(
      v.literal("gmail"),
      v.literal("whatsapp"),
      v.literal("calendar"),
      v.literal("slack")
    ),
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
    const existing = await ctx.db
      .query("connectedPlatforms")
      .withIndex("by_user_platform", (q) => 
        q.eq("userId", user._id).eq("platform", args.platform)
      )
      .first();

    if (existing) {
      // Update existing
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

    // Create new
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

// Get all connected platforms for user
export const getPlatforms = query({
  args: {},
  handler: async (ctx) => {
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

    // FIXED: Use the correct index name
    const platforms = await ctx.db
      .query("connectedPlatforms")
      .withIndex("by_user_platform", (q) => q.eq("userId", user._id))
      .collect();

    return platforms;
  },
});

// Disconnect platform
export const disconnectPlatform = mutation({
  args: {
    platform: v.union(
      v.literal("gmail"),
      v.literal("whatsapp"),
      v.literal("calendar"),
      v.literal("slack")
    ),
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

    const platform = await ctx.db
      .query("connectedPlatforms")
      .withIndex("by_user_platform", (q) => 
        q.eq("userId", user._id).eq("platform", args.platform)
      )
      .first();

    if (!platform) {
      throw new Error("Platform not found");
    }

    await ctx.db.delete(platform._id);
  },
});