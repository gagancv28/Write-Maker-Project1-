"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import PusherJS from "pusher-js";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender?: { id: string; name: string | null };
}

interface ChatPanelProps {
  assignmentId: string;
  currentUserId: string;
  currentUserName: string | null;
  receiverId: string | null;
  receiverName: string | null;
  receiverAvatarUrl: string | null;
  initialMessages: Message[];
}

export default function ChatPanel({
  assignmentId,
  currentUserId,
  currentUserName,
  receiverId,
  receiverName,
  receiverAvatarUrl,
  initialMessages,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const CHANNEL = `chat-room-${assignmentId}`;
  const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;

  // ── Pusher subscription (falls back to 3s polling without keys) ──────────
  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1";

    if (!pusherKey) {
      // Graceful fallback: poll every 3s while Pusher isn't configured yet
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/messages?assignmentId=${assignmentId}`);
          if (res.ok) setMessages(await res.json());
        } catch {}
      }, 3000);
      return () => clearInterval(interval);
    }

    // Create a fresh PusherJS instance inside the effect — avoids importing
    // pusher.ts (which includes the server-only 'pusher' Node.js package)
    const pusher = new PusherJS(pusherKey, { cluster });
    const channel = pusher.subscribe(CHANNEL);

    channel.bind("new-message", (data: Message) => {
      setMessages((prev) =>
        prev.some((m) => m.id === data.id) ? prev : [...prev, data]
      );
    });

    channel.bind("user-typing", () => {
      setIsTyping(true);
      if (typingClearRef.current) clearTimeout(typingClearRef.current);
      typingClearRef.current = setTimeout(() => setIsTyping(false), 2000);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNEL);
      pusher.disconnect();
    };
  }, [assignmentId, CHANNEL]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Typing indicator — debounced POST ────────────────────────────────────
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
    if (!pusherKey) return;
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    typingDebounceRef.current = setTimeout(() => {
      fetch("/api/pusher/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, senderName: currentUserName }),
      }).catch(() => {});
    }, 400);
  };

  // ── Send message → /api/messages (saves to DB + triggers Pusher) ─────────
  const sendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!draft.trim() || !receiverId || sending) return;

      const text = draft.trim();
      setSending(true);
      setDraft("");

      // Optimistic message
      const optimistic: Message = {
        id: `opt-${Date.now()}`,
        content: text,
        senderId: currentUserId,
        createdAt: new Date().toISOString(),
        sender: { id: currentUserId, name: currentUserName },
      };
      setMessages((prev) => [...prev, optimistic]);

      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text, assignmentId, receiverId }),
        });
        if (res.ok) {
          const saved: Message = await res.json();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === optimistic.id
                ? { ...saved, sender: { id: saved.senderId, name: currentUserName } }
                : m
            )
          );
        }
      } catch {}

      setSending(false);
    },
    [draft, receiverId, sending, assignmentId, currentUserId, currentUserName]
  );

  // ─────────────────────────────────────────────────────────────────────────
  const receiverInitials = receiverName
    ? receiverName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <section className="lg:col-span-3 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-blue-600 px-6 py-4 flex items-center gap-3">
        {receiverAvatarUrl ? (
          <img
            src={receiverAvatarUrl}
            alt={receiverName || ""}
            className="w-9 h-9 rounded-full object-cover border-2 border-white/30"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
            {receiverInitials}
          </div>
        )}
        <div>
          <p className="text-white font-semibold text-sm">
            {receiverName ? `Chat with ${receiverName}` : "Project Chat"}
          </p>
          <p className="text-blue-200 text-xs flex items-center gap-1">
            {pusherKey ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Live · Real-time
              </>
            ) : (
              <>{messages.length} message{messages.length !== 1 ? "s" : ""}</>
            )}
          </p>
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50 min-h-[320px] max-h-[420px]">
        {messages.length === 0 && !isTyping ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16 text-gray-400">
            <span className="text-4xl mb-3">✉️</span>
            <p className="font-medium text-sm">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation below</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
                    isMine
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                  }`}
                >
                  {!isMine && (
                    <p className="text-[10px] font-bold mb-1 opacity-60 uppercase tracking-wide">
                      {receiverName ?? "Unknown"}
                    </p>
                  )}
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 opacity-60 ${isMine ? "text-right" : "text-left"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* ── WhatsApp-style "..." typing indicator ────────────────────── */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm animate-pulse">
              <span className="text-gray-400 font-bold tracking-widest text-sm">...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* ── Input ────────────────────────────────────────────────────────── */}
      {receiverId ? (
        <form
          onSubmit={sendMessage}
          className="flex items-center gap-3 px-4 py-4 border-t border-gray-100 bg-white"
        >
          <input
            id="message-input"
            type="text"
            required
            autoComplete="off"
            placeholder="Type your message…"
            value={draft}
            onChange={handleTyping}
            disabled={sending}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 text-sm transition-all disabled:opacity-60"
          />
          <button
            id="send-message-btn"
            type="submit"
            disabled={sending || !draft.trim()}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            {sending ? "…" : "Send"}
          </button>
        </form>
      ) : (
        <div className="px-6 py-4 border-t bg-white text-sm text-gray-400 text-center">
          Waiting for the other party to join before you can chat.
        </div>
      )}
    </section>
  );
}
