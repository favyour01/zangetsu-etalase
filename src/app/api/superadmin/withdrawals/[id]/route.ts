import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH - Approve/Reject/Paid withdrawal
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as Record<string, unknown>).role as string;
    if (role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { status, adminNote } = await req.json();

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id },
    });

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal tidak ditemukan" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { status };

    if (status === "APPROVED") {
      updateData.processedAt = new Date();
    } else if (status === "PAID") {
      updateData.paidAt = new Date();
      updateData.processedAt = new Date();
    } else if (status === "REJECTED") {
      // Refund balance
      await prisma.user.update({
        where: { id: withdrawal.userId },
        data: { balance: { increment: Number(withdrawal.amount) } },
      });
      updateData.processedAt = new Date();
    }

    if (adminNote) {
      updateData.adminNote = adminNote;
    }

    const updated = await prisma.withdrawal.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update withdrawal error:", error);
    return NextResponse.json({ error: "Failed to update withdrawal" }, { status: 500 });
  }
}
