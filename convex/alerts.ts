import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create an alert
export const createAlert = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("email"),
      v.literal("whatsapp"),
      v.literal("system"),
      v.literal("calendar")
    ),
    priority: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
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
      ...args,
      isRead: false,
      isDismissed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return alertId;
  },
});

// Get user alerts
export const getAlerts = query({
  args: {
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
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

    let queryBuilder = ctx.db
      .query("alerts")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    if (args.unreadOnly) {
      queryBuilder = queryBuilder.filter((q) => q.eq(q.field("isRead"), false));
    }

    const alerts = await queryBuilder
      .order("desc")
      .take(args.limit || 50);

    return alerts;
  },
});

// Mark alert as read
export const markAlertAsRead = mutation({
  args: {
    alertId: v.id("alerts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const alert = await ctx.db.get(args.alertId);
    if (!alert) {
      throw new Error("Alert not found");
    }

    await ctx.db.patch(args.alertId, {
      isRead: true,
      updatedAt: Date.now(),
    });
  },
});

// Dismiss alert
export const dismissAlert = mutation({
  args: {
    alertId: v.id("alerts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const alert = await ctx.db.get(args.alertId);
    if (!alert) {
      throw new Error("Alert not found");
    }

    await ctx.db.patch(args.alertId, {
      isDismissed: true,
      updatedAt: Date.now(),
    });
  },
});