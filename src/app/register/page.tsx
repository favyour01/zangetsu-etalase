"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  const ref = params.get("ref") || "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (form.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          username: form.username,
          phone: form.phone,
          password: form.password,
          referralCode: ref,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registrasi gagal");
      } else {
        toast.success("Registrasi berhasil! Silakan login.");
        router.push("/login");
      }
    } catch {
      setError("Terjadi kesalahan saat registrasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-600/30">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Daftar Akun Baru</h1>
          <p className="text-blue-200 mt-1">Bergabung dan mulai hasilkan komisi</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="form-label">Nama Lengkap</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-input pl-10"
                  placeholder="Nama lengkap Anda"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="form-input pl-10"
                  placeholder="username_unik"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-input pl-10"
                  placeholder="email@contoh.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">No. Telepon</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="form-input pl-10"
                  placeholder="081234567890"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-input pl-10 pr-10"
                  placeholder="Minimal 6 karakter"
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

            <div>
              <label className="form-label">Konfirmasi Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="form-input pl-10"
                  placeholder="Ulangi password"
                  required
                />
              </div>
            </div>

            {ref && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
                <p className="text-sm text-blue-700">
                  🔗 Kode referral: <strong>{ref}</strong>
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-success w-full mt-6 py-3 text-base"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Daftar Sekarang"
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              Masuk
            </Link>
          </p>
        </form>

        <p className="text-center text-blue-200/60 text-xs mt-6">
          <Link href="/" className="hover:text-blue-200">← Kembali ke beranda</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center"><div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
