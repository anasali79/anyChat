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

