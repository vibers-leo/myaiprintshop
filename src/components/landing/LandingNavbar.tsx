'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(255, 255, 255, 0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:gift-bold" class="text-white text-lg" />
            </div>
            <span className={`font-black text-xl tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-gray-900'}`} style={{ fontFamily: "'Outfit', 'Pretendard', sans-serif" }}>
              GOODZZ
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className={`text-sm font-medium transition-colors duration-200 ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>기능</a>
            <a href="#how" className={`text-sm font-medium transition-colors duration-200 ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>이용 방법</a>
            <a href="#reviews" className={`text-sm font-medium transition-colors duration-200 ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>후기</a>
            <Link href="/shop" className={`text-sm font-medium transition-colors duration-200 ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>상품 보기</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link href="/login" className={`hidden sm:block text-sm font-bold transition-colors duration-200 ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
              로그인
            </Link>
            <Link
              href="/create"
              className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all duration-300 shadow-sm active:scale-95"
            >
              {/* @ts-ignore */}
              <iconify-icon icon="solar:magic-stick-3-bold" class="text-base" />
              지금 만들기
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
