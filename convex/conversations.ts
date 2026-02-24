import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function getCurrentUserDoc(ctx: Parameters<typeof query<any>>[0]) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
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

    // Scan all conversations and find a 1:1 conversation
    // that already has both members.
    const existing = await ctx.db.query("conversations").collect();

    const direct = existing.find(
      (conv) =>
        !conv.isGroup &&
        conv.memberIds.length === 2 &&
        conv.memberIds.includes(args.otherUserId) &&
        conv.memberIds.includes(currentUser._id)
    );

    if (direct) {
      return direct._id;
    }

    const conversationId = await ctx.db.insert("conversations", {
      isGroup: false,
      name: undefined,
      memberIds: [currentUser._id, args.otherUserId],
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

      const otherMemberIds = conv.memberIds.filter(
        (id: any) => id !== currentUser._id
      );

      const members = await Promise.all(
        otherMemberIds.map((id) => ctx.db.get(id))
      );

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

