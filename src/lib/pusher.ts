import Pusher from "pusher";

// ── SERVER-SIDE ONLY ─────────────────────────────────────────────────────────
// Import this only in API Routes and Server Actions.
// For browser usage, import PusherJS directly from "pusher-js" in your
// "use client" components — do NOT import this file from client components.
// ─────────────────────────────────────────────────────────────────────────────
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.PUSHER_CLUSTER || "mt1",
  useTLS: true,
});
