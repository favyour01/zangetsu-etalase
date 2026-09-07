export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET user's topups
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const topups = await prisma.topup.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(topups);
  } catch (error) {
    console.error("Error fetching topups:", error);
    return NextResponse.json({ error: "Gagal memuat data topup" }, { status: 500 });
  }
}

// POST create new topup
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, paymentMethod, paymentProof } = await req.json();

    if (!amount || amount < 10000) {
      return NextResponse.json({ error: "Minimal topup Rp10.000" }, { status: 400 });
    }

    if (!paymentMethod) {
      return NextResponse.json({ error: "Metode pembayaran wajib diisi" }, { status: 400 });
    }

    const topup = await prisma.topup.create({
      data: {
        userId: session.user.id,
        amount,
        paymentMethod,
        paymentProof: paymentProof || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(topup);
  } catch (error) {
    console.error("Error creating topup:", error);
    return NextResponse.json({ error: "Gagal membuat topup" }, { status: 500 });
  }
}
