"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Menu } from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const glassStyle = {
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderBottom: '1px solid rgba(0,0,0,0.06)',
};

const mobileMenuStyle = {
  background: 'rgba(255,255,255,0.98)',
  backdropFilter: 'blur(24px)',
  borderBottom: '1px solid rgba(0,0,0,0.06)',
};

function AuthButton() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        로그인
      </Link>
    );
  }

  return (
    <Link href="/mypage" className="flex items-center gap-2">
      {user.photoURL ? (
        <Image
          src={user.photoURL}
          alt={user.displayName || "User"}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full border border-gray-200"
          unoptimized
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
          {/* @ts-ignore */}
          <iconify-icon icon="solar:user-bold" class="text-gray-400 text-base" />
        </div>
      )}
    </Link>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const cart = useStore((state) => state.cart);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { name: '스토어', href: '/shop' },
    { name: '굿즈 만들기', href: '/create' },
    { name: '크리에이터 스튜디오', href: '/studio' },
    { name: '아카데미', href: '/academy' },
    { name: '쇼케이스', href: '/showcase' },
    { name: '개발자 센터', href: '/developers' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 transition-all duration-300" style={glassStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:gift-bold" class="text-white text-lg" />
              </div>
              <span
                className="font-black text-xl tracking-tight text-gray-900"
                style={{ fontFamily: "'Outfit', 'Pretendard', sans-serif" }}
              >
                GOODZZ
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100/50 transition-all duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                {/* @ts-ignore */}
                <iconify-icon icon="solar:magnifer-linear" class="text-xl" />
              </button>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:cart-large-4-linear" class="text-xl" />
                {mounted && cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Divider */}
              <div className="w-px h-5 bg-gray-200 mx-1" />

              <AuthButton />

              {/* CTA */}
              <Link
                href="/create"
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-md active:scale-[0.98] ml-2"
              >
                {/* @ts-ignore */}
                <iconify-icon icon="solar:magic-stick-3-bold" />
                지금 만들기
              </Link>
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden flex items-center gap-3">
              <Link href="/cart" className="relative p-2 text-gray-500">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:cart-large-4-linear" class="text-2xl" />
                {mounted && cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen
                  ? <X className="w-6 h-6" />
                  : <Menu className="w-6 h-6" />
                }
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div style={mobileMenuStyle} className="border-t border-gray-100 shadow-xl">
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center py-3 px-4 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <Link
                  href="/create"
                  className="flex items-center justify-center gap-2 bg-gray-900 text-white font-bold px-6 py-4 rounded-xl w-full hover:shadow-md transition-all active:scale-95"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {/* @ts-ignore */}
                  <iconify-icon icon="solar:magic-stick-3-bold" />
                  지금 만들기
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Search overlay */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 transition-opacity"
          style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)' }}
        >
          <div className="max-w-3xl mx-auto px-6 pt-24">
            <div className="flex justify-between items-center mb-8">
              <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">제품 검색</p>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSearch}>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="어떤 굿즈를 찾으시나요?"
                className="w-full text-4xl md:text-5xl font-black border-none bg-transparent text-gray-900 placeholder:text-gray-300 focus:outline-none py-4"
                style={{ fontFamily: "'Outfit','Pretendard',sans-serif" }}
              />
              <div className="h-0.5 w-full bg-gray-200 mt-2" />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
