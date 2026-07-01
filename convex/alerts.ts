import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createAlert = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    type: v.string(),
    priority: v.string(),
    data: v.optional(v.any()),
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

    const alertId = await ctx.db.insert("alerts", {
      userId: user._id,
      title: args.title,
      message: args.message,
      type: args.type,
      priority: args.priority,
      data: args.data,
      isRead: false,
      isDismissed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return alertId;
  },
});

// FIXED: Return empty array instead of throwing error
export const getAlerts = query({
  args: {
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
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

    let alerts = await ctx.db
      .query("alerts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (args.unreadOnly) {
      alerts = alerts.filter(alert => !alert.isRead);
    }

    return alerts.slice(0, args.limit || 50);
  },
});

export const markAlertAsRead = mutation({
  args: {
    alertId: v.id("alerts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.alertId, {
      isRead: true,
      updatedAt: Date.now(),
    });
  },
});

export const dismissAlert = mutation({
  args: {
    alertId: v.id("alerts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.alertId, {
      isDismissed: true,
      updatedAt: Date.now(),
    });
  },
});