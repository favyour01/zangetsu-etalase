"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Menu, Bell, Search, ChevronDown, User, LogOut, Settings } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  user: {
    name: string;
    role: string;
    email: string;
  };
  onMenuToggle?: () => void;
}

export default function Header({ title, user, onMenuToggle }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const roleLabel: Record<string, string> = {
    MEMBER: "Member",
    AFFILIATOR: "Affiliator",
    SUPERADMIN: "Super Admin",
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Cari..."
            className="bg-transparent border-none outline-none text-sm ml-2 w-40 placeholder-gray-400"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
          >
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          {showNotif && (
            <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold">Notifikasi</p>
              </div>
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Tidak ada notifikasi baru
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-blue-600" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-400">{roleLabel[user.role] || user.role}</p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-14 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              <Link
                href={`/${user.role.toLowerCase()}/profile`}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowDropdown(false)}
              >
                <User size={16} />
                Profil Saya
              </Link>
              <Link
                href={`/${user.role.toLowerCase()}/settings`}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowDropdown(false)}
              >
                <Settings size={16} />
                Pengaturan
              </Link>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
