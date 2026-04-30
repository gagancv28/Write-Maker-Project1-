import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only WRITERs browse the feed, but we can also let CLIENTs see their own
    // @ts-ignore
    const userRole = session.user.role;

    let assignments;
    if (userRole === "WRITER") {
      // Feed: Show all OPEN assignments
      assignments = await prisma.assignment.findMany({
        where: { status: "OPEN" },
        include: { client: { select: { name: true, rating: true } } },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Client Dashboard view: Show assignments created by them
      // @ts-ignore
      assignments = await prisma.assignment.findMany({
        // @ts-ignore
        where: { clientId: session.user.id },
        include: { writer: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(assignments);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore
    if (session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Only clients can post assignments" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, price, location, attachmentUrl, imageUrl, category } = body;

    if (!title || !description || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        location: location || null,
        attachmentUrl: attachmentUrl || null,
        imageUrl: imageUrl || null,
        category: category || null,
        // @ts-ignore
        clientId: session.user.id,
        status: "OPEN"
      }
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Assignment creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
