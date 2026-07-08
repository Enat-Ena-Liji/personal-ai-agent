import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const store = mutation({
  args: {
    emails: v.any(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.insert("priorityInbox", {
      userId: user._id,
      emails: args.emails,
      timestamp: args.timestamp,
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

    return await ctx.db
      .query("priorityInbox")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();
  },
});

export const updateEmailPriority = mutation({
  args: {
    emailId: v.string(),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    const inbox = await ctx.db
      .query("priorityInbox")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();

    if (!inbox) throw new Error("Inbox not found");

    // Update email priority in the stored inbox
    const updatedEmails = (inbox.emails as any[]).map((email) => {
      if (email.id === args.emailId) {
        return { ...email, priority: args.priority };
      }
      return email;
    });

    await ctx.db.patch(inbox._id, {
      emails: updatedEmails,
      updatedAt: Date.now(),
    });
  },
});