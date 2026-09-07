export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - List user's chats
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const chats = await prisma.chat.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Get chats error:", error);
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}

// POST - Create new chat
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const { subject, content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Pesan wajib diisi" }, { status: 400 });
    }

    const chat = await prisma.chat.create({
      data: {
        userId,
        subject: subject || "Support Request",
        status: "OPEN",
        messages: {
          create: {
            senderId: userId,
            content,
            type: "TEXT",
          },
        },
      },
      include: { messages: true },
    });

    return NextResponse.json(chat, { status: 201 });
  } catch (error) {
    console.error("Create chat error:", error);
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}
