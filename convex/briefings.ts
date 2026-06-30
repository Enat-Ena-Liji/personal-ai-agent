import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a briefing
export const createBriefing = mutation({
  args: {
    date: v.string(),
    title: v.string(),
    summary: v.string(),
    details: v.string(),
    type: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("custom")
    ),
    items: v.array(
      v.object({
        platform: v.string(),
        title: v.string(),
        description: v.string(),
        priority: v.union(
          v.literal("high"),
          v.literal("medium"),
          v.literal("low")
        ),
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
      ...args,
      isRead: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return briefingId;
  },
});

// Get today's briefing
export const getTodayBriefing = query({
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

    const today = new Date().toISOString().split("T")[0];
    
    const briefing = await ctx.db
      .query("briefings")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", user._id).eq("date", today)
      )
      .first();

    return briefing;
  },
});

// Get all briefings
export const getBriefings = query({
  args: {
    limit: v.optional(v.number()),
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

    const briefings = await ctx.db
      .query("briefings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 30);

    return briefings;
  },
});

// Mark briefing as read
export const markBriefingAsRead = mutation({
  args: {
    briefingId: v.id("briefings"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const briefing = await ctx.db.get(args.briefingId);
    if (!briefing) {
      throw new Error("Briefing not found");
    }

    await ctx.db.patch(args.briefingId, {
      isRead: true,
      updatedAt: Date.now(),
    });
  },
});