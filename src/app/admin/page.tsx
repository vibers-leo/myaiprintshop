'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import styles from './admin.module.css';
import OrderManager from '@/components/admin/OrderManager';
import ProductManager from '@/components/admin/ProductManager';
import AdminSettings from '@/components/admin/AdminSettings';
import BannerManager from '@/components/admin/BannerManager';
import ReviewAdmin from '@/components/admin/ReviewAdmin';
import DesignManager from '@/components/admin/DesignManager';
import VendorManager from '@/components/admin/VendorManager';
import SettlementManager from '@/components/admin/SettlementManager';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Image,
  Settings,
  Package,
  TrendingUp,
  Wand2,
  FileText,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Truck,
  Clock,
  MessageSquare,
  AlertCircle,
  Sparkles,
  LogIn,
  ShieldAlert,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminPage() {
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // 서버사이드 관리자 권한 확인
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsCheckingAuth(false);
        return;
      }

      try {
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) {
          setIsAdmin(false);
          setIsCheckingAuth(false);
          return;
        }

        const res = await fetch('/api/auth/check-admin', {
          method: 'POST',
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const data = await res.json();
        setIsAdmin(data.isAdmin === true);
      } catch (error) {
        console.error('Admin check failed:', error);
        setIsAdmin(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    if (!loading) {
      checkAdmin();
    }
  }, [user, loading]);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // 로그인 후 관리자 권한 체크는 useEffect에서 자동으로 처리됨
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  // 인증된 API 호출 헬퍼
  const fetchWithAuth = async (url: string, options?: RequestInit) => {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    return fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${idToken}`,
      },
    });
  };

  // 대시보드 개요 컴포넌트
  const DashboardOverview = () => {
    const [stats, setStats] = useState<any>(null);
    const [dashStats, setDashStats] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const fetchDashboardData = async () => {
        try {
          const [statsRes, ordersRes, dashRes] = await Promise.all([
            fetch('/api/orders?stats=true'),
            fetch('/api/orders?limit=5'),
            fetchWithAuth('/api/admin/stats'),
          ]);
          const statsData = await statsRes.json();
          const ordersData = await ordersRes.json();
          const dashData = await dashRes.json();

          if (statsData.success) setStats(statsData.stats);
          if (ordersData.success) setOrders(ordersData.orders);
          if (dashData.success) setDashStats(dashData);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDashboardData();
    }, []);

    if (isLoading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></div>;

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className="flex justify-between items-start">
              <h3>총 주문 수</h3>
              <Package className="text-gray-400" size={18} />
            </div>
            <div className={styles.value}>{stats?.total || 0}</div>
            <div className={styles.trend}>전체 누적</div>
          </div>
          <div className={styles.statCard}>
            <div className="flex justify-between items-start">
              <h3>매출액 (최근 30일)</h3>
              <TrendingUp className="text-emerald-500" size={18} />
            </div>
            <div className={styles.value} style={{ color: '#10b981' }}>
                {(dashStats?.monthlyRevenue || 0).toLocaleString()}원
            </div>
            <div className={styles.trend}>
              <span className={`font-bold ${(dashStats?.revenueGrowth || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {(dashStats?.revenueGrowth || 0) >= 0 ? '↑' : '↓'} {Math.abs(dashStats?.revenueGrowth || 0)}%
              </span> 전월 대비
            </div>
          </div>
          <div className={styles.statCard}>
            <div className="flex justify-between items-start">
              <h3>제작 대기</h3>
              <Clock className="text-amber-500" size={18} />
            </div>
            <div className={styles.value} style={{ color: '#f59e0b' }}>{stats?.paid || 0}</div>
            <div className={styles.trend}>결제 완료 건</div>
          </div>
          <div className={styles.statCard}>
            <div className="flex justify-between items-start">
              <h3>배송 준비 중</h3>
              <Truck className="text-blue-500" size={18} />
            </div>
            <div className={styles.value} style={{ color: '#3b82f6' }}>{stats?.preparing || 0}</div>
            <div className={styles.trend}>제작 완료 건</div>
          </div>
        </div>

        {/* Sales & AI Trends Visuals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <TrendingUp className="text-blue-600" size={20} /> 주간 매출 추이
                    </h2>
                    <select className="text-xs bg-gray-50 border-none rounded-lg px-3 py-1.5 focus:ring-0">
                        <option>최근 7일</option>
                        <option>최근 30일</option>
                    </select>
                </div>
                <div className="h-48 flex items-end gap-3 px-4">
                    {(dashStats?.dailySales || Array(7).fill({ date: '-', amount: 0 })).map((day: { date: string; amount: number }, i: number) => {
                        const maxAmount = Math.max(...(dashStats?.dailySales || []).map((d: { amount: number }) => d.amount), 1);
                        const heightPercent = Math.max((day.amount / maxAmount) * 100, 3);
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <motion.div
                                    initial={{ height: 0 }} animate={{ height: `${heightPercent}%` }}
                                    className="w-full bg-linear-to-t from-blue-600 to-blue-400 rounded-t-lg group-hover:from-blue-500 group-hover:to-blue-300 transition-all cursor-pointer relative"
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {day.amount.toLocaleString()}원
                                    </div>
                                </motion.div>
                                <span className="text-[10px] text-gray-400 font-bold">{day.date}</span>
                            </div>
                        );
                    })}
                </div>
           </div>

           <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-6">
                    <Sparkles className="text-amber-500" size={20} /> AI 인기 스타일
                </h2>
                <div className="space-y-4">
                    {[
                        { name: '사이버펑크 네온', count: 124, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { name: '수채화 파스텔', count: 89, color: 'text-pink-600', bg: 'bg-pink-50' },
                        { name: '미니멀 라인아트', count: 76, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { name: '3D 입체 렌더링', count: 54, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                    ].map((style, i) => (
                        <div key={i} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 ${style.bg} ${style.color} rounded-lg flex items-center justify-center text-[10px] font-bold`}>{i+1}</span>
                                <span className="text-sm font-bold text-gray-700">{style.name}</span>
                            </div>
                            <span className="text-xs text-gray-400 font-medium">{style.count}회</span>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-8 py-3 bg-gray-50 text-gray-500 text-xs font-bold rounded-xl hover:bg-gray-100 transition-all">전체 키워드 분석 보기</button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={styles.recentOrders}>
            <h2 className="text-lg font-black text-gray-900 mb-4">📦 최근 주문 현황</h2>
            {orders.length === 0 ? (
              <p className="py-8 text-center text-gray-400 text-sm">최근 주문이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                            <ShoppingCart size={18} />
                        </div>
                        <div>
                          <p className="font-black text-sm text-gray-900">{order.shippingInfo.name}</p>
                          <span className="text-[10px] font-mono text-gray-400">{order.id}</span>
                        </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">{(order.totalAmount + order.shippingFee).toLocaleString()}원</p>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{order.orderStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="w-full mt-6 py-4 text-xs text-gray-500 font-bold border-2 border-dashed border-gray-100 rounded-2xl hover:bg-gray-50 transition-all" onClick={() => setActiveTab('orders')}>
              모든 주문 데이터 관리하기
            </button>
          </div>

          <div className={styles.recentOrders}>
            <h2 className="text-lg font-black text-gray-900 mb-4">🔔 운영 시스템 상태</h2>
            <div className="space-y-4">
                <div className="p-5 bg-linear-to-r from-blue-600 to-indigo-600 rounded-3xl text-white shadow-xl shadow-blue-100">
                  <div className="flex justify-between items-start mb-4">
                    <strong className="text-sm">AI 디자인 클러스터</strong>
                    <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">HEALTHY</span>
                  </div>
                  <p className="text-xs opacity-90 leading-relaxed">모든 GPU 서버가 정상 작동 중입니다. 평균 생성 시간: 4.2초 (평소보다 0.5초 빠름)</p>
                </div>
                <div className="p-5 bg-white border border-amber-100 rounded-3xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                        <strong className="text-sm text-gray-900">긴급 점검 공지</strong>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">2026-01-15 새벽 2시부터 4시까지 DB 최적화를 위한 시스템 점검이 예정되어 있습니다.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                        <MessageSquare className="text-gray-400" size={16} />
                        <div>
                            <p className="text-[10px] font-bold text-gray-900">상담 챗봇</p>
                            <p className="text-[9px] text-gray-500">대기 중 2건</p>
                        </div>
                    </div>
                    <div className="flex-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                        <AlertCircle className="text-gray-400" size={16} />
                        <div>
                            <p className="text-[10px] font-bold text-gray-900">품절 상품</p>
                            <p className="text-[9px] text-gray-500">0건</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading || isCheckingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <Loader2 className="animate-spin mx-auto mb-4" size={40} />
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show Google login
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
        }}>
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' }}>
              🔐 관리자 로그인
            </h1>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>GOODZZ 관리자 페이지</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '14px',
              background: 'white',
              color: '#1a1a2e',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <LogIn size={20} />
            Google로 로그인
          </button>

          <p style={{ marginTop: '20px', color: '#999', fontSize: '0.8rem' }}>
            ⚠️ 관리자 권한이 있는 계정으로만 접근 가능합니다.
          </p>
        </div>
      </div>
    );
  }

  // Logged in but not admin - show access denied
  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
        }}>
          <ShieldAlert size={48} style={{ color: '#ef4444', marginBottom: '20px' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' }}>
            접근 권한이 없습니다
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
            현재 계정 ({user.email})은 관리자 권한이 없습니다.
          </p>

          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#1a1a2e',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: '대시보드', icon: <LayoutDashboard size={20} /> },
    { id: 'orders', label: '주문 관리', icon: <ShoppingCart size={20} /> },
    { id: 'products', label: '상품 관리', icon: <Package size={20} /> },
    { id: 'vendors', label: '판매자 관리', icon: <Users size={20} /> },
    { id: 'settlements', label: '정산 관리', icon: <DollarSign size={20} /> },
    { id: 'designs', label: '디자인 관리', icon: <Wand2 size={20} /> },
    { id: 'banners', label: '배너 관리', icon: <Image size={20} /> },
    { id: 'reviews', label: '리뷰 관리', icon: <MessageSquare size={20} /> },
    { id: 'export-voucher', label: '수출바우처', icon: <FileText size={20} /> },
    { id: 'settings', label: '설정', icon: <Settings size={20} /> },
  ];

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return '대시보드';
      case 'orders': return '주문 관리';
      case 'products': return '상품 관리';
      case 'vendors': return '판매자 관리';
      case 'settlements': return '정산 관리';
      case 'designs': return 'AI 디자인 관리';
      case 'banners': return '배너 및 팝업 관리';
      case 'reviews': return '리뷰 관리';
      case 'export-voucher': return '수출바우처 사업계획서';
      case 'settings': return '시스템 설정';
      default: return '관리자';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.logo}>
          <Wand2 size={24} />
          <span>ADMIN</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map(item => (
            <div 
              key={item.id}
              className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div
          className={styles.navItem}
          onClick={logout}
          style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
        >
          <Settings size={20} />
          <span>로그아웃</span>
        </div>
      </div>

      <div className={styles.main}>
        <header className={styles.header}>
          <h1>{getPageTitle()}</h1>
          <div className={styles.profile}>
            👤 관리자
          </div>
        </header>

        <div className={styles.contentArea}>
          {activeTab === 'dashboard' && <DashboardOverview />}

          {activeTab === 'orders' && <OrderManager />}

          {activeTab === 'products' && <ProductManager />}

          {activeTab === 'vendors' && <VendorManager />}

          {activeTab === 'settlements' && <SettlementManager />}

          {activeTab === 'designs' && <DesignManager />}

          {activeTab === 'banners' && <BannerManager />}

          {activeTab === 'reviews' && <ReviewAdmin />}
          
          {activeTab === 'export-voucher' && (
            <div className={styles.recentOrders}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h2 style={{ margin: 0 }}>📝 수출바우처 사업계획서</h2>
                  <p style={{ color: '#666', fontSize: '14px', marginTop: 8 }}>
                    2026년 수출지원기반활용사업 사업계획서를 작성하고 AI와 협업할 수 있습니다.
                  </p>
                </div>
                <Link 
                  href="/export-voucher/business-plan" 
                  target="_blank"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    color: 'white',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: 14
                  }}
                >
                  <FileText size={18} />
                  사업계획서 열기
                  <ExternalLink size={14} />
                </Link>
              </div>
              
              <div style={{ 
                background: '#f8fafc', 
                borderRadius: 12, 
                padding: 24,
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16 }}>💡 사용 방법</h3>
                <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2, color: '#475569' }}>
                  <li><strong>"사업계획서 열기"</strong> 버튼을 클릭하여 새 탭에서 작성 페이지를 엽니다.</li>
                  <li>사업계획서 내용을 작성합니다.</li>
                  <li><strong>"🤖 AI 협업용 저장"</strong> 버튼을 클릭하면 AI가 내용을 확인할 수 있습니다.</li>
                  <li>AI에게 "내용 확인해줘"라고 요청하면 피드백을 받을 수 있습니다.</li>
                </ol>
              </div>
              
              <div style={{ 
                marginTop: 20, 
                padding: 16, 
                background: '#fef3c7', 
                borderRadius: 8,
                border: '1px solid #fcd34d',
                fontSize: 14,
                color: '#92400e'
              }}>
                ⚠️ <strong>주의:</strong> AI 협업용 저장 버튼을 눌러야만 AI가 내용을 읽을 수 있습니다. 임시 저장은 브라우저에만 저장됩니다.
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </div>
    </div>
  );
}
