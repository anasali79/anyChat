import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Using 'any' for the Convex context keeps this helper simple and avoids
// over-constraining generic types in app code.
async function getCurrentUserDoc(ctx: any) {
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

  return user;
}

export const getOrCreateDirectConversation = mutation({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserDoc(ctx);
    if (!currentUser) {
      throw new Error("Not authenticated");
    }
    const now = Date.now();

    const existing = await ctx.db.query("conversations").collect();

    const direct = existing.find((conv) => {
      if (conv.isGroup) return false;
      const members = conv.memberIds;
      const isSelf = args.otherUserId === currentUser._id;
      if (isSelf) {
        return members.length === 1 && members.includes(currentUser._id);
      }
      return (
        members.length === 2 &&
        members.includes(args.otherUserId) &&
        members.includes(currentUser._id)
      );
    });

    if (direct) {
      return direct._id;
    }

    const isSelf = args.otherUserId === currentUser._id;
    const memberIds = isSelf
      ? [currentUser._id]
      : [currentUser._id, args.otherUserId];

    const conversationId = await ctx.db.insert("conversations", {
      isGroup: false,
      name: isSelf ? "Just me" : undefined,
      memberIds,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: undefined,
    });

    return conversationId;
  },
});

export const createGroupConversation = mutation({
  args: {
    name: v.string(),
    memberIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserDoc(ctx);
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    const unique = Array.from(new Set(args.memberIds.map((id) => id)));
    if (unique.length < 2) {
      throw new Error("A group must have at least 2 other members");
    }

    const now = Date.now();
    const conversationId = await ctx.db.insert("conversations", {
      isGroup: true,
      name: args.name.trim() || "Group chat",
      memberIds: [currentUser._id, ...unique],
      createdAt: now,
      updatedAt: now,
      lastMessageAt: undefined,
    });

    return conversationId;
  },
});

export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUserDoc(ctx);
    if (!currentUser) {
      // If the user isn't authenticated yet, just return an empty list
      return [];
    }

    const conversations = await ctx.db.query("conversations").collect();

    const results: {
      conversation: any;
      members: any[];
      lastMessage: any;
      unreadCount: number;
    }[] = [];

    for (const conv of conversations) {
      if (!conv.memberIds.includes(currentUser._id)) continue;

      const otherMemberIds = conv.memberIds.filter((id: any) => id !== currentUser._id);

      const members = otherMemberIds.length
        ? await Promise.all(otherMemberIds.map((id) => ctx.db.get(id)))
        : [currentUser];

      const allMessages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
        .collect();

      const lastMessage = allMessages
        .slice()
        .sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;

      const read = await ctx.db
        .query("conversationReads")
        .withIndex("by_conversation_user", (q) =>
          q.eq("conversationId", conv._id).eq("userId", currentUser._id)
        )
        .unique();

      const lastReadAt = read?.lastReadAt ?? 0;

      const unreadCount = allMessages.filter(
        (m) => m.createdAt > lastReadAt && m.senderId !== currentUser._id
      ).length;

      results.push({
        conversation: conv,
        members: members.filter(Boolean),
        lastMessage,
        unreadCount,
      });
    }

    results.sort((a, b) => {
      const aTime = a.conversation.lastMessageAt ?? a.conversation.createdAt;
      const bTime = b.conversation.lastMessageAt ?? b.conversation.createdAt;
      return bTime - aTime;
    });

    return results;
  },
});

export const leaveGroup = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserDoc(ctx);
    if (!currentUser) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.isGroup) {
      throw new Error("Group not found");
    }

    const newMembers = conversation.memberIds.filter(id => id !== currentUser._id);

    if (newMembers.length === 0) {
      // If no members left, delete the conversation and all linked data
      await ctx.db.delete(args.conversationId);
      // Cleanup associated data
      const messages = await ctx.db.query("messages").withIndex("by_conversation", q => q.eq("conversationId", args.conversationId)).collect();
      for (const m of messages) {
        const reactions = await ctx.db.query("messageReactions").withIndex("by_message", q => q.eq("messageId", m._id)).collect();
        for (const r of reactions) await ctx.db.delete(r._id);
        await ctx.db.delete(m._id);
      }
      const reads = await ctx.db.query("conversationReads").withIndex("by_conversation_user", q => q.eq("conversationId", args.conversationId)).collect();
      for (const r of reads) await ctx.db.delete(r._id);
      const typing = await ctx.db.query("typingStatuses").withIndex("by_conversation_user", q => q.eq("conversationId", args.conversationId)).collect();
      for (const t of typing) await ctx.db.delete(t._id);
    } else {
      await ctx.db.patch(args.conversationId, {
        memberIds: newMembers,
        updatedAt: Date.now(),
      });

      // Add a system message notifying others
      await ctx.db.insert("messages", {
        conversationId: args.conversationId,
        senderId: currentUser._id,
        text: `${currentUser.name} has left the group.`,
        createdAt: Date.now(),
        deleted: false,
      });
    }
  },
});

export const deleteConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserDoc(ctx);
    if (!currentUser) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    if (!conversation.memberIds.includes(currentUser._id)) {
      throw new Error("You are not a member of this conversation");
    }

    // Completely delete the conversation and associated items
    await ctx.db.delete(args.conversationId);
    const messages = await ctx.db.query("messages").withIndex("by_conversation", q => q.eq("conversationId", args.conversationId)).collect();
    for (const m of messages) {
      const reactions = await ctx.db.query("messageReactions").withIndex("by_message", q => q.eq("messageId", m._id)).collect();
      for (const r of reactions) await ctx.db.delete(r._id);
      await ctx.db.delete(m._id);
    }
    const reads = await ctx.db.query("conversationReads").withIndex("by_conversation_user", q => q.eq("conversationId", args.conversationId)).collect();
    for (const r of reads) await ctx.db.delete(r._id);
    const typing = await ctx.db.query("typingStatuses").withIndex("by_conversation_user", q => q.eq("conversationId", args.conversationId)).collect();
    for (const t of typing) await ctx.db.delete(t._id);
  },
});

