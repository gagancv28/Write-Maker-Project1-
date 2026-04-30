import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

// POST /api/pusher/typing
// Broadcasts a typing event so the other user sees the indicator in real time
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assignmentId, senderName } = await req.json();
  if (!assignmentId) {
    return NextResponse.json({ error: "assignmentId required" }, { status: 400 });
  }

  if (process.env.PUSHER_APP_ID) {
    await pusherServer.trigger(`chat-room-${assignmentId}`, "user-typing", {
      senderName: senderName || "Someone",
    });
  }

  return NextResponse.json({ ok: true });
}
