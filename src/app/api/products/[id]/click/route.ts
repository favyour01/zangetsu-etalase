import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // Record click
    await prisma.click.create({
      data: {
        productId: id,
        userId: (session?.user as Record<string, unknown>)?.id as string | undefined,
        source: "direct",
      },
    });

    // Increment product click count
    await prisma.product.update({
      where: { id },
      data: { clickCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Click tracking error:", error);
    return NextResponse.json({ error: "Failed to track click" }, { status: 500 });
  }
}
