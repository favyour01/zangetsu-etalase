import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

// POST - Create new order
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const { productId, quantity = 1, notes } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID wajib" }, { status: 400 });
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    // Calculate commission
    const totalPrice = product.price.mul(quantity);
    const commissionAmount = totalPrice.mul(product.commissionPercent).div(100);

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        productId,
        buyerId: userId,
        affiliatorId: product.affiliatorId,
        quantity,
        basePrice: product.price,
        totalPrice,
        commissionAmount,
        tokenReward: product.tokenReward,
        notes,
        status: "PENDING",
      },
    });

    // Increment product order count
    await prisma.product.update({
      where: { id: productId },
      data: { orderCount: { increment: 1 } },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

// GET - List user's orders
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const orders = await prisma.order.findMany({
      where: { buyerId: userId },
      include: { product: { select: { name: true, images: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
