'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, Plus, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface Coupon {
  id: string;
  code: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  description: string;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

export default function CouponManager() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountType: 'fixed' as 'fixed' | 'percent',
    discountValue: '',
    minOrderAmount: '',
    maxUses: '',
    description: '',
    expiresAt: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function getAuthHeaders(): Promise<HeadersInit> {
    const token = await user?.getIdToken();
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  }

  async function fetchCoupons() {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/coupons', { headers });
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch {
      toast.error('쿠폰 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      setCoupons((prev) => [data.coupon, ...prev]);
      setShowForm(false);
      setForm({ code: '', discountType: 'fixed', discountValue: '', minOrderAmount: '', maxUses: '', description: '', expiresAt: '' });
      toast.success('쿠폰이 생성되었습니다.');
    } catch {
      toast.error('쿠폰 생성에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    try {
      const headers = await getAuthHeaders();
      await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ id, active: !active }),
      });
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, active: !active } : c)));
      toast.success(active ? '쿠폰이 비활성화되었습니다.' : '쿠폰이 활성화되었습니다.');
    } catch {
      toast.error('상태 변경에 실패했습니다.');
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Ticket className="w-5 h-5" /> 쿠폰 관리
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> 쿠폰 생성
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">쿠폰 코드</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="WELCOME2026"
                className="w-full p-2 border border-gray-300 rounded-lg uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">할인 유형</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value as 'fixed' | 'percent' })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="fixed">정액 할인 (원)</option>
                <option value="percent">정률 할인 (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                할인 {form.discountType === 'fixed' ? '금액 (원)' : '비율 (%)'}
              </label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                placeholder={form.discountType === 'fixed' ? '3000' : '10'}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최소 주문 금액 (원)</label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                placeholder="30000"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최대 사용 횟수 (0=무제한)</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                placeholder="100"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">만료일</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="신규 회원 가입 환영 쿠폰"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              취소
            </button>
            <button type="submit" disabled={creating} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {creating ? '생성 중...' : '생성'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600">코드</th>
              <th className="text-left p-3 font-medium text-gray-600">할인</th>
              <th className="text-left p-3 font-medium text-gray-600">조건</th>
              <th className="text-center p-3 font-medium text-gray-600">사용</th>
              <th className="text-left p-3 font-medium text-gray-600">만료</th>
              <th className="text-center p-3 font-medium text-gray-600">상태</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-400">등록된 쿠폰이 없습니다.</td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-3">
                    <span className="font-mono font-bold text-purple-600">{coupon.code}</span>
                    {coupon.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{coupon.description}</p>
                    )}
                  </td>
                  <td className="p-3">
                    {coupon.discountType === 'fixed'
                      ? `₩${coupon.discountValue.toLocaleString()}`
                      : `${coupon.discountValue}%`}
                  </td>
                  <td className="p-3 text-gray-600">
                    {coupon.minOrderAmount > 0 ? `₩${coupon.minOrderAmount.toLocaleString()} 이상` : '조건 없음'}
                  </td>
                  <td className="p-3 text-center">
                    {coupon.usedCount}{coupon.maxUses > 0 ? `/${coupon.maxUses}` : ''}
                  </td>
                  <td className="p-3 text-gray-600">
                    {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('ko-KR') : '무기한'}
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => toggleActive(coupon.id, coupon.active)} title={coupon.active ? '비활성화' : '활성화'}>
                      {coupon.active ? (
                        <ToggleRight className="w-6 h-6 text-green-500 mx-auto" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400 mx-auto" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
