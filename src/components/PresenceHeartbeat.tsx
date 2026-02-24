"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function PresenceHeartbeat() {
  const heartbeat = useMutation(api.presence.heartbeat);

  useEffect(() => {
    void heartbeat();

    const interval = setInterval(() => {
      void heartbeat();
    }, 10_000);

    return () => clearInterval(interval);
  }, [heartbeat]);

  return null;
}

