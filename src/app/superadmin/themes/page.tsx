import prisma from "@/lib/prisma";
import { Palette, Check } from "lucide-react";

async function getThemes() {
  return prisma.theme.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export default async function SuperAdminThemesPage() {
  const themes = await getThemes();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Palette size={22} />
          Tema
        </h2>
        <p className="text-gray-500 text-sm mt-1">Kelola tampilan tema platform</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <div key={theme.id} className={`card overflow-hidden ${theme.isDefault ? "ring-2 ring-blue-500" : ""}`}>
            {/* Theme Preview */}
            <div className="h-32 relative" style={{ backgroundColor: theme.primaryColor }}>
              <div className="absolute left-0 top-0 bottom-0 w-12" style={{ backgroundColor: theme.primaryColor }}>
                <div className="p-2 space-y-2">
                  <div className="w-6 h-1.5 bg-white/30 rounded" />
                  <div className="w-8 h-1.5 bg-white/20 rounded" />
                  <div className="w-7 h-1.5 bg-white/20 rounded" />
                  <div className="w-5 h-1.5 bg-white/20 rounded" />
                </div>
              </div>
              <div className="ml-14 p-3">
                <div className="w-20 h-2 bg-black/20 rounded mb-2" />
                <div className="flex gap-2 mb-2">
                  <div className="w-12 h-8 bg-white/10 rounded" />
                  <div className="w-12 h-8 bg-white/10 rounded" />
                  <div className="w-12 h-8 bg-white/10 rounded" />
                </div>
                <div className="w-full h-12 bg-white/5 rounded" />
              </div>
              {theme.isDefault && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check size={10} /> Default
                </div>
              )}
            </div>
            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-800">{theme.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{theme.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: theme.primaryColor }} title="Primary" />
                <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: theme.accentColor }} title="Accent" />
                <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: theme.bgColor }} title="Background" />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button className="btn btn-outline text-xs py-1.5 flex-1">Edit</button>
                {!theme.isDefault && (
                  <button className="btn btn-primary text-xs py-1.5 flex-1">Aktifkan</button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Theme */}
        <button className="card border-2 border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[280px] hover:border-blue-400 hover:bg-blue-50/50 transition-all">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Palette size={24} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">Tambah Tema Baru</p>
        </button>
      </div>
    </div>
  );
}
