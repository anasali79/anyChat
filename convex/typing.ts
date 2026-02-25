import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";

/**
 * Get current logged-in Convex user _id
 */
export const getCurrentUserId = async (ctx: QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) =>
      q.eq("clerkId", identity.subject)
    )
    .unique();

  if (!user) {
    throw new Error("Current user not found in Convex");
  }

  return user._id;
};

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("typingStatuses")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId)
          .eq("userId", userId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isTyping: args.isTyping,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("typingStatuses", {
        conversationId: args.conversationId,
        userId,
        isTyping: args.isTyping,
        updatedAt: now,
      });
    }
  },
});

export const typingForConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    const cutoff = Date.now() - 2500;

    const statuses = await ctx.db
      .query("typingStatuses")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const active = statuses.filter(
      (s) =>
        s.userId !== userId &&
        s.isTyping &&
        s.updatedAt >= cutoff
    );

    const users = await Promise.all(
      active.map((s) => ctx.db.get(s.userId))
    );

    return users
      .filter(Boolean)
      .map((user) => ({
        _id: user!._id,
        name: user!.name,
      }));
  },
});