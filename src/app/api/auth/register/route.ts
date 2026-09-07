import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { email, username, password, name, phone, referralCode } = await req.json();

    // Validation
    if (!email || !username || !password || !name) {
      return NextResponse.json(
        { error: "Email, username, nama, dan password wajib diisi" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Check existing
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email atau username sudah terdaftar" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Find referrer if referral code provided
    let referredById: string | undefined;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      });
      if (referrer) {
        referredById = referrer.id;
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name,
        phone,
        referredById,
        referralCode: generateReferralCode(),
      },
    });

    return NextResponse.json(
      {
        message: "Registrasi berhasil",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          referralCode: user.referralCode,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat registrasi" },
      { status: 500 }
    );
  }
}
