'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/payment';

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #E5E7EB',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
};

export default function MyPageDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState({ shipping: 0, coupons: 3, points: '2,500' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/orders?userId=${user.uid}`);
        const data = await response.json();
        if (data.success && data.orders.length > 0) {
          const orders = data.orders as Order[];
          setRecentOrder(orders[0]); // 가장 최근 주문
          
          // 배송 중 상태 카운트
          const shippingCount = orders.filter(o => ['SHIPPED', 'PREPARING'].includes(o.orderStatus)).length;
          setStats(prev => ({ ...prev, shipping: shippingCount }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: '결제대기',
      PAID: '결제완료',
      PREPARING: '배송준비',
      SHIPPED: '배송중',
      DELIVERED: '배송완료',
      CANCELLED: '취소됨',
    };
    return labels[status] || status;
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-[#FAFAFA]">
        {/* @ts-ignore */}
        <iconify-icon icon="solar:spinner-linear" class="animate-spin text-gray-900 text-4xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#FAFAFA] min-h-[50vh]">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">대시보드</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            {user ? `${user.displayName || '회원'}님, 일상을 특별하게 디자인하세요.` : '로그인이 필요합니다.'}
          </p>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 lg:gap-6">
        {[
            { label: '배송중/준비중', value: stats.shipping, icon: 'solar:truck-bold', color: 'text-gray-900', bg: 'bg-gray-100 border border-gray-200' },
            { label: '보유 쿠폰', value: stats.coupons, icon: 'solar:ticket-bold', color: 'text-gray-900', bg: 'bg-gray-100 border border-gray-200' },
            { label: '포인트', value: `${stats.points}P`, icon: 'solar:star-circle-bold', color: 'text-yellow-500', bg: 'bg-yellow-50 border border-yellow-100' },
        ].map((stat) => (
            <div key={stat.label} className="p-6 rounded-3xl flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow cursor-default" style={cardStyle}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} mb-2 shadow-sm`}>
                    {/* @ts-ignore */}
                    <iconify-icon icon={stat.icon} class="text-2xl" />
                </div>
                <span className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter" style={{ fontFamily: "'Outfit',sans-serif" }}>{stat.value}</span>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
            </div>
        ))}
      </div> 

      {/* Recent Activity */}
      <div className="p-8 rounded-3xl" style={cardStyle}>
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:clock-circle-bold" class="text-gray-400 text-xl" />
              최근 주문 내역
            </h2>
            <Link href="/mypage/orders" className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1 group transition-colors">
                전체보기
                {/* @ts-ignore */}
                <iconify-icon icon="solar:alt-arrow-right-linear" class="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>

        <div className="space-y-4">
            {recentOrder ? (
                <div className="flex gap-4 md:gap-6 p-5 rounded-2xl bg-gray-50 border border-gray-200 group hover:border-gray-900 hover:shadow-md transition-all cursor-pointer" onClick={() => window.location.href='/mypage/orders'}>
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-xl overflow-hidden shrink-0 border border-gray-200 relative flex items-center justify-center p-2 shadow-sm">
                        {recentOrder.items[0].options?.customDesign ? (
                          <Image
                            src={recentOrder.items[0].options.customDesign}
                            className="object-contain drop-shadow-md"
                            alt="Recent product"
                            fill
                            unoptimized
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {/* @ts-ignore */}
                            <iconify-icon icon="solar:box-minimalistic-bold" class="text-gray-400 text-xl" />
                          </div>
                        )}
                        {recentOrder.items[0].options?.customDesign && (
                          <div className="absolute top-1 left-1 bg-gray-900 text-white px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest shadow-sm">AI</div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm uppercase tracking-widest inline-block mb-3 ${
                                  ['SHIPPED', 'DELIVERED'].includes(recentOrder.orderStatus) ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-white text-gray-700 border border-gray-200'
                                }`}>
                                   {getStatusLabel(recentOrder.orderStatus)}
                                </span>
                                <h3 className="font-bold text-gray-900 truncate max-w-full text-lg tracking-tight">
                                  {recentOrder.items[0].productName} {recentOrder.items.length > 1 && <span className="text-gray-500 text-base font-medium">외 {recentOrder.items.length - 1}건</span>}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 font-mono flex items-center gap-1.5 font-medium">
                                  {/* @ts-ignore */}
                                  <iconify-icon icon="solar:calendar-linear" />
                                  {new Date(recentOrder.createdAt).toLocaleDateString()} 주문 ({recentOrder.id.slice(0, 12)}...)
                                </p>
                            </div>
                            <div className="hidden sm:flex text-xs font-bold text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-xl group-hover:bg-gray-900 group-hover:text-white transition-all items-center gap-1.5 shrink-0 shadow-sm">
                                상세 보기
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300 mt-2">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 shadow-sm">
                      {/* @ts-ignore */}
                      <iconify-icon icon="solar:box-minimalistic-linear" class="text-gray-400 text-3xl" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">최근 주문 내역이 없습니다.</p>
                    <Link href="/shop" className="text-gray-900 font-bold mt-6 py-2.5 px-6 rounded-full bg-white border border-gray-200 shadow-sm inline-block hover:bg-gray-50 transition-colors text-sm">
                        쇼핑하러 가기
                    </Link>
                </div>
            )}
        </div>
      </div>
      
      {/* Recommended Section (Visual Only) */}
      <div className="px-8 py-10 rounded-3xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden group shadow-md" style={{ ...cardStyle }}>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gray-100 to-transparent -z-10" />

          <div className="relative z-10 w-full md:w-auto text-center md:text-left">
              <span className="text-gray-500 bg-gray-100 border border-gray-200 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest mb-3 inline-block">Event</span>
              <h2 className="text-2xl lg:text-3xl font-black mb-3 text-gray-900 tracking-tight">리뷰 작성하고 <span className="text-blue-600 block sm:inline">포인트 2배</span> 받기</h2>
              <p className="text-gray-500 font-medium text-sm mb-6 md:mb-0">구매 후 정성스러운 후기를 남겨주시면 5,000P를 즉시 지급해 드립니다.</p>
          </div>
          <button className="z-10 bg-gray-900 text-white px-8 py-4 rounded-xl text-sm font-bold shadow-lg hover:bg-black hover:shadow-xl hover:-translate-y-0.5 transition-all w-full md:w-auto active:scale-95 flex items-center justify-center gap-2">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:pen-new-round-bold" class="text-lg" />
              리뷰 작성하기
          </button>
          
          <div className="absolute right-[-20px] top-[-30px] opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:gift-bold" style={{ fontSize: '200px', color: '#111827' }} />
          </div>
      </div>
    </div>
  );
}
