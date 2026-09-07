import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { User, Mail, Phone, Calendar, Coins, Link2 } from "lucide-react";

async function getProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      phone: true,
      avatar: true,
      role: true,
      balance: true,
      tokenBalance: true,
      referralCode: true,
      createdAt: true,
      _count: {
        select: { referrals: true, orders: true },
      },
    },
  });
}

export default async function MemberProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const user = await getProfile((session.user as Record<string, unknown>).id as string);
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <User size={22} />
          Profil Saya
        </h2>
        <p className="text-gray-500 text-sm mt-1">Informasi akun Anda</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card p-6 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={36} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
          <p className="text-sm text-gray-500">@{user.username}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            {user.role}
          </span>

          <div className="mt-6 pt-4 border-t border-gray-100 space-y-3 text-left">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail size={16} className="text-gray-400" />
              {user.email}
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} className="text-gray-400" />
                {user.phone}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} className="text-gray-400" />
              Bergabung {formatDateTime(user.createdAt)}
            </div>
          </div>
        </div>

        {/* Stats & Referral */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{user._count.orders}</p>
              <p className="text-xs text-gray-500 mt-1">Pesanan</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{user._count.referrals}</p>
              <p className="text-xs text-gray-500 mt-1">Referral</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(user.balance)}</p>
              <p className="text-xs text-gray-500 mt-1">Saldo</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{user.tokenBalance}</p>
              <p className="text-xs text-gray-500 mt-1">Token</p>
            </div>
          </div>

          {/* Referral Code */}
          <div className="card p-5">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <Link2 size={18} />
              Kode Referral Anda
            </h4>
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-gray-100 px-4 py-2.5 rounded-lg text-sm font-mono text-blue-600">
                {user.referralCode}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(user.referralCode);
                }}
                className="btn btn-outline text-sm"
              >
                Salin
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Bagikan kode ini untuk mendapatkan komisi dari referral
            </p>
          </div>

          {/* Token Info */}
          <div className="card p-5">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <Coins size={18} />
              Token Reward
            </h4>
            <p className="text-sm text-gray-500">
              Token (ZGT) didapatkan dari setiap pembelian paket. Token dapat ditukarkan dengan berbagai reward.
            </p>
            <div className="mt-3 p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-700">
                <strong>{user.tokenBalance} ZGT</strong> tersedia di akun Anda
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
