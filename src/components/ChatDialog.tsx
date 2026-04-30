"use client";

import { useState, useEffect, useRef } from "react";
import PusherJS from "pusher-js";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

export default function ChatDialog({
  assignmentId,
  currentUserId,
  receiverId,
  isOpen,
  onClose,
}: {
  assignmentId: string;
  currentUserId: string;
  receiverId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRemoteTyping, setIsRemoteTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Initial load ──────────────────────────────────────────────────────────
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?assignmentId=${assignmentId}`);
      if (res.ok) setMessages(await res.json());
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  // ── Pusher real-time subscription ─────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    fetchMessages();

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1";

    if (pusherKey) {
      const pusher = new PusherJS(pusherKey, { cluster: pusherCluster });
      const channel = pusher.subscribe(`assignment-${assignmentId}`);

      channel.bind("new-message", (data: Message) => {
        setMessages((prev) =>
          prev.some((m) => m.id === data.id) ? prev : [...prev, data]
        );
      });

      channel.bind("user-typing", () => {
        setIsRemoteTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsRemoteTyping(false), 3000);
      });

      return () => {
        channel.unbind_all();
        pusher.unsubscribe(`assignment-${assignmentId}`);
        pusher.disconnect();
      };
    } else {
      // Fallback: poll every 3 s if Pusher keys aren't set yet
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, assignmentId]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isRemoteTyping]);

  // ── Typing indicator — debounced POST to /api/pusher/typing ───────────────
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    typingDebounceRef.current = setTimeout(() => {
      if (process.env.NEXT_PUBLIC_PUSHER_KEY) {
        fetch("/api/pusher/typing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignmentId, senderName: "Someone" }),
        }).catch(() => {});
      }
    }, 400);
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !receiverId) return;

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      content: newMessage.trim(),
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setNewMessage("");

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: optimistic.content, assignmentId, receiverId }),
    });

    if (res.ok) {
      const saved = await res.json();
      // Replace the optimistic message with the real one from DB
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? saved : m)));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-xl">Project Chat</h3>
            <p className="text-blue-100 text-xs uppercase font-bold tracking-widest mt-1">
              {process.env.NEXT_PUBLIC_PUSHER_KEY ? "Live · Real-time" : "Direct Communication"}
            </p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors text-xl">✕</button>
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center py-20 text-gray-400 text-sm">
              No messages yet. Start the conversation!
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                  msg.senderId === currentUserId
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                }`}
              >
                {msg.content}
                <div className={`text-[10px] mt-1 opacity-60 ${msg.senderId === currentUserId ? "text-right" : "text-left"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {/* ── Snapchat-style typing indicator ── */}
          {isRemoteTyping && (
            <div className="flex justify-start items-end gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg animate-bounce">
                💬
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1.5 items-center shadow-sm">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t bg-white flex gap-2">
          <input
            type="text"
            className="flex-grow px-4 py-2 border rounded-xl outline-none focus:border-blue-600 transition-colors text-blue-900 font-medium"
            placeholder={receiverId ? "Type your message…" : "Waiting for someone to join…"}
            value={newMessage}
            onChange={handleTyping}
            disabled={!receiverId}
          />
          <button
            type="submit"
            disabled={!receiverId || !newMessage.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
