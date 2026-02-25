"use client";
import { useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { CurrentUserSync } from "@/components/CurrentUserSync";
import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";
import { ChatShell } from "@/components/chat/ChatShell";
import { LandingPage } from "@/components/landing/LandingPage";

export default function Home() {
  const [search, setSearch] = useState("");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SignedOut>
        <LandingPage />
      </SignedOut>

      <SignedIn>
        <div className="min-h-screen bg-gradient-to-b from-white via-[#F6F2FF] to-white text-zinc-900">
          <div className="mx-auto flex h-screen max-w-[1700px] flex-col px-4 pt-4 pb-2 sm:px-6 sm:pt-4 sm:pb-2">
            <header className="relative group/header">
              <div className="absolute -inset-[1px] rounded-[24px] bg-gradient-to-r from-[#7C5CFF]/20 via-[#4F8DFF]/20 to-[#38BDF8]/20 opacity-100 transition-opacity" />

              <div className="relative flex items-center justify-between rounded-2xl border border-white/40 bg-white/60 px-5 py-2.5 shadow-[0_8px_40px_rgba(124,92,255,0.06),0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-xl overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <img src="Logo/logo-chatapp.png" alt="Logo" className="h-16 w-16 object-contain transition-transform duration-300 hover:scale-105" />
                  </div>
                </div>

                {/* Middle Search - Now visible on mobile */}
                <div className="flex flex-1 max-w-md mx-2 sm:mx-4 md:mx-8 text-zinc-900">
                  <div className="relative w-full group/search">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search anyone..."
                      className="w-full rounded-2xl border border-zinc-200 bg-white/80 py-2.5 pl-11 pr-4 text-sm text-zinc-900 shadow-sm outline-none transition-all placeholder:text-zinc-400 focus:border-[#7C5CFF]/50 focus:bg-white focus:ring-4 focus:ring-[#7C5CFF]/10"
                    />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within/search:text-[#7C5CFF] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsGroupModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-[#7C5CFF] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#7C5CFF]/25 transition-all hover:bg-[#6D4AFF] active:scale-95"
                  >
                    <span className="text-lg leading-none">+</span>
                    <span className="hidden sm:inline">New Chat</span>
                  </button>

                  <div className="h-8 w-[1px] bg-zinc-200 mx-1" />

                  <div className="hover:scale-105 transition-transform duration-200 ring-2 ring-white rounded-full shadow-sm">
                    <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
                  </div>
                </div>
              </div>

              <style>{`
                @keyframes headerShimmer {
                  0% { background-position: -200% 0; }
                  100% { background-position: 200% 0; }
                }
              `}</style>
            </header>

            <CurrentUserSync />
            <PresenceHeartbeat />
            <ChatShell search={search} isGroupModalOpen={isGroupModalOpen} setIsGroupModalOpen={setIsGroupModalOpen} />
          </div>
        </div>
      </SignedIn>
    </main>
  );
}

