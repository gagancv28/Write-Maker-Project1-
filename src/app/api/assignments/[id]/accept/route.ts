import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { resend } from "@/lib/resend";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore
    if (session.user.role !== "WRITER") {
      return NextResponse.json({ error: "Only writers can accept assignments" }, { status: 403 });
    }

    const resolvedParams = await params;
    const assignmentId = resolvedParams.id;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { client: { select: { email: true, name: true } } },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    if (assignment.status !== "OPEN") {
      return NextResponse.json({ error: "Assignment is no longer available" }, { status: 400 });
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        status: "IN_PROGRESS",
        // @ts-ignore
        writerId: session.user.id,
      },
    });

    // Send notification email to the client
    if (process.env.RESEND_API_KEY && assignment.client?.email) {
      await resend.emails.send({
        from: "WriteMarket <onboarding@resend.dev>",
        to: assignment.client.email,
        subject: `Your job "${assignment.title}" has been claimed!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2 style="color: #2563eb;">Great news, ${assignment.client.name || "there"}! 🎉</h2>
            <p>A writer has accepted your assignment: <strong>${assignment.title}</strong>.</p>
            <p>Log into WriteMarket to message your writer and track progress.</p>
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3001"}/dashboard"
               style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px;">
              View Dashboard
            </a>
          </div>
        `,
      });
    }

    return NextResponse.json(updatedAssignment, { status: 200 });
  } catch (error) {
    console.error("Assignment acceptance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
