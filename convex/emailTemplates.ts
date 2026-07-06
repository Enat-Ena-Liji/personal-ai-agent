import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    subject: v.string(),
    body: v.string(),
    category: v.string(),
    variables: v.array(v.string()),
    isFavorite: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    const templateId = await ctx.db.insert("emailTemplates", {
      userId: user._id,
      name: args.name,
      subject: args.subject,
      body: args.body,
      category: args.category,
      variables: args.variables,
      isFavorite: args.isFavorite,
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return templateId;
  },
});

export const getTemplates = query({
  args: {
    category: v.optional(v.string()),
    favoriteOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) return [];

    let queryBuilder = ctx.db
      .query("emailTemplates")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    if (args.category) {
      queryBuilder = queryBuilder.filter((q) => q.eq(q.field("category"), args.category));
    }

    if (args.favoriteOnly) {
      queryBuilder = queryBuilder.filter((q) => q.eq(q.field("isFavorite"), true));
    }

    const templates = await queryBuilder.collect();
    return templates;
  },
});

export const update = mutation({
  args: {
    templateId: v.id("emailTemplates"),
    name: v.optional(v.string()),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
    category: v.optional(v.string()),
    variables: v.optional(v.array(v.string())),
    isFavorite: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const { templateId, ...updates } = args;
    await ctx.db.patch(templateId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteTemplate = mutation({
  args: { templateId: v.id("emailTemplates") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    await ctx.db.delete(args.templateId);
  },
});

export const incrementUsage = mutation({
  args: { templateId: v.id("emailTemplates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");

    await ctx.db.patch(args.templateId, {
      usageCount: (template.usageCount || 0) + 1,
      lastUsed: Date.now(),
    });
  },
});