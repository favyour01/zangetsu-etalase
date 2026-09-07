export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { Settings, Globe, Mail, Shield, DollarSign } from "lucide-react";

async function getSettings() {
  const settings = await prisma.setting.findMany({
    orderBy: { group: "asc" },
  });

  const grouped: Record<string, { key: string; value: string; group: string }[]> = {};
  settings.forEach((s) => {
    if (!grouped[s.group]) grouped[s.group] = [];
    grouped[s.group].push(s);
  });

  return grouped;
}

export default async function SuperAdminSettingsPage() {
  const settings = await getSettings();

  const groupLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    general: { label: "Umum", icon: <Globe size={18} /> },
    contact: { label: "Kontak", icon: <Mail size={18} /> },
    finance: { label: "Keuangan", icon: <DollarSign size={18} /> },
    security: { label: "Keamanan", icon: <Shield size={18} /> },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Settings size={22} />
          Pengaturan Sistem
        </h2>
        <p className="text-gray-500 text-sm mt-1">Konfigurasi platform</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {Object.entries(settings).map(([group, items]) => {
          const meta = groupLabels[group] || { label: group, icon: <Settings size={18} /> };
          return (
            <div key={group} className="card p-6">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                {meta.icon}
                {meta.label}
              </h3>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.key}>
                    <label className="form-label text-xs uppercase tracking-wider">
                      {item.key.replace(/_/g, " ")}
                    </label>
                    <input
                      type="text"
                      defaultValue={item.value}
                      className="form-input"
                      name={item.key}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary">Simpan Pengaturan</button>
      </div>
    </div>
  );
}
