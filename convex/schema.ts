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

  analytics: defineTable({
    userId: v.id("users"),
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_date", ["userId", "date"])
    .index("by_user", ["userId"]),

  whatsappMessages: defineTable({
    userId: v.id("users"),
    messageId: v.string(),
    from: v.string(),
    body: v.string(),
    isGroup: v.boolean(),
    sender: v.string(),
    senderName: v.optional(v.string()),
    timestamp: v.number(),
    isRead: v.boolean(),
    isReplied: v.boolean(),
    repliedTo: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_timestamp", ["userId", "timestamp"])
    .index("by_sender", ["sender"]),

  emailDrafts: defineTable({
    userId: v.id("users"),
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
    priority: v.optional(v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    )),
    category: v.optional(v.union(
      v.literal("work"),
      v.literal("personal"),
      v.literal("social"),
      v.literal("promotional"),
      v.literal("spam")
    )),
    isStarred: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
    labels: v.optional(v.array(v.string())),
    sentAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_status", ["userId", "status"])
    .index("by_user_priority", ["userId", "priority"])
    .index("by_user", ["userId"]),

  priorityInbox: defineTable({
    userId: v.id("users"),
    emails: v.array(v.any()),
    timestamp: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_timestamp", ["userId", "timestamp"]),

  emailTemplates: defineTable({
    userId: v.id("users"),
    name: v.string(),
    subject: v.string(),
    body: v.string(),
    category: v.optional(v.union(
      v.literal("work"),
      v.literal("personal"),
      v.literal("sales"),
      v.literal("support"),
      v.literal("follow-up"),
      v.literal("meeting"),
      v.literal("introduction"),
      v.literal("other")
    )),
    variables: v.array(v.string()),
    isFavorite: v.boolean(),
    usageCount: v.number(),
    lastUsed: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_favorite", ["userId", "isFavorite"])
    .index("by_user_category", ["userId", "category"]),

});