"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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

type HeaderInfo =
  | { kind: "direct"; user: { _id: Id<"users">; name: string; imageUrl: string } }
  | { kind: "group"; name: string; members: { _id: Id<"users">; name: string; imageUrl: string }[] }
  | { kind: "none" };

export function ChatShell({
  search,
  isGroupModalOpen,
  setIsGroupModalOpen,
}: {
  search: string;
  isGroupModalOpen: boolean;
  setIsGroupModalOpen: (open: boolean) => void;
}) {
  const [selectedConversationId, setSelectedConversationId] = useState<
    Id<"conversations"> | null
  >(null);
  const [groupName, setGroupName] = useState("");
  const [groupSelectedIds, setGroupSelectedIds] = useState<Id<"users">[]>([]);
  const [showRightPanel, setShowRightPanel] = useState(false);

  const blockedUserIds = useQuery(api.users.getBlockedUsers) ?? [];
  const toggleBlockMutation = useMutation(api.users.toggleBlock);

  const conversations = useQuery(api.conversations.listConversations, {}) as
    | ConversationSummary[]
    | undefined;
  const searchResults = useQuery(api.users.searchUsers, { search });
  const onlineUsers = useQuery(api.presence.onlineUsers, {});

  const selectedConversation = conversations?.find(
    (item) => item.conversation._id === selectedConversationId
  );

  const headerInfo: HeaderInfo = useMemo(() => {
    if (!selectedConversation) return { kind: "none" };
    if (selectedConversation.conversation.isGroup) {
      return {
        kind: "group",
        name: selectedConversation.conversation.name ?? "Group chat",
        members: selectedConversation.members,
      };
    }
    return selectedConversation.members[0]
      ? { kind: "direct", user: selectedConversation.members[0] }
      : { kind: "none" };
  }, [selectedConversation]);

  const deleteMessage = useMutation(api.messages.softDeleteMessage);
  const toggleReaction = useMutation(api.messages.toggleReaction);

  const getOrCreateConversation = useMutation(
    api.conversations.getOrCreateDirectConversation
  );
  const createGroupConversation = useMutation(
    api.conversations.createGroupConversation
  );
  const leaveGroupMutation = useMutation(api.conversations.leaveGroup);
  const deleteConvMutation = useMutation(api.conversations.deleteConversation);

  const handleOpenConversation = async (conversationId: Id<"conversations">) => {
    setSelectedConversationId(conversationId);
  };

  const handleStartConversationWithUser = async (userId: Id<"users">) => {
    const id = await getOrCreateConversation({ otherUserId: userId });
    setSelectedConversationId(id);
  };

  const handleLeaveGroup = async (conversationId: Id<"conversations">) => {
    if (!confirm("Are you sure you want to leave this group?")) return;
    await leaveGroupMutation({ conversationId });
    if (selectedConversationId === conversationId) setSelectedConversationId(null);
  };

  const handleDeleteConversation = async (conversationId: Id<"conversations">) => {
    if (!confirm("Are you sure you want to delete this conversation for everyone?")) return;
    await deleteConvMutation({ conversationId });
    if (selectedConversationId === conversationId) setSelectedConversationId(null);
  };

  const filteredUsers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const list = (searchResults ?? []) as any[];
    if (!needle) return list;
    return list.filter((u) =>
      (u.name ?? "").toLowerCase().includes(needle)
    );
  }, [search, searchResults]);

  const handleCreateGroup = async () => {
    const name = groupName.trim() || "Group chat";
    const memberIds = groupSelectedIds;
    if (memberIds.length < 2) return;
    const id = await createGroupConversation({ name, memberIds });
    setIsGroupModalOpen(false);
    setGroupName("");
    setGroupSelectedIds([]);
    setSelectedConversationId(id);
  };

  return (
    <SignedIn>
      <div className="mt-4 flex min-h-0 flex-1 overflow-hidden pb-4 px-2 sm:px-3">
        <div className="flex h-full w-full overflow-hidden rounded-[32px] border border-white/40 bg-white/70 backdrop-blur-2xl shadow-[0_32px_120px_rgba(15,23,42,0.15)] ring-1 ring-zinc-200/50 relative">
          {/* Sidebar */}
          <aside className={`${selectedConversationId ? "hidden" : "flex"} h-full w-full flex-none flex-col border-r border-zinc-100 bg-zinc-50/50 px-4 py-3 md:flex md:w-80 md:flex-col scale-100 opacity-100 transition-all`}>
            {/* Sidebar header removed as requested, moved to global header */}

            <div className="flex-1 flex flex-col min-h-0 space-y-6 overflow-y-auto pr-1 custom-scrollbar">
              <div className="flex flex-col flex-none min-h-[300px]">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
                  Your conversations
                </p>
                <div className="flex-1 overflow-y-auto rounded-3xl border border-zinc-100 bg-white/50 shadow-sm">
                  {conversations === undefined && (
                    <div className="flex flex-col gap-3 p-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                          <div className="h-11 w-11 rounded-[18px] bg-zinc-100" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-24 bg-zinc-100 rounded" />
                            <div className="h-3 w-40 bg-zinc-50 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {conversations && conversations.length === 0 && (
                    <div className="flex h-32 items-center justify-center px-6 text-center text-xs text-zinc-400">
                      No conversations yet. Start one from the user search below.
                    </div>
                  )}
                  {conversations && conversations.length > 0 && (
                    <ul className="divide-y divide-zinc-50 text-sm">
                      {conversations.map((item: ConversationSummary) => (
                        <li
                          key={item.conversation._id}
                          className={`group/item cursor-pointer px-4 py-3.5 transition-all hover:bg-white ${selectedConversationId === item.conversation._id ? "bg-white shadow-sm ring-1 ring-zinc-200" : ""}`}
                          onClick={() => handleOpenConversation(item.conversation._id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="min-w-0 flex-1">
                              <ConversationListItem summary={item} isActive={selectedConversationId === item.conversation._id} />
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteConversation(item.conversation._id); }}
                              className="opacity-0 transition-opacity group-hover/item:opacity-100 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                              title="Delete conversation"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex flex-col flex-none min-h-[300px] pb-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
                  All users
                </p>
                <div className="flex-1 overflow-y-auto rounded-3xl border border-zinc-100 bg-white/50 shadow-sm">
                  {searchResults === undefined && (
                    <div className="flex flex-col gap-3 p-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                          <div className="h-10 w-10 rounded-2xl bg-zinc-100" />
                          <div className="h-4 w-32 bg-zinc-100 rounded" />
                        </div>
                      ))}
                    </div>
                  )}
                  {filteredUsers && filteredUsers.length > 0 && (
                    <ul className="divide-y divide-zinc-50 text-sm">
                      {filteredUsers.map((user: any) => (
                        <li
                          key={user._id}
                          className="flex cursor-pointer items-center justify-between px-4 py-3 transition-all hover:bg-white active:scale-[0.98]"
                          onClick={() => handleStartConversationWithUser(user._id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img src={user.imageUrl} alt={user.name} className="h-10 w-10 rounded-2xl object-cover shadow-sm ring-2 ring-white" />
                              {onlineUsers?.some((id: Id<"users">) => id === user._id) && (
                                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-emerald-500 shadow-sm" />
                              )}
                            </div>
                            <span className="text-sm font-bold text-zinc-900">{user.name}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {isGroupModalOpen && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-zinc-900">Create New Group</h3>
                  <button onClick={() => setIsGroupModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">✕</button>
                </div>
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group Name"
                  className="w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-[#7C5CFF]"
                />
                <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
                  {(searchResults ?? []).map((u: any) => (
                    <label key={u._id} className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={groupSelectedIds.includes(u._id)}
                        onChange={() => setGroupSelectedIds(prev => prev.includes(u._id) ? prev.filter(id => id !== u._id) : [...prev, u._id])}
                        className="rounded border-zinc-300 text-[#7C5CFF] focus:ring-[#7C5CFF]"
                      />
                      <img src={u.imageUrl} className="h-8 w-8 rounded-full object-cover" />
                      <span className="text-sm font-medium">{u.name}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setIsGroupModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-100 font-bold text-zinc-600">Cancel</button>
                  <button
                    disabled={groupSelectedIds.length < 2}
                    onClick={handleCreateGroup}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#7C5CFF] font-bold text-white disabled:opacity-50 shadow-lg shadow-[#7C5CFF]/25"
                  >
                    Create Group
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={`${selectedConversationId ? "flex" : "hidden"} h-full flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out md:flex`}>
            {selectedConversationId ? (
              <ConversationView
                conversationId={selectedConversationId}
                headerInfo={headerInfo}
                onDelete={deleteMessage}
                onToggleReaction={toggleReaction}
                onBack={() => setSelectedConversationId(null)}
                isBlocked={headerInfo.kind === "direct" && blockedUserIds.includes(headerInfo.user._id)}
                onToggleBlock={async () => {
                  if (headerInfo.kind === "direct") {
                    await toggleBlockMutation({ otherUserId: headerInfo.user._id });
                  }
                }}
                onLeaveGroup={() => handleLeaveGroup(selectedConversationId)}
                onDeleteConversation={() => handleDeleteConversation(selectedConversationId)}
                onlineUsers={onlineUsers}
                showRightPanel={showRightPanel}
                onToggleRightPanel={() => setShowRightPanel(p => !p)}
              />
            ) : (
              <div className="flex h-full flex-1 flex-col items-center justify-center bg-zinc-50/10 p-6 text-center">
                <div className="mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-white shadow-xl ring-1 ring-zinc-100">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Select a conversation</h3>
                <p className="mt-2 max-w-[280px] text-sm text-zinc-500 leading-relaxed">Choose a contact from the sidebar to start your secure end-to-end encrypted chat.</p>
              </div>
            )}
          </div>

          {headerInfo.kind !== "none" && (
            <aside className={`fixed inset-y-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-l border-zinc-100 transition-all duration-300 ease-in-out md:relative md:bg-zinc-50/50 ${showRightPanel ? "w-full md:w-80 translate-x-0 opacity-100" : "w-0 translate-x-full opacity-0 pointer-events-none md:pointer-events-none md:translate-x-0"}`}>
              <div className="h-full px-5 py-6 overflow-y-auto flex flex-col">
                <div className="flex justify-end md:hidden mb-4">
                  <button onClick={() => setShowRightPanel(false)} className="p-2 text-zinc-400 hover:text-zinc-600">✕</button>
                </div>
                <div className="rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] ring-1 ring-zinc-200/50">
                  {headerInfo.kind === "direct" ? (
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        <img src={headerInfo.user.imageUrl} className="h-24 w-24 rounded-[32px] object-cover shadow-xl ring-4 ring-white" />
                        {onlineUsers?.some(id => id === headerInfo.user._id) && (
                          <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white bg-emerald-500 shadow-sm" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900">{headerInfo.user.name}</h3>
                      <p className="mt-1 text-xs font-medium text-zinc-500">{onlineUsers?.some(id => id === headerInfo.user._id) ? "Available" : "Not active"}</p>
                    </div>
                  ) : headerInfo.kind === "group" ? (
                    <div className="text-center">
                      <div className="mb-4 flex h-16 w-16 mx-auto place-items-center justify-center rounded-[20px] bg-gradient-to-br from-[#7C5CFF] to-[#A78BFA] text-2xl font-bold text-white shadow-lg">
                        {headerInfo.name.charAt(0)}
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900">{headerInfo.name}</h3>
                      <p className="text-xs text-zinc-500">{headerInfo.members.length + 1} members</p>
                      <div className="mt-6 flex -space-x-2 justify-center">
                        {headerInfo.members.slice(0, 5).map(m => (
                          <img key={m._id} src={m.imageUrl} className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-zinc-100" />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-8 space-y-4">
                  <p className="px-1 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Settings</p>
                  <div className="space-y-2">
                    {headerInfo.kind === "direct" ? (
                      <button
                        onClick={async () => {
                          await toggleBlockMutation({ otherUserId: headerInfo.user._id });
                        }}
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold uppercase tracking-tight transition-all active:scale-[0.98] ${blockedUserIds.includes(headerInfo.user._id) ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" : "bg-red-50 text-red-500 ring-1 ring-red-100"}`}
                      >
                        <span>{blockedUserIds.includes(headerInfo.user._id) ? "Unblock Contact" : "Block Contact"}</span>
                      </button>
                    ) : headerInfo.kind === "group" ? (
                      <>
                        <button onClick={() => handleLeaveGroup(selectedConversationId!)} className="flex w-full items-center justify-between rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold uppercase tracking-tight text-amber-600 ring-1 ring-amber-100 hover:shadow-md">
                          <span>Leave Group</span>
                        </button>
                        <button onClick={() => handleDeleteConversation(selectedConversationId!)} className="flex w-full items-center justify-between rounded-2xl bg-red-50 px-4 py-3 text-xs font-bold uppercase tracking-tight text-red-500 ring-1 ring-red-100 hover:shadow-md">
                          <span>Delete Group</span>
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </SignedIn>
  );
}

function ConversationListItem({ summary, isActive }: { summary: ConversationSummary; isActive?: boolean }) {
  const other = summary.members[0];
  const lastText = summary.lastMessage?.text ?? (summary.lastMessage?.deleted ? "Deleted message" : null);
  const title = summary.conversation.isGroup ? summary.conversation.name ?? "Group chat" : other?.name ?? "User";
  const subtitle = summary.conversation.isGroup ? `${summary.members.length + 1} members` : lastText ?? "No messages";

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        {!summary.conversation.isGroup && other ? (
          <img src={other.imageUrl} className={`h-11 w-11 rounded-[18px] border-2 object-cover shadow-sm ring-1 ring-zinc-200/50 ${isActive ? 'scale-105 border-white ring-[#7C5CFF]/30' : 'border-white'}`} />
        ) : (
          <div className="h-11 w-11 rounded-[18px] bg-gradient-to-br from-[#7C5CFF] to-[#A78BFA] flex items-center justify-center font-bold text-white text-xs shadow-md">{title.charAt(0)}</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <p className={`truncate text-sm font-bold ${isActive ? 'text-[#7C5CFF]' : 'text-zinc-900'}`}>{title}</p>
          {summary.lastMessage && <span className="text-[10px] text-zinc-400 font-medium whitespace-nowrap">{formatMessageTimestamp(summary.lastMessage.createdAt)}</span>}
        </div>
        <div className="flex items-center justify-between">
          <p className={`truncate text-xs ${isActive ? 'text-zinc-600 font-medium' : 'text-zinc-500'}`}>{subtitle}</p>
          {summary.unreadCount > 0 && (
            <span className="h-5 min-w-[20px] rounded-full bg-[#7C5CFF] text-[10px] font-bold text-white flex items-center justify-center px-1 shadow-lg shadow-[#7C5CFF]/30">{summary.unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationView({
  conversationId, headerInfo, onDelete, onToggleReaction, onBack, isBlocked, onToggleBlock, onLeaveGroup, onDeleteConversation, onlineUsers, showRightPanel, onToggleRightPanel
}: {
  conversationId: Id<"conversations">; headerInfo: HeaderInfo; onDelete: any; onToggleReaction: any; onBack: () => void; isBlocked: boolean; onToggleBlock: () => void; onLeaveGroup: () => void; onDeleteConversation: () => void; onlineUsers: any; showRightPanel: boolean; onToggleRightPanel: () => void;
}) {
  const messages = useQuery(api.messages.listMessages, { conversationId });
  const typingUsers = useQuery(api.typing.typingForConversation, { conversationId });
  const markRead = useMutation(api.messages.markConversationRead);
  const setTyping = useMutation(api.typing.setTyping);
  const sendMessage = useMutation(api.messages.sendMessage);
  const [input, setInput] = useState("");
  const [emojiBarFor, setEmojiBarFor] = useState<Id<"messages"> | null>(null);
  const [menuFor, setMenuFor] = useState<Id<"messages"> | null>(null);
  const [showHoverControls, setShowHoverControls] = useState<Id<"messages"> | null>(null);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isTouchDevice = () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const [showNewMessageButton, setShowNewMessageButton] = useState(false);
  const prevMessagesCount = useRef(messages?.length ?? 0);

  const blockStatus = useQuery(api.users.checkIfBlocked,
    headerInfo.kind === "direct" ? { otherUserId: headerInfo.user._id } : "skip"
  );

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const handleScroll = () => setIsNearBottom(container.scrollHeight - container.scrollTop - container.clientHeight < 64);
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isNearBottom && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isNearBottom]);

  useEffect(() => {
    if (messages?.length) void markRead({ conversationId });
  }, [messages, conversationId, markRead]);

  useEffect(() => {
    if (messages && messages.length > prevMessagesCount.current) {
      if (!isNearBottom) {
        setShowNewMessageButton(true);
      }
    }
    prevMessagesCount.current = messages?.length ?? 0;
  }, [messages, isNearBottom]);

  useEffect(() => {
    if (isNearBottom) {
      setShowNewMessageButton(false);
    }
  }, [isNearBottom]);

  const handleSend = async () => {
    try {
      if (input.trim()) {
        await sendMessage({ conversationId, text: input.trim(), ...(replyTo ? { replyToId: replyTo.id } : {}) });
      }
      setInput("");
      setReplyTo(null);
      void setTyping({ conversationId, isTyping: false });
    } catch (e) {
      console.error(e);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="relative flex h-full flex-1 flex-col bg-zinc-50/50 overflow-hidden transition-all duration-300">
      <div className="flex h-[72px] items-center justify-between border-b border-zinc-100 bg-white/80 px-4 py-3 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-100 md:hidden">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div className="flex items-center gap-3">
            {headerInfo.kind === "direct" ? (
              <>
                <div className="relative">
                  <img src={headerInfo.user.imageUrl} className="h-10 w-10 rounded-2xl object-cover ring-2 ring-white shadow-sm" />
                  <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-white shadow-sm ${onlineUsers?.some((id: any) => id === headerInfo.user._id) ? "bg-emerald-500" : "bg-zinc-300"}`} />
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight text-zinc-900">{headerInfo.user.name}</p>
                  <p className={`text-[11px] font-bold uppercase tracking-widest ${onlineUsers?.some((id: any) => id === headerInfo.user._id) ? "text-emerald-500" : "text-zinc-400"}`}>
                    {onlineUsers?.some((id: any) => id === headerInfo.user._id) ? "Online" : "Offline"}
                  </p>
                </div>
              </>
            ) : headerInfo.kind === "group" ? (
              <>
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#7C5CFF] to-[#A78BFA] text-xs font-bold text-white shadow-md">{headerInfo.name.charAt(0)}</div>
                <div>
                  <p className="text-sm font-bold tracking-tight text-zinc-900">{headerInfo.name}</p>
                  <p className="text-[11px] font-medium text-zinc-500">{headerInfo.members.length + 1} members</p>
                </div>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-2">
            {headerInfo.kind === "group" ? (
              <div className="flex items-center gap-2">
                <button onClick={onLeaveGroup} className="rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors">Leave</button>
                <button onClick={onDeleteConversation} className="rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-50 hover:bg-red-100 transition-colors">Delete</button>
              </div>
            ) : (
              <button onClick={onToggleBlock} className={`rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${isBlocked ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                {isBlocked ? "Unblock" : "Block"}
              </button>
            )}
          </div>
          <button
            onClick={onToggleRightPanel}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 transition-all ${showRightPanel ? "bg-[#7C5CFF] text-white border-[#7C5CFF]" : "bg-white text-zinc-500 hover:bg-zinc-50"}`}
            title={showRightPanel ? "Hide Details" : "Show Details"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-6 transition-all duration-300"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onClick={() => { setShowHoverControls(null); setEmojiBarFor(null); setMenuFor(null); }}
      >
        {messages === undefined && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : "flex-row"} animate-pulse`}>
                <div className="h-8 w-8 rounded-xl bg-zinc-100" />
                <div className={`h-12 w-48 rounded-[24px] bg-zinc-100 ${i % 2 === 0 ? "rounded-tr-lg" : "rounded-tl-lg"}`} />
              </div>
            ))}
          </div>
        )}
        {messages?.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in duration-700">
            <div className="w-16 h-16 rounded-full bg-[#7C5CFF]/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </div>
            <div className="space-y-1">
              <p className="text-zinc-900 font-bold">You don’t have any conversations yet</p>
              <p className="text-zinc-500 text-sm">Send a message to start a conversation</p>
            </div>
          </div>
        )}
        {messages?.map(({ message, sender, isOwn, reactions, replyTo: replyToData }) => {
          const showControls = showHoverControls === message._id;
          const isSystemMessage = message.text.includes("has left the group.");

          if (isSystemMessage) {
            return (
              <div key={message._id} className="flex justify-center my-4 animate-in fade-in zoom-in duration-500">
                <div className="px-4 py-1.5 rounded-full bg-zinc-100/80 backdrop-blur-sm border border-zinc-200/50 text-[11px] font-bold text-zinc-500 uppercase tracking-widest shadow-sm">
                  {message.text}
                </div>
              </div>
            );
          }

          return (
            <div
              key={message._id}
              onMouseEnter={() => !isTouchDevice() && setShowHoverControls(message._id)}
              onMouseLeave={() => !isTouchDevice() && setShowHoverControls(null)}
              onClick={(e) => { if (isTouchDevice()) { e.stopPropagation(); setShowHoverControls(p => p === message._id ? null : message._id); } }}
              className={`group relative flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {!isOwn && sender && (
                <div className="flex-none pt-1">
                  <img src={sender.imageUrl} className="h-8 w-8 rounded-xl object-cover shadow-sm ring-1 ring-zinc-200/50" />
                </div>
              )}

              <div className={`flex flex-col gap-1 max-w-[80%] ${isOwn ? "items-end" : "items-start"}`}>
                {sender && !isOwn && <span className="px-2 text-[10px] font-bold text-[#7C5CFF] uppercase tracking-widest">{sender.name}</span>}

                <div className={`relative flex items-center gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`relative px-4 py-3 rounded-[24px] shadow-sm ring-1 ${isOwn ? "bg-gradient-to-br from-[#7C5CFF] to-[#947DFF] text-white ring-[#7C5CFF]/10 rounded-tr-lg" : "bg-white text-zinc-900 ring-zinc-200/50 rounded-tl-lg"}`}>
                    {replyToData && !message.deleted && (
                      <div className={`mb-2 p-2 rounded-xl text-[11px] border-l-4 ${isOwn ? "bg-white/10 border-white/50 text-white/90" : "bg-zinc-50 border-[#7C5CFF] text-zinc-600"}`}>
                        <p className="font-bold text-[10px] mb-0.5">{replyToData.senderName}</p>
                        <p className="line-clamp-1 opacity-80 italic">{replyToData.text}</p>
                      </div>
                    )}

                    {message.deleted ? (
                      <span className="text-[13px] italic opacity-60">This message was deleted</span>
                    ) : (
                      <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">{message.text}</p>
                    )}

                    <div className={`mt-1.5 flex justify-end text-[9px] font-bold opacity-60`}>
                      {formatMessageTimestamp(message.createdAt)}
                    </div>
                  </div>

                  <div className={`flex flex-col gap-1 transition-all ${showControls ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"} ${!isTouchDevice() && "group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto"}`}>
                    <button onClick={(e) => { e.stopPropagation(); setEmojiBarFor(message._id); }} className="h-7 w-7 rounded-xl bg-white shadow-md ring-1 ring-zinc-100 flex items-center justify-center text-xs">😊</button>
                    <button onClick={(e) => { e.stopPropagation(); setMenuFor(message._id); }} className="h-7 w-7 rounded-xl bg-white shadow-md ring-1 ring-zinc-100 flex items-center justify-center text-zinc-400"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg></button>
                  </div>

                  {emojiBarFor === message._id && (
                    <div className={`absolute -top-10 z-30 flex items-center gap-1 rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-zinc-200 ${isOwn ? "right-0" : "left-0"}`}>
                      {(["👍", "❤️", "😂", "😮", "😢"] as const).map(emoji => (
                        <button key={emoji} onClick={(e) => { e.stopPropagation(); onToggleReaction({ messageId: message._id, emoji }); setEmojiBarFor(null); }} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-[#7C5CFF]/10 text-lg transition-transform hover:scale-125">{emoji}</button>
                      ))}
                    </div>
                  )}

                  {menuFor === message._id && (
                    <div className={`absolute z-30 w-32 bg-white rounded-2xl shadow-2xl ring-1 ring-zinc-200 overflow-hidden top-12 ${isOwn ? "right-0" : "left-0"}`}>
                      <button onClick={(e) => { e.stopPropagation(); setReplyTo({ id: message._id, text: message.text, senderName: sender?.name }); setMenuFor(null); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-zinc-50">Reply</button>
                      {isOwn && <button onClick={(e) => { e.stopPropagation(); onDelete({ messageId: message._id }); setMenuFor(null); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50">Delete</button>}
                    </div>
                  )}
                </div>

                {reactions?.length > 0 && (() => {
                  const counts: Record<string, number> = {};
                  for (const r of reactions) counts[r.emoji] = (counts[r.emoji] ?? 0) + 1;
                  return (
                    <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                      {Object.entries(counts).map(([emoji, count]) => (
                        <button key={emoji} onClick={() => onToggleReaction({ messageId: message._id, emoji })} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white text-[11px] font-bold ring-1 ring-zinc-100 shadow-sm hover:ring-zinc-200"><span>{emoji}</span><span className="opacity-60 text-[9px]">{count}</span></button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {showNewMessageButton && (
        <button
          onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#7C5CFF] shadow-xl ring-1 ring-zinc-100 transition-all hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-4"
        >
          <span>↓ New messages</span>
        </button>
      )}

      <div className="px-4 pb-2">
        {typingUsers && typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#7C5CFF] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-[#7C5CFF] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-[#7C5CFF] rounded-full animate-bounce"></span>
            </div>
            <p className="text-[10px] font-bold text-[#7C5CFF] uppercase tracking-widest">
              {typingUsers.length === 1
                ? `${typingUsers[0].name} is typing...`
                : "Multiple people typing..."}
            </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-zinc-100">
        {replyTo && (
          <div className="mb-3 flex items-center justify-between bg-[#7C5CFF]/10 px-4 py-3 rounded-2xl animate-in slide-in-from-bottom-2">
            <div><p className="text-[10px] font-bold text-[#7C5CFF] uppercase tracking-widest leading-none mb-1">Replying to {replyTo.senderName}</p><p className="text-xs text-zinc-600 line-clamp-1">{replyTo.text}</p></div>
            <button onClick={() => setReplyTo(null)} className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-zinc-400 hover:text-red-500">✕</button>
          </div>
        )}
        <div className="flex items-end gap-3 p-2 bg-white rounded-[32px] ring-1 ring-zinc-200/60 shadow-sm focus-within:ring-[#7C5CFF]/30 transition-all relative overflow-hidden">
          {blockStatus?.amIBlocked ? (
            <div className="flex-1 py-4 px-6 text-center text-sm font-medium text-zinc-500 bg-zinc-50 rounded-[24px]">
              You can't send messages because you have been blocked.
            </div>
          ) : blockStatus?.didIBlock ? (
            <div className="flex-1 py-4 px-6 text-center text-sm font-medium text-zinc-500 bg-zinc-50 rounded-[24px]">
              You blocked this contact. Unblock to send a message.
            </div>
          ) : (
            <>
              <textarea
                value={input}
                onChange={(e) => { setInput(e.target.value); void setTyping({ conversationId, isTyping: e.target.value.length > 0 }); }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type your message..."
                className="flex-1 min-h-[48px] max-h-40 bg-transparent py-3 px-2 text-sm outline-none resize-none"
                rows={1}
              />
              <button onClick={handleSend} disabled={!input.trim()} className={`h-12 w-12 flex items-center justify-center rounded-2xl transition-all ${input.trim() ? "bg-[#7C5CFF] text-white shadow-lg" : "bg-zinc-100 text-zinc-400"}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}



