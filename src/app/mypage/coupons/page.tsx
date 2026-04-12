'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  minOrderAmount: number;
  description: string;
  expiresAt: string | null;
  active: boolean;
}

export default function CouponPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponInput, setCouponInput] = useState('');
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetch('/api/coupons/available')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.coupons) setCoupons(data.coupons);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleRegister() {
    if (!couponInput.trim()) return;
    setRegistering(true);
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponInput.trim().toUpperCase())}&amount=0`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || '유효하지 않은 쿠폰입니다.');
        return;
      }
      toast.success(`쿠폰 "${data.coupon.code}"이 확인되었습니다! 결제 시 사용하세요.`);
      setCouponInput('');
    } catch {
      toast.error('쿠폰 확인에 실패했습니다.');
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">쿠폰함</h1>

      {/* 쿠폰 등록 */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 flex gap-4 items-center">
        <input
          type="text"
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => { if (e.key === 'Enter') handleRegister(); }}
          placeholder="쿠폰 코드를 입력하세요"
          className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase font-mono"
        />
        <button
          onClick={handleRegister}
          disabled={registering}
          className="px-6 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50"
        >
          {registering ? '확인중...' : '쿠폰 확인'}
        </button>
      </div>

      {/* 쿠폰 목록 */}
      {coupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((coupon) => {
            const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
            return (
              <div
                key={coupon.id}
                className={`border rounded-xl p-0 flex h-32 overflow-hidden relative ${
                  isExpired ? 'border-gray-200 bg-gray-50 grayscale opacity-60' : 'border-purple-100 bg-purple-50'
                }`}
              >
                <div className={`w-8 border-r-2 border-dashed relative flex flex-col justify-between py-2 items-center ${
                  isExpired ? 'border-gray-200 bg-gray-100' : 'border-purple-200 bg-purple-100'
                }`}>
                  <div className="w-4 h-4 rounded-full bg-white -mt-4 shadow-inner" />
                  <span className="text-xs font-bold tracking-widest" style={{ writingMode: 'vertical-lr', color: isExpired ? '#9ca3af' : '#a78bfa' }}>
                    {isExpired ? 'EXPIRED' : 'COUPON'}
                  </span>
                  <div className="w-4 h-4 rounded-full bg-white -mb-4 shadow-inner" />
                </div>
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{coupon.description || coupon.code}</h3>
                    <p className={`font-bold text-2xl ${isExpired ? 'text-gray-400' : 'text-purple-600'}`}>
                      {coupon.discountType === 'fixed'
                        ? `${coupon.discountValue.toLocaleString()}원`
                        : `${coupon.discountValue}% 할인`}
                    </p>
                  </div>
                  <div className="flex justify-between items-end text-xs text-gray-500">
                    <span>
                      {coupon.minOrderAmount > 0 ? `${coupon.minOrderAmount.toLocaleString()}원 이상 구매 시` : '조건 없음'}
                    </span>
                    <span>
                      {coupon.expiresAt ? `~ ${new Date(coupon.expiresAt).toLocaleDateString('ko-KR')}까지` : '무기한'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Ticket className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">사용 가능한 쿠폰이 없습니다.</p>
          <p className="text-sm text-gray-400 mt-1">쿠폰 코드가 있다면 위에서 등록해보세요!</p>
        </div>
      )}
    </div>
  );
}
