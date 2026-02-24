"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function CurrentUserSync() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.syncCurrentUser);

  useEffect(() => {
    if (!isLoaded || !user) return;

    void syncUser({
      name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress || "Anonymous",
      imageUrl: user.imageUrl,
    });
  }, [isLoaded, user, syncUser]);

  return null;
}

