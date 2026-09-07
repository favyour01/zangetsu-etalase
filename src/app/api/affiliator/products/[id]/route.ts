import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// PUT - Update product
export async function PUT(
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
    const body = await req.json();

    // Verify ownership
    const existing = await prisma.product.findFirst({
      where: { id, OR: [{ affiliatorId: userId }, { createdById: userId }] },
    });

    if (!existing) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    const {
      name, slug, shortDesc, description, price, originalPrice,
      category, features, commissionPercent, tokenReward, isFeatured, isActive,
    } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name || existing.name,
        slug: slug || slugify(name || existing.name),
        shortDesc,
        description,
        price: price || existing.price,
        originalPrice,
        category: category || existing.category,
        features: features || existing.features,
        commissionPercent: commissionPercent || existing.commissionPercent,
        tokenReward: tokenReward !== undefined ? tokenReward : existing.tokenReward,
        isFeatured: isFeatured !== undefined ? isFeatured : existing.isFeatured,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as Record<string, unknown>).id as string;

    // Verify ownership
    const existing = await prisma.product.findFirst({
      where: { id, OR: [{ affiliatorId: userId }, { createdById: userId }] },
    });

    if (!existing) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
