import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// GET - List affiliator's products
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const products = await prisma.product.findMany({
      where: { OR: [{ affiliatorId: userId }, { createdById: userId }] },
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST - Create new product
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const body = await req.json();

    const {
      name, slug, shortDesc, description, price, originalPrice,
      category, features, commissionPercent, tokenReward, isFeatured, isActive,
    } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Nama dan harga wajib diisi" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: slug || slugify(name),
        shortDesc,
        description,
        price,
        originalPrice,
        category: category || "Website Kampus",
        features: features || [],
        commissionPercent: commissionPercent || 10,
        tokenReward: tokenReward || 0,
        isFeatured: isFeatured || false,
        isActive: isActive !== false,
        affiliatorId: userId,
        createdById: userId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
