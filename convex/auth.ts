import { mutation, query } from "./_generated/server";

export const storeUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => 
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email ?? "",
      name: identity.name ?? "User",
      imageUrl: typeof identity.imageUrl === "string" ? identity.imageUrl : undefined,
      credits: 10,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

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

export const getCurrentUser = query({
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