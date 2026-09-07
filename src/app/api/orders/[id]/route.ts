import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH - Update order status (admin/affiliator)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as Record<string, unknown>).id as string;
    const role = (session.user as Record<string, unknown>).role as string;
    const { status } = await req.json();

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }

    // Only admin or owning affiliator can update
    if (role !== "SUPERADMIN" && order.affiliatorId !== userId) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = { status };

    if (status === "COMPLETED") {
      updateData.completedAt = new Date();

      // Create commission for affiliator
      if (order.affiliatorId) {
        await prisma.commission.create({
          data: {
            affiliatorId: order.affiliatorId,
            orderId: order.id,
            orderNumber: order.orderNumber,
            productName: order.productId, // Will be resolved in real scenario
            baseAmount: order.totalPrice,
            commissionRate: 10,
            amount: order.commissionAmount,
            status: "APPROVED",
            approvedAt: new Date(),
          },
        });

        // Add to affiliator balance
        await prisma.user.update({
          where: { id: order.affiliatorId },
          data: { balance: { increment: order.commissionAmount } },
        });

        // Add earning record
        await prisma.earning.create({
          data: {
            userId: order.affiliatorId,
            type: "commission",
            amount: order.commissionAmount,
            description: `Komisi dari order ${order.orderNumber}`,
            referenceId: order.id,
          },
        });
      }

      // Add token reward to buyer
      if (order.tokenReward > 0) {
        await prisma.user.update({
          where: { id: order.buyerId },
          data: { tokenBalance: { increment: order.tokenReward } },
        });
      }
    }

    if (status === "CANCELLED") {
      updateData.cancelledAt = new Date();
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
