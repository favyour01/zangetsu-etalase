export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all topups (superadmin)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const topups = await prisma.topup.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, username: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(topups);
  } catch (error) {
    console.error("Error fetching topups:", error);
    return NextResponse.json({ error: "Gagal memuat data topup" }, { status: 500 });
  }
}
