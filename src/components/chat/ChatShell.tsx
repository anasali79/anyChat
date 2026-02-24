"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { SignedIn } from "@clerk/nextjs";
import { formatMessageTimestamp } from "@/lib/dates";

type ConversationSummary = {
  conversation: {
    _id: Id<"conversations">;
    isGroup: boolean;
    name?: string | null;
    memberIds: Id<"users">[];
    createdAt: number;
    updatedAt: number;
    lastMessageAt?: number | null;
  };
  members: { _id: Id<"users">; name: string; imageUrl: string }[];
  lastMessage:
    | {
        _id: Id<"messages">;
        conversationId: Id<"conversations">;
        senderId: Id<"users">;
        text: string;
        createdAt: number;
        deleted: boolean;
      }
    | null;
  unreadCount: number;
};

export function ChatShell() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    Id<"conversations"> | null
  >(null);
  const [search, setSearch] = useState("");

  const conversations = useQuery(api.conversations.listConversations, {}) as
    | ConversationSummary[]
    | undefined;
  const searchResults = useQuery(api.users.searchUsers, { search });
  const onlineUsers = useQuery(api.presence.onlineUsers, {});

  const selectedConversation = conversations?.find(
    (item) => item.conversation._id === selectedConversationId
  );
  const selectedMember = selectedConversation?.members[0] ?? null;

  const getOrCreateConversation = useMutation(
    api.conversations.getOrCreateDirectConversation
  );

  const handleOpenConversation = async (conversationId: Id<"conversations">) => {
    setSelectedConversationId(conversationId);
  };

  const handleStartConversationWithUser = async (userId: Id<"users">) => {
    const id = await getOrCreateConversation({ otherUserId: userId });
    setSelectedConversationId(id);
  };

  return (
    <SignedIn>
      <div className="mt-4 flex h-[calc(100vh-8.5rem)] flex-1 overflow-hidden">
        <div className="flex h-full w-full overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
          {/* Sidebar */}
          <aside className="hidden h-full w-72 flex-none border-r border-zinc-100 bg-[#F7F9FF] px-4 py-4 md:flex md:flex-col">
            <div className="mb-3">
              <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
                Messages
              </h2>
              <p className="text-xs text-zinc-500">
                Search chats and start a new one.
              </p>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name..."
              className="mb-3 w-full rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#7C5CFF] focus:ring-0"
            />

            <div className="flex-1 space-y-3 overflow-hidden">
              <div className="flex h-1/2 flex-col overflow-hidden">
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                  Your conversations
                </p>
                <div className="flex-1 overflow-y-auto rounded-2xl border border-zinc-100 bg-white">
                  {conversations === undefined && (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                      Loading conversations...
                    </div>
                  )}
                  {conversations && conversations.length === 0 && (
                    <div className="flex h-full items-center justify-center px-3 text-xs text-zinc-400">
                      No conversations yet. Start one from the user search
                      below.
                    </div>
                  )}
                  {conversations && conversations.length > 0 && (
                    <ul className="divide-y divide-zinc-100 text-sm">
                      {conversations.map((item: ConversationSummary) => (
                        <li
                          key={item.conversation._id}
                          className={`cursor-pointer px-3 py-2.5 transition hover:bg-[#EEF3FF] ${
                            selectedConversationId === item.conversation._id
                              ? "bg-[#E0EBFF]"
                              : ""
                          }`}
                          onClick={() =>
                            handleOpenConversation(item.conversation._id)
                          }
                        >
                          <ConversationListItem summary={item} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex h-1/2 flex-col overflow-hidden">
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                  All users
                </p>
                <div className="flex-1 overflow-y-auto rounded-2xl border border-zinc-100 bg-white">
                  {searchResults === undefined && (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                      Loading users...
                    </div>
                  )}
                  {searchResults && searchResults.length === 0 && (
                    <div className="flex h-full items-center justify-center px-3 text-xs text-zinc-400">
                      {search
                        ? "No users match your search."
                        : "No other users yet. Open the app in a second browser to start chatting."}
                    </div>
                  )}
                  {searchResults && searchResults.length > 0 && (
                    <ul className="divide-y divide-zinc-100 text-sm">
                      {searchResults.map((user: any) => (
                        <li
                          key={user._id}
                          className="flex cursor-pointer items-center justify-between px-3 py-2 transition hover:bg-[#EEF3FF]"
                          onClick={() => handleStartConversationWithUser(user._id)}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={user.imageUrl}
                              alt={user.name}
                              className="h-7 w-7 rounded-full object-cover"
                            />
                            <span className="text-sm text-zinc-800">
                              {user.name}
                            </span>
                          </div>
                          {onlineUsers?.some((id: Id<"users">) => id === user._id) && (
                            <span className="mr-2 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                          )}
                          <span className="text-[10px] uppercase tracking-wide text-sky-400">
                            Message
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile: list vs chat */}
          <div className="flex h-full flex-1 flex-col overflow-hidden md:hidden">
            {!selectedConversationId ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-zinc-100 bg-[#F7F9FF] p-3">
                  <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
                    Conversations
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Tap a user to start chatting.
                  </p>
                </div>
                <div className="p-3">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users by name..."
                    className="w-full rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#7C5CFF]"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3">
                  <div className="rounded-2xl border border-zinc-100 bg-white">
                    <p className="border-b border-zinc-100 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                      Your conversations
                    </p>
                    {conversations === undefined && (
                      <div className="flex h-24 items-center justify-center text-xs text-zinc-400">
                        Loading conversations...
                      </div>
                    )}
                    {conversations && conversations.length === 0 && (
                      <div className="flex h-24 items-center justify-center px-3 text-xs text-zinc-400">
                        No conversations yet. Start a new one from the users
                        list below.
                      </div>
                    )}
                    {conversations && conversations.length > 0 && (
                      <ul className="divide-y divide-zinc-100 text-sm">
                        {conversations.map((item: ConversationSummary) => (
                          <li
                            key={item.conversation._id}
                            className="cursor-pointer px-3 py-2.5 transition hover:bg-[#EEF3FF]"
                            onClick={() =>
                              handleOpenConversation(item.conversation._id)
                            }
                          >
                            <ConversationListItem summary={item} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="rounded-2xl border border-zinc-100 bg-white">
                    <p className="border-b border-zinc-100 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                      All users
                    </p>
                    {searchResults === undefined && (
                      <div className="flex h-24 items-center justify-center text-xs text-zinc-400">
                        Loading users...
                      </div>
                    )}
                    {searchResults && searchResults.length === 0 && (
                      <div className="flex h-24 items-center justify-center px-3 text-xs text-zinc-400">
                        {search
                          ? "No users match your search."
                          : "No other users yet. Open the app in a second browser to start chatting."}
                      </div>
                    )}
                    {searchResults && searchResults.length > 0 && (
                      <ul className="divide-y divide-zinc-100 text-sm">
                        {searchResults.map((user: any) => (
                          <li
                            key={user._id}
                            className="flex cursor-pointer items-center justify-between px-3 py-2 transition hover:bg-[#EEF3FF]"
                            onClick={() =>
                              handleStartConversationWithUser(user._id)
                            }
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={user.imageUrl}
                                alt={user.name}
                                className="h-7 w-7 rounded-full object-cover"
                              />
                              <span className="text-sm text-zinc-800">
                                {user.name}
                              </span>
                            </div>
                            {onlineUsers?.some((id: Id<"users">) => id === user._id) && (
                              <span className="mr-2 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                            )}
                            <span className="text-[10px] uppercase tracking-wide text-sky-400">
                              Message
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <ConversationView
                conversationId={selectedConversationId}
                headerUser={selectedMember}
                onBack={() => setSelectedConversationId(null)}
              />
            )}
          </div>

          {/* Desktop conversation view */}
          <div className="hidden h-full flex-1 flex-col overflow-hidden md:flex">
            {selectedConversationId ? (
              <ConversationView
                conversationId={selectedConversationId}
                headerUser={selectedMember}
                onBack={() => setSelectedConversationId(null)}
              />
            ) : (
              <div className="flex h-full flex-1 flex-col items-center justify-center bg-[#F4F6FB] px-6 text-center text-sm text-zinc-500">
                <p className="max-w-sm">
                  Select a conversation from the left or start a new chat to see
                  messages here.
                </p>
              </div>
            )}
          </div>

          {/* Right sidebar (profile / settings) – only when a chat is open */}
          {selectedMember && (
            <aside className="hidden h-full w-80 flex-none border-l border-zinc-100 bg-[#F9FAFF] px-4 py-4 lg:flex lg:flex-col">
              <div className="rounded-2xl bg-white p-4 shadow-[0_16px_50px_rgba(15,23,42,0.12)]">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedMember.imageUrl}
                    alt={selectedMember.name}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {selectedMember.name}
                    </p>
                    <p className="text-[11px] text-zinc-500">Direct message</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-500">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      onlineUsers?.some((id: Id<"users">) => id === selectedMember._id)
                        ? "bg-emerald-400"
                        : "bg-zinc-300"
                    }`}
                  />
                  <span>
                    {onlineUsers?.some((id: Id<"users">) => id === selectedMember._id)
                      ? "Active now"
                      : "Offline"}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm text-zinc-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Settings
                </p>
                <button className="flex w-full items-center justify-between rounded-xl bg-white px-3 py-2 text-left hover:bg-[#EEF3FF]">
                  <span>Search in chat</span>
                </button>
                <button className="flex w-full items-center justify-between rounded-xl bg-white px-3 py-2 text-left hover:bg-[#FFEFF0]">
                  <span className="text-red-500">Block user</span>
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>
    </SignedIn>
  );
}

function ConversationListItem({ summary }: { summary: ConversationSummary }) {
  const other = summary.members[0];
  const lastText =
    summary.lastMessage?.text ??
    (summary.lastMessage?.deleted ? "This message was deleted" : null);

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        {other ? (
          <img
            src={other.imageUrl}
            alt={other.name}
            className="h-8 w-8 flex-none rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 flex-none rounded-full bg-zinc-200" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-900">
          {other?.name ?? "Unknown user"}
        </p>
        <p className="truncate text-xs text-zinc-500">
          {lastText ?? "No messages yet"}
        </p>
      </div>
      {summary.unreadCount > 0 && (
        <span className="ml-1 inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-[#2F6BFF] px-1 text-[10px] font-semibold text-white">
          {summary.unreadCount}
        </span>
      )}
    </div>
  );
}

function ConversationView({
  conversationId,
  headerUser,
  onBack,
}: {
  conversationId: Id<"conversations">;
  headerUser: { name: string; imageUrl: string } | null;
  onBack: () => void;
}) {
  const messages = useQuery(api.messages.listMessages, {
    conversationId,
  });
  const typingUsers = useQuery(api.typing.typingForConversation, {
    conversationId,
  });
  const markRead = useMutation(api.messages.markConversationRead);
  const setTyping = useMutation(api.typing.setTyping);
  const sendMessage = useMutation(api.messages.sendMessage);
  const [input, setInput] = useState("");
  const [isNearBottom, setIsNearBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastMessageCountRef = useRef(0);

  const hasNewMessages =
    (messages?.length ?? 0) > lastMessageCountRef.current && !isNearBottom;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const nearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        64;
      setIsNearBottom(nearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !messages) return;

    if (isNearBottom) {
      container.scrollTop = container.scrollHeight;
      lastMessageCountRef.current = messages.length;
    }
  }, [messages, isNearBottom]);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    void markRead({ conversationId });
  }, [messages, conversationId, markRead]);

  // const handleSend = async () => {
  //   const text = input.trim();
  //   if (!text) return;
  //   await sendMessage({ conversationId, text });
  //   void setTyping({ conversationId, isTyping: false });
  //   setInput("");
  // };


  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
  
    try {
      const result = await sendMessage({ conversationId, text });
      console.log("Message sent result:", result);
      void setTyping({ conversationId, isTyping: false });
      setInput("");
    } catch (err) {
      console.error("sendMessage error", err);
      alert("Send failed: " + (err as Error).message);
    }
  };

  return (
    <div className="relative flex h-full flex-1 flex-col bg-[#F4F6FB]">
      <div className="flex items-center justify-between border-b border-zinc-100 bg-white px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 text-xs text-zinc-500 hover:bg-zinc-100 sm:hidden"
          >
            ←
          </button>
          <div className="flex items-center gap-2">
            {headerUser ? (
              <>
                <img
                  src={headerUser.imageUrl}
                  alt={headerUser.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold tracking-tight text-zinc-900">
                    {headerUser.name}
                  </p>
                  <p className="text-xs text-zinc-500">Direct message</p>
                </div>
              </>
            ) : (
              <div>
                <p className="text-sm font-semibold tracking-tight text-zinc-900">
                  Conversation
                </p>
                <p className="text-xs text-zinc-500">
                  Messages update in real time.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="hidden items-center gap-3 text-zinc-400 sm:flex">
          <span className="h-8 w-8 rounded-full bg-zinc-100" />
          <span className="h-8 w-8 rounded-full bg-zinc-100" />
          <span className="h-8 w-8 rounded-full bg-zinc-100" />
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages === undefined && (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500">
            Loading messages...
          </div>
        )}
        {messages && messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500">
            No messages yet. Say hi 👋
          </div>
        )}
        {messages &&
          messages.map(
            ({
              message,
              sender,
              isOwn,
            }: {
              message: {
                _id: Id<"messages">;
                text: string;
                deleted: boolean;
                createdAt: number;
              };
              sender: { imageUrl: string; name: string } | null;
              isOwn: boolean;
            }) => (
            // Each message bubble / document card
            <div
              key={message._id}
              className={`flex gap-2 ${
                isOwn ? "justify-end" : "justify-start"
              }`}
            >
              {!isOwn && sender && (
                <img
                  src={sender.imageUrl}
                  alt={sender.name}
                  className="mt-0.5 h-7 w-7 rounded-full object-cover"
                />
              )}
              <div className="flex max-w-xs flex-col gap-1 sm:max-w-md">
                {message.deleted ? (
                  <div className="rounded-2xl bg-white px-3 py-2 text-sm text-zinc-400 shadow-sm">
                    <span className="italic">This message was deleted</span>
                  </div>
                ) : isDocumentMessage(message.text) ? (
                  <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 text-xs text-zinc-800 shadow-sm">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#EEF3FF] text-[#2F6BFF]">
                      📄
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">
                        {getDocumentName(message.text)}
                      </p>
                      {isOwn && (
                        <p className="mt-0.5 text-[11px] text-zinc-500">
                          You shared a document
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm ${
                      isOwn
                        ? "rounded-br-sm bg-[#2F6BFF] text-white shadow-sm"
                        : "rounded-bl-sm bg-white text-zinc-800 shadow-sm"
                    }`}
                  >
                    <p className="break-words">{message.text}</p>
                  </div>
                )}
                <span className="px-1 text-[10px] text-zinc-500">
                  {formatMessageTimestamp(message.createdAt)}
                </span>
              </div>
            </div>
          ))}
      </div>

      {hasNewMessages && (
        <button
          onClick={() => {
            const container = scrollRef.current;
            if (!container) return;
            container.scrollTop = container.scrollHeight;
            lastMessageCountRef.current = messages?.length ?? 0;
          }}
          className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 rounded-full bg-zinc-900/80 px-3 py-1 text-xs text-white shadow-md shadow-black/30 ring-1 ring-zinc-800 hover:bg-zinc-900"
        >
          ↓ New messages
        </button>
      )}

      {typingUsers && typingUsers.length > 0 && (
        <div className="px-4 pb-1 text-[11px] text-zinc-500">
          {typingUsers.length === 1 ? (
            <span>{typingUsers[0].name} is typing…</span>
          ) : (
            <span>Several people are typing…</span>
          )}
        </div>
      )}

      <div className="border-t border-zinc-200 bg-white px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              void setTyping({ conversationId, isTyping: true });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder="Type a message..."
            className="max-h-28 flex-1 resize-none rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#2F6BFF]"
          />
          <button
            onClick={handleSend}
            className="inline-flex h-10 items-center rounded-full bg-[#2F6BFF] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2556D2] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function isDocumentMessage(text: string) {
  const cleaned = text.trim().toLowerCase().split(/[?#]/)[0];
  return /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|csv|zip|rar|txt)$/.test(cleaned);
}

function getDocumentName(text: string) {
  const withoutQuery = text.split(/[?#]/)[0];
  const parts = withoutQuery.split("/");
  const last = parts[parts.length - 1] || "Document";
  return last;
}

