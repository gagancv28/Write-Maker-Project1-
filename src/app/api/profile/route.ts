import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/profile  — update bio
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bio } = await req.json();
  const userId = (session.user as any).id;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { bio: bio ?? null },
    select: { bio: true, avatarUrl: true },
  });

  return NextResponse.json(user);
}

// GET /api/profile  — fetch own profile data
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, avatarUrl: true, bio: true, role: true, completedAssignmentsCount: true },
  });

  return NextResponse.json(user);
}
