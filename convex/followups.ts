import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createFollowup = mutation({
  args: {
    emailId: v.string(),
    followupDate: v.number(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.insert("followups", {
      userId: user._id,
      emailId: args.emailId,
      followupDate: args.followupDate,
      message: args.message,
      completed: false,
      createdAt: Date.now(),
    });
  },
});

export const getPendingFollowups = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("followups")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("completed"), false))
      .filter((q) => q.lt(q.field("followupDate"), Date.now()))
      .collect();
  },
});