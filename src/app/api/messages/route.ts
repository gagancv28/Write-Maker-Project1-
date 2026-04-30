import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

// GET /api/messages?assignmentId=<id>
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const assignmentId = searchParams.get("assignmentId");

  if (!assignmentId) {
    return NextResponse.json({ error: "assignmentId is required" }, { status: 400 });
  }

  const messages = await prisma.message.findMany({
    where: { assignmentId },
    orderBy: { createdAt: "asc" },
    select: { id: true, content: true, senderId: true, createdAt: true },
  });

  return NextResponse.json(messages);
}

// POST /api/messages
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, assignmentId, receiverId } = await req.json();

  if (!content?.trim() || !assignmentId || !receiverId) {
    return NextResponse.json(
      { error: "content, assignmentId, and receiverId are required" },
      { status: 400 }
    );
  }

  const senderId = (session.user as any).id;

  const message = await prisma.message.create({
    data: { content: content.trim(), assignmentId, senderId, receiverId },
    select: { id: true, content: true, senderId: true, createdAt: true },
  });

  // Broadcast to Pusher so all subscribers get the message instantly
  if (process.env.PUSHER_APP_ID) {
    await pusherServer.trigger(`chat-room-${assignmentId}`, "new-message", message);
  }

  return NextResponse.json(message, { status: 201 });
}
