import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    credits: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),

  userSettings: defineTable({
    userId: v.id("users"),
    preferences: v.object({
      dailyBriefing: v.boolean(),
      emailNotifications: v.boolean(),
      timezone: v.string(),
      language: v.string(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  connectedPlatforms: defineTable({
    userId: v.id("users"),
    platform: v.union(
      v.literal("gmail"),
      v.literal("whatsapp"),
      v.literal("calendar"),
      v.literal("slack")
    ),
    accountId: v.string(),
    accountEmail: v.optional(v.string()),
    accountName: v.optional(v.string()),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    isConnected: v.boolean(),
    lastSync: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_platform", ["userId", "platform"])
    .index("by_platform", ["platform"]),

  briefings: defineTable({
    userId: v.id("users"),
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
    isRead: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_date", ["userId", "date"])
    .index("by_user", ["userId"]),

  alerts: defineTable({
    userId: v.id("users"),
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
    isRead: v.boolean(),
    isDismissed: v.boolean(),
    data: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_read", ["userId", "isRead"])
    .index("by_user", ["userId"]),
    // Add this to your schema
notifications: defineTable({
  userId: v.id("users"),
  title: v.string(),
  message: v.string(),
  priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
  type: v.union(v.literal("email"), v.literal("whatsapp"), v.literal("system")),
  data: v.optional(v.any()),
  read: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user_read", ["userId", "read"])
  .index("by_user", ["userId"]),

  // Add analytics table
analytics: defineTable({
  userId: v.id("users"),
  data: v.any(),
  period: v.number(),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_date", ["userId", "createdAt"]),
  
});