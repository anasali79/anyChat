import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    imageUrl: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastSeen: v.optional(v.number()),
  }).index("by_clerk_id", ["clerkId"]),

  conversations: defineTable({
    isGroup: v.boolean(),
    name: v.optional(v.string()),
    memberIds: v.array(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastMessageAt: v.optional(v.number()),
  }).index("by_member", ["memberIds"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    text: v.string(),
    createdAt: v.number(),
    deleted: v.boolean(),
    replyToId: v.optional(v.id("messages")),
  }).index("by_conversation", ["conversationId", "createdAt"]),

  messageReactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
    createdAt: v.number(),
  }).index("by_message", ["messageId"]),

  typingStatuses: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    isTyping: v.boolean(),
    updatedAt: v.number(),
  }).index("by_conversation_user", ["conversationId", "userId"]),

  presences: defineTable({
    userId: v.id("users"),
    lastSeen: v.number(),
  }).index("by_user", ["userId"]),

  conversationReads: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastReadAt: v.number(),
  }).index("by_conversation_user", ["conversationId", "userId"]),

  blockedUsers: defineTable({
    blockerId: v.id("users"),
    blockedId: v.id("users"),
  }).index("by_blockerId", ["blockerId"])
    .index("by_blockedId", ["blockedId"])
    .index("by_blocker_and_blocked", ["blockerId", "blockedId"]),
});

