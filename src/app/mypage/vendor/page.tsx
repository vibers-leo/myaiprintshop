'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function VendorDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [vendorData, setVendorData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, loading, period]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      const token = await user!.getIdToken();

      // 1. 판매자 정보 조회 (ownerId로)
      const vendorRes = await fetch(`/api/vendors?ownerId=${user!.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const vendorJson = await vendorRes.json();
      const vendor = vendorJson.vendors?.[0];

      if (!vendor) {
        setVendorData(null);
        return;
      }

      setVendorData(vendor);

      // 2. 통계 조회
      const statsRes = await fetch(`/api/vendors/${vendor.id}/stats?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsJson = await statsRes.json();
      setStats(statsJson);

      // 3. 정산 내역 조회
      const settlementsRes = await fetch(
        `/api/vendors/${vendor.id}/settlements?limit=10&includeStats=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const settlementsJson = await settlementsRes.json();
      setSettlements(settlementsJson.settlements || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-800 mb-4">판매자 정보가 없습니다</p>
          <button
            onClick={() => router.push('/mypage/vendor/apply')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            판매자 신청하기
          </button>
        </div>
      </div>
    );
  }

  const maxAmount = stats?.salesTrend?.length > 0
    ? Math.max(...stats.salesTrend.map((d: any) => d.amount))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{vendorData.businessName}</h1>
              <p className="text-sm text-gray-500 mt-1">판매자 대시보드</p>
            </div>
            <div className="flex gap-2">
              {['7d', '30d', '90d'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    period === p
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p === '7d' ? '7일' : p === '30d' ? '30일' : '90일'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">총 매출</p>
            <p className="text-2xl font-bold text-gray-900">
              ₩{stats?.periodStats?.totalSales?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">최근 {period === '7d' ? '7일' : period === '30d' ? '30일' : '90일'}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">주문 수</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.periodStats?.totalOrders || 0}건</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">평균 주문액</p>
            <p className="text-2xl font-bold text-gray-900">
              ₩{Math.round(stats?.periodStats?.averageOrderValue || 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">수수료</p>
            <p className="text-2xl font-bold text-gray-900">
              ₩{stats?.periodStats?.totalCommission?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">{(vendorData.commissionRate * 100).toFixed(1)}%</p>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">일별 매출 추이</h2>
          {stats?.salesTrend?.length > 0 ? (
            <div className="h-64 flex items-end justify-between gap-2">
              {stats.salesTrend.map((day: any, index: number) => {
                const height = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-primary rounded-t hover:bg-primary/80 transition-colors cursor-pointer relative group"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    >
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                        ₩{day.amount.toLocaleString()}<br />{day.orders}건
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{new Date(day.date).getDate()}일</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              매출 데이터가 없습니다
            </div>
          )}
        </div>

        {/* Recent Settlements */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">최근 정산 내역</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">주문번호</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">주문금액</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">수수료</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">정산금액</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">일시</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {settlements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      정산 내역이 없습니다
                    </td>
                  </tr>
                ) : (
                  settlements.map((settlement: any) => (
                    <tr key={settlement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{settlement.orderId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ₩{settlement.orderAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ₩{settlement.commission.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ₩{settlement.vendorAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            settlement.status === 'transferred'
                              ? 'bg-green-100 text-green-800'
                              : settlement.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {settlement.status === 'transferred'
                            ? '완료'
                            : settlement.status === 'pending'
                            ? '대기'
                            : '실패'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(settlement.createdAt.seconds * 1000).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
