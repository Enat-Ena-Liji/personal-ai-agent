import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const store = mutation({
  args: {
    date: v.string(),
    metrics: v.object({
      emailsReceived: v.number(),
      emailsSent: v.number(),
      emailsReplied: v.number(),
      responseTime: v.number(),
      whatsappMessages: v.number(),
      meetingsAttended: v.number(),
      tasksCompleted: v.number(),
      priorityHigh: v.number(),
      priorityMedium: v.number(),
      priorityLow: v.number(),
      categories: v.object({
        work: v.number(),
        personal: v.number(),
        social: v.number(),
        promotional: v.number(),
      }),
      sentiment: v.object({
        positive: v.number(),
        neutral: v.number(),
        negative: v.number(),
      }),
      productivityScore: v.number(),
      focusTime: v.number(),
      distractions: v.number(),
    }),
    weeklyProgress: v.array(v.object({
      day: v.string(),
      value: v.number(),
    })),
    monthlyTrends: v.array(v.object({
      week: v.string(),
      emails: v.number(),
      messages: v.number(),
      meetings: v.number(),
    })),
    recommendations: v.array(v.string()),
    streaks: v.object({
      current: v.number(),
      longest: v.number(),
      lastActive: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.insert("analytics", {
      userId: user._id,
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getLatest = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) return null;

    const analytics = await ctx.db
      .query("analytics")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();

    return analytics;
  },
});

export const getHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) return [];

    const analytics = await ctx.db
      .query("analytics")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 30);

    return analytics;
  },
});