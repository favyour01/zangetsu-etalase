"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        toast.success("Login berhasil!");
        // Redirect based on role after a brief delay
        setTimeout(() => {
          router.refresh();
          router.push("/");
        }, 500);
      }
    } catch {
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-600/30">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Zangetsu Etalase</h1>
          <p className="text-blue-200 mt-1">Masuk ke akun Anda</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="form-label">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-10"
                  placeholder="email@contoh.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10 pr-10"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full mt-6 py-3 text-base"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Masuk"
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Belum punya akun?{" "}
            <Link href="/register" className="text-blue-600 font-medium hover:underline">
              Daftar sekarang
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Akun Demo:</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => { setEmail("superadmin@zangetsu.com"); setPassword("admin123"); }}
                className="px-2 py-1.5 bg-slate-100 rounded text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => { setEmail("affiliator@zangetsu.com"); setPassword("aff123"); }}
                className="px-2 py-1.5 bg-blue-100 rounded text-blue-600 hover:bg-blue-200 transition-colors"
              >
                Affiliator
              </button>
              <button
                type="button"
                onClick={() => { setEmail("member@zangetsu.com"); setPassword("member123"); }}
                className="px-2 py-1.5 bg-green-100 rounded text-green-600 hover:bg-green-200 transition-colors"
              >
                Member
              </button>
            </div>
          </div>
        </form>

        <p className="text-center text-blue-200/60 text-xs mt-6">
          <Link href="/" className="hover:text-blue-200">← Kembali ke beranda</Link>
        </p>
      </div>
    </div>
  );
}
