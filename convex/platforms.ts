import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    console.log(`[connectPlatform] Starting for platform: ${args.platform}`);
    
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        console.error("[connectPlatform] No identity found");
        throw new Error("Unauthorized - No user identity found");
      }

      console.log(`[connectPlatform] User identity found: ${identity.tokenIdentifier}`);

      // Find user
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => 
          q.eq("tokenIdentifier", identity.tokenIdentifier)
        )
        .first();

      if (!user) {
        console.error(`[connectPlatform] User not found for token: ${identity.tokenIdentifier}`);
        throw new Error("User not found - Please sign in again");
      }

      console.log(`[connectPlatform] User found: ${user._id}`);

      // Check if platform already exists
      const platforms = await ctx.db
        .query("connectedPlatforms")
        .withIndex("by_user_platform", (q) => q.eq("userId", user._id))
        .collect();

      const existing = platforms.find(p => p.platform === args.platform);
      console.log(`[connectPlatform] Existing platform found: ${!!existing}`);

      if (existing) {
        // Update existing
        console.log(`[connectPlatform] Updating existing platform: ${existing._id}`);
        await ctx.db.patch(existing._id, {
          accountId: args.accountId,
          accountEmail: args.accountEmail || existing.accountEmail,
          accountName: args.accountName || existing.accountName,
          accessToken: args.accessToken || existing.accessToken,
          refreshToken: args.refreshToken || existing.refreshToken,
          isConnected: true,
          lastSync: Date.now(),
          updatedAt: Date.now(),
        });
        console.log(`[connectPlatform] Platform updated successfully`);
        return existing._id;
      }

      // Create new
      console.log(`[connectPlatform] Creating new platform`);
      const platformId = await ctx.db.insert("connectedPlatforms", {
        userId: user._id,
        platform: args.platform,
        accountId: args.accountId,
        accountEmail: args.accountEmail || args.accountId,
        accountName: args.accountName || args.accountId,
        accessToken: args.accessToken || "",
        refreshToken: args.refreshToken || "",
        isConnected: true,
        lastSync: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      console.log(`[connectPlatform] Platform created with ID: ${platformId}`);
      return platformId;
    } catch (error) {
      console.error("[connectPlatform] Error:", error);
      throw error;
    }
  },
});

export const getPlatforms = query({
  args: {},
  handler: async (ctx) => {
    console.log("[getPlatforms] Starting");
    
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        console.log("[getPlatforms] No identity found, returning empty array");
        return [];
      }

      console.log(`[getPlatforms] User identity found: ${identity.tokenIdentifier}`);

      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => 
          q.eq("tokenIdentifier", identity.tokenIdentifier)
        )
        .first();

      if (!user) {
        console.log("[getPlatforms] User not found, returning empty array");
        return [];
      }

      console.log(`[getPlatforms] User found: ${user._id}`);

      const platforms = await ctx.db
        .query("connectedPlatforms")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      console.log(`[getPlatforms] Found ${platforms.length} platforms`);
      return platforms;
    } catch (error) {
      console.error("[getPlatforms] Error:", error);
      // Return empty array instead of throwing to prevent UI breaking
      return [];
    }
  },
});

// Add a helper mutation to disconnect platforms
export const disconnectPlatform = mutation({
  args: {
    platform: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`[disconnectPlatform] Disconnecting platform: ${args.platform}`);
    
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        console.error("[disconnectPlatform] No identity found");
        throw new Error("Unauthorized");
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => 
          q.eq("tokenIdentifier", identity.tokenIdentifier)
        )
        .first();

      if (!user) {
        console.error(`[disconnectPlatform] User not found`);
        throw new Error("User not found");
      }

      const platforms = await ctx.db
        .query("connectedPlatforms")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      const platform = platforms.find(p => p.platform === args.platform);
      
      if (!platform) {
        console.log(`[disconnectPlatform] Platform not found: ${args.platform}`);
        return null;
      }

      // Update to disconnected instead of deleting (preserves history)
      await ctx.db.patch(platform._id, {
        isConnected: false,
        updatedAt: Date.now(),
      });

      console.log(`[disconnectPlatform] Platform disconnected: ${platform._id}`);
      return platform._id;
    } catch (error) {
      console.error("[disconnectPlatform] Error:", error);
      throw error;
    }
  },
});

// Add a helper query to check connection status
export const isPlatformConnected = query({
  args: {
    platform: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`[isPlatformConnected] Checking platform: ${args.platform}`);
    
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return false;
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => 
          q.eq("tokenIdentifier", identity.tokenIdentifier)
        )
        .first();

      if (!user) {
        return false;
      }

      const platforms = await ctx.db
        .query("connectedPlatforms")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      const platform = platforms.find(p => p.platform === args.platform);
      return platform?.isConnected || false;
    } catch (error) {
      console.error("[isPlatformConnected] Error:", error);
      return false;
    }
  },
});