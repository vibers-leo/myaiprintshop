'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { User, Package, Ticket, Heart, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const menuItems = [
    { name: '대시보드', href: '/mypage', icon: User },
    { name: '주문/배송 조회', href: '/mypage/orders', icon: Package },
    { name: '쿠폰함', href: '/mypage/coupons', icon: Ticket },
    { name: '위시리스트', href: '/wishlist', icon: Heart },
    { name: '판매자 대시보드', href: '/vendor/dashboard', icon: LayoutDashboard },
    { name: '크리에이터 스튜디오', href: '/studio', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Sidebar */}
        <div className="lg:w-64 shrink-0 space-y-8">
            {/* User Profile Summary */}
            <div className="flex items-center gap-4 lg:block lg:text-center pb-6 border-b border-gray-100 mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 overflow-hidden relative">
                    {user?.photoURL ? (
                      <Image src={user.photoURL} alt={user.displayName || 'User'} className="object-cover" fill unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-100">
                        <User className="w-8 h-8 text-emerald-600" />
                      </div>
                    )}
                </div>
                <div>
                     <h2 className="font-bold text-gray-900">{user?.displayName || '사용자'}님</h2>
                     <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
            </div>

            {/* Menu */}
            <nav className="space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                isActive 
                                ? 'bg-black text-white font-bold' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    )
                })}
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors text-left"
                >
                    <LogOut className="w-5 h-5" />
                    로그아웃
                </button>
            </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-[500px]">
            {children}
        </div>
      </div>
    </div>
  );
}
