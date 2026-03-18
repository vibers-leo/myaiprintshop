'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Vendor } from '@/types/vendor';

interface VendorStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  commissionRate: number;
  estimatedCommission: number;
  estimatedSettlement: number;
}

export default function VendorDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('로그인이 필요합니다');
      router.push('/login');
      return;
    }

    if (user) {
      fetchVendorData();
    }
  }, [user, authLoading]);

  const fetchVendorData = async () => {
    try {
      // 사용자의 판매자 정보 조회
      const vendorsResponse = await fetch('/api/vendors');
      const vendorsData = await vendorsResponse.json();

      // 현재 사용자의 판매자 찾기 (임시 - 실제로는 /api/vendors/me 같은 엔드포인트 필요)
      const userVendor = vendorsData.vendors?.find((v: Vendor) => v.ownerId === user?.uid);

      if (!userVendor) {
        toast.error('판매자 정보를 찾을 수 없습니다');
        router.push('/mypage/vendor/apply');
        return;
      }

      setVendor(userVendor);

      // 통계 조회
      const statsResponse = await fetch(`/api/vendors/${userVendor.id}/stats`);
      const statsData = await statsResponse.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      toast.error('데이터를 불러오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 승인 대기 중
  if (vendor?.status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-12 shadow-xl border-2 border-gray-100 text-center"
          >
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-amber-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">승인 대기 중</h1>
            <p className="text-lg text-gray-600 mb-8">
              판매자 신청이 접수되었습니다.
              <br />
              관리자 검토 후 1-2영업일 내 승인됩니다.
            </p>
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6">
              <p className="text-sm text-indigo-900">
                <span className="font-semibold">신청 정보:</span>
                <br />
                상호명: {vendor.businessName}
                <br />
                이메일: {vendor.email}
              </p>
            </div>
            <button
              onClick={() => router.push('/mypage')}
              className="mt-8 px-8 py-3 bg-gradient-to-r from-indigo-600 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              마이페이지로 돌아가기
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // 거부됨
  if (vendor?.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-12 shadow-xl border-2 border-gray-100 text-center"
          >
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">승인 거부</h1>
            <p className="text-lg text-gray-600 mb-8">
              판매자 신청이 거부되었습니다.
              <br />
              자세한 사항은 고객센터로 문의해주세요.
            </p>
            <button
              onClick={() => router.push('/mypage')}
              className="px-8 py-3 bg-gray-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              마이페이지로 돌아가기
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // 승인됨 - 메인 대시보드
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                {vendor?.businessName} 대시보드
              </h1>
              <p className="text-gray-600">판매 현황을 한눈에 확인하세요</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-full flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                승인됨
              </div>
              <button
                onClick={() => router.push('/mypage/vendor/products')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                상품 관리
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              icon: DollarSign,
              label: '총 매출',
              value: `${(stats?.totalSales || 0).toLocaleString()}원`,
              color: 'from-green-500 to-emerald-600',
              bgColor: 'bg-green-50',
              textColor: 'text-green-700',
            },
            {
              icon: ShoppingCart,
              label: '총 주문',
              value: `${stats?.totalOrders || 0}건`,
              color: 'from-blue-500 to-indigo-600',
              bgColor: 'bg-blue-50',
              textColor: 'text-blue-700',
            },
            {
              icon: Package,
              label: '등록 상품',
              value: `${stats?.totalProducts || 0}개`,
              color: 'from-purple-500 to-purple-600',
              bgColor: 'bg-purple-50',
              textColor: 'text-purple-700',
            },
            {
              icon: TrendingUp,
              label: '예상 정산금',
              value: `${(stats?.estimatedSettlement || 0).toLocaleString()}원`,
              color: 'from-amber-500 to-orange-600',
              bgColor: 'bg-amber-50',
              textColor: 'text-amber-700',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-md`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className={`text-3xl font-extrabold ${stat.textColor}`}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Commission Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-indigo-500 to-amber-500 rounded-3xl p-8 text-white mb-8 shadow-xl"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">수수료 정보</h3>
              <p className="text-indigo-100">현재 적용 중인 수수료율</p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-extrabold">{((stats?.commissionRate || 0) * 100).toFixed(0)}%</p>
              <p className="text-sm text-indigo-100 mt-1">
                예상 수수료: {(stats?.estimatedCommission || 0).toLocaleString()}원
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {[
            {
              title: '상품 등록',
              desc: '새로운 상품을 등록하세요',
              icon: Package,
              href: '/mypage/vendor/products/new',
              color: 'from-indigo-600 to-indigo-500',
            },
            {
              title: '상품 관리',
              desc: '등록된 상품을 관리하세요',
              icon: BarChart3,
              href: '/mypage/vendor/products',
              color: 'from-amber-500 to-amber-600',
            },
            {
              title: '정산 내역',
              desc: '정산 내역을 확인하세요',
              icon: DollarSign,
              href: '/mypage/vendor/settlements',
              color: 'from-green-500 to-emerald-600',
            },
          ].map((action, index) => (
            <motion.button
              key={index}
              onClick={() => router.push(action.href)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-indigo-300 transition-all text-left group"
            >
              <div className={`w-14 h-14 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                <action.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-gray-600">{action.desc}</p>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
