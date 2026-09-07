export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH approve/reject topup (superadmin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, adminNote } = await req.json();

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const topup = await prisma.topup.findUnique({
      where: { id: params.id },
    });

    if (!topup) {
      return NextResponse.json({ error: "Topup tidak ditemukan" }, { status: 404 });
    }

    if (topup.status !== "PENDING") {
      return NextResponse.json({ error: "Topup sudah diproses" }, { status: 400 });
    }

    // Update topup status
    const updated = await prisma.topup.update({
      where: { id: params.id },
      data: {
        status,
        adminNote: adminNote || null,
        processedAt: new Date(),
      },
    });

    // If approved, add balance to user
    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: topup.userId },
        data: {
          balance: {
            increment: topup.amount,
          },
        },
      });

      // Create earning record
      await prisma.earning.create({
        data: {
          userId: topup.userId,
          type: "topup",
          amount: topup.amount,
          description: `Topup saldo Rp${Number(topup.amount).toLocaleString("id-ID")}`,
          referenceId: topup.id,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error processing topup:", error);
    return NextResponse.json({ error: "Gagal memproses topup" }, { status: 500 });
  }
}
