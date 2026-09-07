export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH - Update user (role, status, balance)
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
    const { role: newRole, isActive, balance, tokenBalance } = await req.json();

    const updateData: Record<string, unknown> = {};
    if (newRole) updateData.role = newRole;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (balance !== undefined) updateData.balance = balance;
    if (tokenBalance !== undefined) updateData.tokenBalance = tokenBalance;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      isActive: updated.isActive,
      balance: updated.balance,
      tokenBalance: updated.tokenBalance,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(
  _req: NextRequest,
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
    const currentUserId = (session.user as Record<string, unknown>).id as string;

    if (id === currentUserId) {
      return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
