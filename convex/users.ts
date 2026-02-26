import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const syncCurrentUser = mutation({
  args: {
    name: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // If we can't identify the user yet, just no-op instead of throwing
      return null;
    }

    const clerkId = identity.subject;
    const now = Date.now();

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        imageUrl: args.imageUrl,
        updatedAt: now,
        lastSeen: now,
      });
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId,
      name: args.name,
      imageUrl: args.imageUrl,
      createdAt: now,
      updatedAt: now,
      lastSeen: now,
    });

    return userId;
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

export const searchUsers = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // If not authenticated, there is no "other users" list
      return [];
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      return [];
    }

    const allUsers = await ctx.db.query("users").collect();
    const needle = args.search?.toLowerCase() ?? "";

    return allUsers
      .filter((user) => user._id !== currentUser._id)
      .filter((user) =>
        needle ? user.name.toLowerCase().includes(needle) : true
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const toggleBlock = mutation({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUserId = (await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique())?._id;

    if (!currentUserId) throw new Error("User not found");
    if (currentUserId === args.otherUserId) throw new Error("Cannot block yourself");

    const existing = await ctx.db
      .query("blockedUsers")
      .withIndex("by_blocker_and_blocked", (q) =>
        q.eq("blockerId", currentUserId).eq("blockedId", args.otherUserId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { blocked: false };
    } else {
      await ctx.db.insert("blockedUsers", {
        blockerId: currentUserId,
        blockedId: args.otherUserId,
      });
      return { blocked: true };
    }
  },
});

export const getBlockedUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const blocked = await ctx.db
      .query("blockedUsers")
      .withIndex("by_blockerId", (q) => q.eq("blockerId", user._id))
      .collect();

    return blocked.map((b) => b.blockedId);
  },
});

export const checkIfBlocked = query({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { amIBlocked: false, didIBlock: false };

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) return { amIBlocked: false, didIBlock: false };

    const didIBlock = await ctx.db
      .query("blockedUsers")
      .withIndex("by_blocker_and_blocked", (q) =>
        q.eq("blockerId", currentUser._id).eq("blockedId", args.otherUserId)
      )
      .unique();

    const amIBlocked = await ctx.db
      .query("blockedUsers")
      .withIndex("by_blocker_and_blocked", (q) =>
        q.eq("blockerId", args.otherUserId).eq("blockedId", currentUser._id)
      )
      .unique();

    return {
      amIBlocked: !!amIBlocked,
      didIBlock: !!didIBlock,
    };
  },
});

