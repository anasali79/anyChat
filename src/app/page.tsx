import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { CurrentUserSync } from "@/components/CurrentUserSync";
import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";
import { ChatShell } from "@/components/chat/ChatShell";
import { LandingPage } from "@/components/landing/LandingPage";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SignedOut>
        <LandingPage />
      </SignedOut>

      <SignedIn>
        <div className="min-h-screen bg-gradient-to-b from-white via-[#F6F2FF] to-white text-zinc-900">
          <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pt-4 pb-6 sm:px-6 sm:pt-6">
            <header className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.12)] backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#4F8DFF] shadow-[0_10px_30px_rgba(79,141,255,0.45)]">
                  <span className="text-sm font-semibold text-white">AC</span>
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-tight text-zinc-900">
                    AnyChat
                  </p>
                  <p className="text-xs text-zinc-500">
                    Modern messaging for your team
                  </p>
                </div>
              </div>
              <UserButton afterSignOutUrl="/" />
            </header>

            <CurrentUserSync />
            <PresenceHeartbeat />
            <ChatShell />
          </div>
        </div>
      </SignedIn>
    </main>
  );
}

