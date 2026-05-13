import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { pusherServer } from "@/lib/pusher";
import ChatPanel from "@/components/ChatPanel";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id: assignmentId } = await params;
  const currentUserId = (session.user as any).id;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      client: { select: { id: true, name: true, avatarUrl: true } },
      writer: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  if (!assignment) redirect("/assignments");

  const messages = await prisma.message.findMany({
    where: { assignmentId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });

  // Who is the other party in this conversation?
  const isClient = assignment.clientId === currentUserId;
  const receiver = isClient ? assignment.writer : assignment.client;
  const receiverId = receiver?.id ?? null;
  const receiverName = receiver?.name ?? null;
  const receiverAvatarUrl = (receiver as any)?.avatarUrl ?? null;
  const currentUserName = session.user?.name ?? null;

  // ─── Server Action (kept for completeness; also triggers Pusher) ─────────
  async function sendMessage(formData: FormData) {
    "use server";

    const text = (formData.get("text") as string)?.trim();
    if (!text) return;

    const serverSession = await getServerSession(authOptions);
    if (!serverSession) return;

    const senderId = (serverSession.user as any).id;
    const to = formData.get("receiverId") as string;
    if (!to) return;

    const newMessage = await prisma.message.create({
      data: {
        content: text,
        assignmentId,
        senderId,
        receiverId: to,
      },
      select: { id: true, content: true, senderId: true, createdAt: true },
    });

    // Broadcast to Pusher so all connected clients update instantly
    if (process.env.PUSHER_APP_ID) {
      await pusherServer.trigger(
        `chat-room-${assignmentId}`,
        "new-message",
        newMessage
      );
    }
    // Note: revalidatePath removed — Pusher handles the UI update in real time
  }
  
  // ─────────────────────────────────────────────────────────────────────────

  const statusColors: Record<string, string> = {
    OPEN: "bg-emerald-100 text-emerald-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <a
            href="/assignments"
            className="text-gray-400 hover:text-gray-700 transition-colors text-sm flex items-center gap-1"
          >
            ← Back to Assignments
          </a>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500 truncate">{assignment.title}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── Assignment Details Panel ── */}
        <aside className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-3">
              <h1 className="text-xl font-bold text-gray-900 leading-snug">
                {assignment.title}
              </h1>
              <span
                className={`ml-3 shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                  statusColors[assignment.status] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {assignment.status.replace("_", " ")}
              </span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              {assignment.description}
            </p>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-400 font-medium">Budget</dt>
                <dd className="font-bold text-gray-800">
                  ₹{assignment.price.toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400 font-medium">Client</dt>
                <dd className="text-gray-700">{assignment.client.name ?? "—"}</dd>
              </div>
              {assignment.writer && (
                <div className="flex justify-between">
                  <dt className="text-gray-400 font-medium">Writer</dt>
                  <dd className="text-gray-700">{assignment.writer.name}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-400 font-medium">Posted</dt>
                <dd className="text-gray-700">
                  {new Date(assignment.createdAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </aside>

        {/* ── Real-time Chat Panel (Client Component) ── */}
        <ChatPanel
          assignmentId={assignmentId}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          receiverId={receiverId}
          receiverName={receiverName}
          receiverAvatarUrl={receiverAvatarUrl}
          initialMessages={messages as any}
        />
      </div>
    </div>
  );
}
