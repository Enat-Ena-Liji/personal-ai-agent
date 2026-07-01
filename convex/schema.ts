import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table
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

  // User settings
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

  // Connected platforms
  connectedPlatforms: defineTable({
    userId: v.id("users"),
    platform: v.string(),
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
    .index("by_user", ["userId"]),

  // Briefings
  briefings: defineTable({
    userId: v.id("users"),
    date: v.string(),
    title: v.string(),
    summary: v.string(),
    details: v.string(),
    type: v.string(),
    items: v.array(
      v.object({
        platform: v.string(),
        title: v.string(),
        description: v.string(),
        priority: v.string(),
        link: v.optional(v.string()),
      })
    ),
    isRead: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_date", ["userId", "date"])
    .index("by_user", ["userId"]),

  // Alerts
  alerts: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.string(),
    priority: v.string(),
    isRead: v.boolean(),
    isDismissed: v.boolean(),
    data: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_read", ["userId", "isRead"])
    .index("by_user", ["userId"]),

  // Email drafts
  emailDrafts: defineTable({
    userId: v.id("users"),
    platform: v.string(),
    threadId: v.optional(v.string()),
    to: v.array(v.string()),
    cc: v.optional(v.array(v.string())),
    bcc: v.optional(v.array(v.string())),
    subject: v.string(),
    body: v.string(),
    status: v.string(),
    sentAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_status", ["userId", "status"])
    .index("by_user", ["userId"]),
});