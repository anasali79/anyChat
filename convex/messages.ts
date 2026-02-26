import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Using 'any' for the Convex context here keeps the helper simple
// and avoids over-constraining generic types.
async function getCurrentUserId(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    return null;
  }

  return user._id;
}

export const listMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getCurrentUserId(ctx);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    const withSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        const reactions = await ctx.db
          .query("messageReactions")
          .withIndex("by_message", (q) => q.eq("messageId", message._id))
          .collect();

        // Fetch reply-to message if exists
        let replyTo = null;
        if (message.replyToId) {
          const replyMsg = await ctx.db.get(message.replyToId);
          if (replyMsg) {
            const replySender = await ctx.db.get(replyMsg.senderId);
            replyTo = {
              _id: replyMsg._id,
              text: replyMsg.deleted ? "" : replyMsg.text,
              deleted: replyMsg.deleted,
              senderName: replySender?.name ?? "Unknown",
            };
          }
        }

        return {
          message,
          sender,
          isOwn: currentUserId
            ? message.senderId === currentUserId
            : false,
          reactions,
          replyTo,
        };
      })
    );

    return withSenders;
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    text: v.string(),
    replyToId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const now = Date.now();

    // Check if it's a direct conversation and if anyone is blocked
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    if (!conversation.isGroup) {
      const otherUserId = conversation.memberIds.find((id) => id !== userId);
      if (otherUserId) {
        const amIBlocked = await ctx.db
          .query("blockedUsers")
          .withIndex("by_blocker_and_blocked", (q) =>
            q.eq("blockerId", otherUserId).eq("blockedId", userId)
          )
          .unique();
        if (amIBlocked) throw new Error("You are blocked by this user");

        const didIBlock = await ctx.db
          .query("blockedUsers")
          .withIndex("by_blocker_and_blocked", (q) =>
            q.eq("blockerId", userId).eq("blockedId", otherUserId)
          )
          .unique();
        if (didIBlock) throw new Error("You have blocked this user");
      }
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: userId,
      text: args.text,
      createdAt: now,
      deleted: false,
      ...(args.replyToId ? { replyToId: args.replyToId } : {}),
    });

    await ctx.db.patch(args.conversationId, {
      updatedAt: now,
      lastMessageAt: now,
    });

    return messageId;
  },
});

export const softDeleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }
    if (message.senderId !== userId) {
      throw new Error("You can only delete your own messages");
    }

    await ctx.db.patch(args.messageId, {
      deleted: true,
      text: "",
    });
  },
});

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.union(
      v.literal("👍"),
      v.literal("❤️"),
      v.literal("😂"),
      v.literal("😮"),
      v.literal("😢")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("messageReactions")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("emoji"), args.emoji))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { removed: true };
    }

    await ctx.db.insert("messageReactions", {
      messageId: args.messageId,
      userId,
      emoji: args.emoji,
      createdAt: Date.now(),
    });
    return { removed: false };
  },
});

export const markConversationRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      return;
    }
    const now = Date.now();

    const latest = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(1);

    const lastReadAt = latest[0]?.createdAt ?? now;

    const existing = await ctx.db
      .query("conversationReads")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", userId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastReadAt });
    } else {
      await ctx.db.insert("conversationReads", {
        conversationId: args.conversationId,
        userId,
        lastReadAt,
      });
    }
  },
});


