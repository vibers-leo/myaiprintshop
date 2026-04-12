'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DollarSign, ArrowLeft, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface Settlement {
  id: string;
  orderId: string;
  orderAmount: number;
  commission: number;
  commissionRate: number;
  vendorAmount: number;
  status: 'pending' | 'transferred' | 'failed';
  createdAt: string;
  transferredAt?: string;
}

interface SettlementStats {
  totalSettled: number;
  totalPending: number;
  totalFailed: number;
  count: number;
}

const STATUS_CONFIG = {
  pending: { label: '정산 대기', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  transferred: { label: '정산 완료', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  failed: { label: '실패', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

export default function VendorSettlementsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [stats, setStats] = useState<SettlementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const vendorsRes = await fetch('/api/vendors');
        const vendorsData = await vendorsRes.json();
        const vendor = vendorsData.vendors?.find((v: any) => v.ownerId === user.uid);
        if (!vendor) { toast.error('판매자 정보를 찾을 수 없습니다.'); return; }

        const token = await user.getIdToken();
        const res = await fetch(`/api/vendors/${vendor.id}/settlements`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setSettlements(data.settlements || []);
          setStats(data.stats || null);
        }
      } catch { toast.error('정산 내역을 불러올 수 없습니다.'); }
      finally { setLoading(false); }
    })();
  }, [user]);

  const filtered = filter === 'all' ? settlements : settlements.filter((s) => s.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={() => router.push('/mypage/vendor/dashboard')}
            className="mb-6 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> 대시보드
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">정산 내역</h1>
              <p className="text-gray-600">매출과 정산 현황을 확인하세요</p>
            </div>
          </div>
        </motion.div>

        {/* 통계 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
              <p className="text-xs text-gray-500 mb-1">총 정산 완료</p>
              <p className="text-xl font-bold text-green-600">₩{stats.totalSettled.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
              <p className="text-xs text-gray-500 mb-1">정산 대기</p>
              <p className="text-xl font-bold text-yellow-600">₩{stats.totalPending.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
              <p className="text-xs text-gray-500 mb-1">정산 건수</p>
              <p className="text-xl font-bold text-gray-900">{stats.count}건</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
              <p className="text-xs text-gray-500 mb-1">실패</p>
              <p className="text-xl font-bold text-red-500">₩{stats.totalFailed.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* 필터 */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: '전체' },
            { key: 'transferred', label: '완료' },
            { key: 'pending', label: '대기' },
            { key: 'failed', label: '실패' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f.key ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 정산 목록 */}
        {filtered.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">주문번호</th>
                  <th className="text-right p-4 font-semibold text-gray-600">주문금액</th>
                  <th className="text-right p-4 font-semibold text-gray-600">수수료</th>
                  <th className="text-right p-4 font-semibold text-gray-600">정산금액</th>
                  <th className="text-center p-4 font-semibold text-gray-600">상태</th>
                  <th className="text-left p-4 font-semibold text-gray-600">일시</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const cfg = STATUS_CONFIG[s.status];
                  const Icon = cfg.icon;
                  return (
                    <tr key={s.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="p-4 font-mono text-xs text-gray-500">{s.orderId.slice(0, 16)}...</td>
                      <td className="p-4 text-right">₩{s.orderAmount.toLocaleString()}</td>
                      <td className="p-4 text-right text-red-500">
                        -₩{s.commission.toLocaleString()}
                        <span className="text-[10px] text-gray-400 ml-1">({(s.commissionRate * 100).toFixed(0)}%)</span>
                      </td>
                      <td className="p-4 text-right font-bold text-green-600">₩{s.vendorAmount.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
                          <Icon className="w-3 h-3" /> {cfg.label}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-500">
                        {new Date(s.transferredAt || s.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">정산 내역이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
