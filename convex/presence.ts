import { mutation, query } from "./_generated/server";

async function getCurrentUserId(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    // When the user is not authenticated yet, silently no-op
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

export const heartbeat = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      // Not signed in or user not synced yet – skip presence update
      return;
    }
    const now = Date.now();

    const existing = await ctx.db
      .query("presences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSeen: now });
    } else {
      await ctx.db.insert("presences", { userId, lastSeen: now });
    }
  },
});

export const onlineUsers = query({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 20_000;
    const all = await ctx.db.query("presences").collect();

    return all
      .filter((p) => p.lastSeen >= cutoff)
      .map((p) => p.userId);
  },
});

