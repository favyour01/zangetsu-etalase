import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST - Create withdrawal request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const { amount, bankName, bankAccount, accountHolder } = await req.json();

    if (!amount || !bankName || !bankAccount || !accountHolder) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const withdrawalAmount = parseFloat(amount);
    const fee = 5000; // Fixed fee
    const netAmount = withdrawalAmount - fee;

    // Check balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });

    if (!user || Number(user.balance) < withdrawalAmount) {
      return NextResponse.json({ error: "Saldo tidak mencukupi" }, { status: 400 });
    }

    if (withdrawalAmount < 100000) {
      return NextResponse.json({ error: "Minimum withdrawal Rp 100.000" }, { status: 400 });
    }

    // Create withdrawal
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount: withdrawalAmount,
        fee,
        netAmount,
        bankName,
        bankAccount,
        accountHolder,
        status: "PENDING",
      },
    });

    // Deduct balance
    await prisma.user.update({
      where: { id: userId },
      data: { balance: { decrement: withdrawalAmount } },
    });

    return NextResponse.json(withdrawal, { status: 201 });
  } catch (error) {
    console.error("Create withdrawal error:", error);
    return NextResponse.json({ error: "Failed to create withdrawal" }, { status: 500 });
  }
}

// GET - List user's withdrawals
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(withdrawals);
  } catch (error) {
    console.error("Get withdrawals error:", error);
    return NextResponse.json({ error: "Failed to fetch withdrawals" }, { status: 500 });
  }
}
