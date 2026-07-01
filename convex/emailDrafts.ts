import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    platform: v.string(),
    threadId: v.optional(v.string()),
    to: v.array(v.string()),
    cc: v.optional(v.array(v.string())),
    bcc: v.optional(v.array(v.string())),
    subject: v.string(),
    body: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("failed")
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

    const draftId = await ctx.db.insert("emailDrafts", {
      userId: user._id,
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return draftId;
  },
});

export const getDrafts = query({
  args: {
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("failed")
    )),
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
      .query("emailDrafts")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    if (args.status) {
      queryBuilder = queryBuilder.filter((q) => 
        q.eq(q.field("status"), args.status)
      );
    }

    return queryBuilder.order("desc").collect();
  },
});

export const updateDraft = mutation({
  args: {
    draftId: v.id("emailDrafts"),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
    to: v.optional(v.array(v.string())),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("failed")
    )),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const draft = await ctx.db.get(args.draftId);
    if (!draft) {
      throw new Error("Draft not found");
    }

    const { draftId, ...updates } = args;
    await ctx.db.patch(draftId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});