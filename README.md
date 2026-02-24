## Tars Chat – Real-time messaging app

This is a real-time chat app built for the **Tars Full stack Engineer Internship Coding Challenge 2026 (AI-assisted version)**.

**Stack**: Next.js (App Router) · TypeScript · Convex (DB + realtime) · Clerk (auth) · Tailwind CSS.

### 1. Prerequisites

- Node.js 18+ and npm
- Convex account (`https://dashboard.convex.dev`)
- Clerk account (`https://clerk.com`)

### 2. Configure environment variables

Copy the example env file:

```bash
cp .env.local.example .env.local
```

Then fill in:

- `NEXT_PUBLIC_CONVEX_URL` – from Convex dashboard after creating a deployment.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` – from Clerk dashboard.
- `CLERK_JWT_ISSUER_DOMAIN` – from the Convex JWT template in Clerk (named `convex`).

### 3. Initialize Convex

From this project folder:

```bash
npx convex dev
```

This connects the `convex/` backend to your Convex deployment and generates the TypeScript files under `convex/_generated/`.

### 4. Run the app

In a separate terminal:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### 5. How the app is structured

- `convex/schema.ts` – Convex schema for users, conversations, messages, presence, typing, and read state.
- `convex/users.ts` – syncs Clerk users into Convex and powers the user search.
- `convex/conversations.ts` – creates and lists one‑on‑one conversations with unread counts.
- `convex/messages.ts` – sends and lists messages, and marks conversations as read.
- `convex/presence.ts` – online/offline tracking via periodic heartbeats.
- `convex/typing.ts` – typing indicators per conversation.
- `src/app/layout.tsx` – wraps the app with `ClerkProvider` and Convex client provider.
- `src/app/page.tsx` – top-level shell with header and the signed-in chat view.
- `src/components/chat/ChatShell.tsx` – main responsive chat UI (sidebar, mobile views, messaging).
- `src/components/CurrentUserSync.tsx` – keeps Convex user profile in sync with Clerk.
- `src/components/PresenceHeartbeat.tsx` – sends periodic heartbeat updates while the app is open.
- `src/lib/dates.ts` – formatting helper for message timestamps.

