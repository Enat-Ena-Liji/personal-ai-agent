import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createNotification = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    priority: v.string(),
    type: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    const notificationId = await ctx.db.insert("notifications", {
      userId: user._id,
      title: args.title,
      message: args.message,
      priority: args.priority as 'high' | 'medium' | 'low',
      type: args.type as 'email' | 'whatsapp' | 'system',
      data: args.data,
      read: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return notificationId;
  },
});

export const getNotifications = query({
  args: {
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) return [];

    let notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (args.unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }

    return notifications.slice(0, args.limit || 50);
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    await ctx.db.patch(args.notificationId, {
      read: true,
      updatedAt: Date.now(),
    });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const updates = notifications.map(n => 
      ctx.db.patch(n._id, { read: true, updatedAt: Date.now() })
    );

    await Promise.all(updates);
  },
});