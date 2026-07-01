import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createBriefing = mutation({
  args: {
    date: v.string(),
    title: v.string(),
    summary: v.string(),
    details: v.string(),
    type: v.string(),
    items: v.array(
      v.object({
        platform: v.string(),
        title: v.string(),
        description: v.string(),
        priority: v.string(),
        link: v.optional(v.string()),
      })
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

    const briefingId = await ctx.db.insert("briefings", {
      userId: user._id,
      date: args.date,
      title: args.title,
      summary: args.summary,
      details: args.details,
      type: args.type,
      items: args.items,
      isRead: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return briefingId;
  },
});

// FIXED: Return null instead of throwing error
export const getTodayBriefing = query({
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

    if (!user) {
      return null;
    }

    const today = new Date().toISOString().split("T")[0];
    
    const briefings = await ctx.db
      .query("briefings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return briefings.find(b => b.date === today) || null;
  },
});

// FIXED: Return empty array instead of throwing error
export const getBriefings = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => 
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (!user) {
      return [];
    }

    const briefings = await ctx.db
      .query("briefings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return briefings.slice(0, args.limit || 30);
  },
});

export const markBriefingAsRead = mutation({
  args: {
    briefingId: v.id("briefings"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.briefingId, {
      isRead: true,
      updatedAt: Date.now(),
    });
  },
});