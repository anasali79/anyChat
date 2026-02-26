# 🚀 AnyChat — Modern Real-Time Messaging Platform

AnyChat is a high-performance, real-time messaging application built with a modern tech stack. It delivers a seamless, end-to-end user experience featuring secure authentication, instant messaging, group dynamics, and real-time presence tracking.

![AnyChat Preview](https://via.placeholder.com/1200x600/7C5CFF/FFFFFF?text=AnyChat+Modern+Communication+Platform)

## ✨ Key Features

- ⚡ **Real-Time Communication**: Instant message delivery powered by Convex’s reactive database.
- 👥 **Group Dynamics**: Create group chats with custom names and member management.
- 🔒 **Secure Authentication**: Enterprise-grade security integrated via Clerk.
- 🟢 **Live Presence**: Track who's online/offline with real-time status indicators.
- ⌨️ **Typing Indicators**: Visual feedback when your contacts are composing messages.
- 💬 **Rich Messaging**: Support for soft deletions and message reactions (emojis).
- 📱 **Fully Responsive**: Stunning UI optimized for Desktop, Tablet, and Mobile.
- 🌗 **Premium Aesthetics**: Gradient-rich headers, smooth glassmorphism, and micro-animations.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Server Components)
- **Real-time Backend**: [Convex](https://www.convex.dev/) (Direct database-to-UI reactivity)
- **Authentication**: [Clerk](https://clerk.com/) (JWT-based secure authentication)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Programming**: [TypeScript](https://www.typescriptlang.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or later)
- **npm** or **pnpm**
- Accounts on **Convex** and **Clerk**

### 2. Environment Setup
Clone the repository and create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Fill in your secrets from the respective dashboards:
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Convex
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
CONVEX_DEPLOYMENT=...
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Running the Development Server

Start the Convex backend sync:
```bash
npx convex dev
```

In a separate terminal, start the Next.js frontend:
```bash
npm run dev
```
Visit `http://localhost:3000` to see AnyChat in action.

## 📁 Architecture Overview

- **`convex/`**: Contains the backend logic (schema, triggers, and functions).
    - `schema.ts`: Defines indices and tables for Users, Messages, and Presence.
    - `messages.ts`: Handles secure message delivery and reaction logic.
    - `presence.ts`: Manages real-time online status via heartbeats.
- **`src/components/chat/`**: High-fidelity UI components for the messaging experience.
- **`src/app/`**: Next.js App Router structure with integrated layout providers.

## 🌐 Deployment

### Deploy to Vercel
1. Push your code to GitHub.
2. Import the project in [Vercel](https://vercel.com/).
3. Add the **Convex Integration** to sync backend environment variables automatically.
4. Add your **Clerk** API keys to the Vercel Environment Variables.
5. Deploy!

## 📄 License
This project is for demonstration purposes. [MIT License](LICENSE) (if applicable).

---
*Built with ❤️ for the next generation of real-time communication.*
