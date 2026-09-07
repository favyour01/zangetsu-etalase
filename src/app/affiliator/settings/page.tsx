export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { User, Shield, Bell, Globe } from "lucide-react";

async function getUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      username: true,
      phone: true,
      referralCode: true,
      balance: true,
      tokenBalance: true,
    },
  });
}

export default async function AffiliatorSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const user = await getUser((session.user as Record<string, unknown>).id as string);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Shield size={22} />
          Pengaturan
        </h2>
        <p className="text-gray-500 text-sm mt-1">Kelola pengaturan akun Anda</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <User size={18} />
            Profil
          </h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Nama</label>
              <input type="text" defaultValue={user?.name} className="form-input" />
            </div>
            <div>
              <label className="form-label">Username</label>
              <input type="text" defaultValue={user?.username} className="form-input" disabled />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" defaultValue={user?.email} className="form-input" disabled />
            </div>
            <div>
              <label className="form-label">No. Telepon</label>
              <input type="tel" defaultValue={user?.phone || ""} className="form-input" />
            </div>
            <button className="btn btn-primary">Simpan Perubahan</button>
          </div>
        </div>

        {/* Bank Settings */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Globe size={18} />
            Informasi Bank
          </h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Nama Bank</label>
              <input type="text" placeholder="BCA, Mandiri, BNI..." className="form-input" />
            </div>
            <div>
              <label className="form-label">No. Rekening</label>
              <input type="text" placeholder="1234567890" className="form-input" />
            </div>
            <div>
              <label className="form-label">Nama Pemilik</label>
              <input type="text" placeholder="Nama lengkap" className="form-input" />
            </div>
            <button className="btn btn-primary">Simpan Rekening</button>
          </div>
        </div>
      </div>
    </div>
  );
}
