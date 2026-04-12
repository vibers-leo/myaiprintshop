'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, Loader2, Truck, CheckCircle, Clock, ArrowLeft, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface VendorOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  thumbnail?: string;
}

interface VendorOrderData {
  orderId: string;
  createdAt: string;
  customer: string;
  items: VendorOrderItem[];
  subtotal: number;
  commission: number;
  vendorAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingInfo?: { trackingNumber?: string; carrier?: string; shippedAt?: string };
  shippingAddress?: { name: string; phone: string; address: string; detailAddress?: string; zipCode?: string };
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: '신규 주문', color: 'bg-blue-100 text-blue-700', icon: <Clock className="w-4 h-4" /> },
  confirmed: { label: '확인됨', color: 'bg-yellow-100 text-yellow-700', icon: <CheckCircle className="w-4 h-4" /> },
  shipped: { label: '배송중', color: 'bg-purple-100 text-purple-700', icon: <Truck className="w-4 h-4" /> },
  delivered: { label: '배송완료', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { label: '취소', color: 'bg-red-100 text-red-700', icon: <Clock className="w-4 h-4" /> },
};

export default function VendorOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<VendorOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState('');
  const [shipForm, setShipForm] = useState<{ orderId: string; carrier: string; trackingNumber: string } | null>(null);
  const [shipping, setShipping] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const vendorsRes = await fetch('/api/vendors');
        const vendorsData = await vendorsRes.json();
        const vendor = vendorsData.vendors?.find((v: any) => v.ownerId === user.uid);
        if (!vendor) { toast.error('판매자 정보를 찾을 수 없습니다.'); return; }
        setVendorId(vendor.id);

        const res = await fetch(`/api/vendors/orders?vendorId=${vendor.id}`);
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      } catch { toast.error('주문 목록을 불러올 수 없습니다.'); }
      finally { setLoading(false); }
    })();
  }, [user]);

  async function handleShip() {
    if (!shipForm || !shipForm.trackingNumber.trim()) {
      toast.error('운송장 번호를 입력해주세요.');
      return;
    }
    setShipping(true);
    try {
      const res = await fetch('/api/vendors/orders/ship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: shipForm.orderId, vendorId, ...shipForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      setShipForm(null);
      // 목록 새로고침
      setOrders((prev) => prev.map((o) =>
        o.orderId === shipForm.orderId ? { ...o, status: 'shipped' as const, shippingInfo: { trackingNumber: shipForm.trackingNumber, carrier: shipForm.carrier, shippedAt: new Date().toISOString() } } : o
      ));
    } catch (err: any) {
      toast.error(err.message || '배송 처리 실패');
    } finally {
      setShipping(false);
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    totalAmount: orders.reduce((sum, o) => sum + o.vendorAmount, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={() => router.push('/mypage/vendor/dashboard')}
            className="mb-6 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> 대시보드
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">주문 관리</h1>
              <p className="text-gray-600">들어온 주문을 확인하고 처리하세요</p>
            </div>
          </div>
        </motion.div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '전체 주문', value: stats.total, color: 'text-gray-900' },
            { label: '신규 주문', value: stats.pending, color: 'text-blue-600' },
            { label: '배송중', value: stats.shipped, color: 'text-purple-600' },
            { label: '정산 예정', value: `₩${stats.totalAmount.toLocaleString()}`, color: 'text-green-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200 text-center">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* 필터 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { key: 'all', label: '전체' },
            { key: 'pending', label: '신규' },
            { key: 'confirmed', label: '확인됨' },
            { key: 'shipped', label: '배송중' },
            { key: 'delivered', label: '완료' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.key ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 주문 목록 */}
        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((order, i) => {
              const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
              const isExpanded = expandedId === order.orderId;

              return (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                >
                  {/* 헤더 */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.orderId)}
                    className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">
                          {order.items.map((item) => item.productName).join(', ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('ko-KR')} · {order.customer}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="font-bold text-gray-900">₩{order.vendorAmount.toLocaleString()}</span>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </button>

                  {/* 상세 */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                      {/* 상품 */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">주문 상품</p>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 py-2">
                            {item.thumbnail && (
                              <img src={item.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover border" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                              <p className="text-xs text-gray-500">{item.quantity}개 × ₩{item.price.toLocaleString()}</p>
                            </div>
                            <p className="text-sm font-bold text-gray-900">₩{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>

                      {/* 금액 */}
                      <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                        <div className="flex justify-between"><span className="text-gray-500">상품 금액</span><span>₩{order.subtotal.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">수수료</span><span className="text-red-500">-₩{order.commission.toLocaleString()}</span></div>
                        <div className="flex justify-between font-bold border-t border-gray-200 pt-1 mt-1"><span>정산 예정</span><span className="text-green-600">₩{order.vendorAmount.toLocaleString()}</span></div>
                      </div>

                      {/* 배송지 */}
                      {order.shippingAddress && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> 배송지</p>
                          <div className="text-sm text-gray-700">
                            <p>{order.shippingAddress.name} · {order.shippingAddress.phone}</p>
                            <p>{order.shippingAddress.address} {order.shippingAddress.detailAddress}</p>
                            {order.shippingAddress.zipCode && <p className="text-gray-400">[{order.shippingAddress.zipCode}]</p>}
                          </div>
                        </div>
                      )}

                      {/* 운송장 */}
                      {order.shippingInfo?.trackingNumber && (
                        <div className="bg-purple-50 rounded-xl p-3 text-sm">
                          <span className="text-purple-600 font-semibold">{order.shippingInfo.carrier}</span>
                          <span className="text-purple-800 ml-2 font-mono">{order.shippingInfo.trackingNumber}</span>
                        </div>
                      )}

                      {/* 배송 처리 */}
                      {(order.status === 'pending' || order.status === 'confirmed') && (
                        shipForm?.orderId === order.orderId ? (
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <label className="text-xs text-gray-500 mb-1 block">택배사</label>
                              <input
                                value={shipForm.carrier}
                                onChange={(e) => setShipForm({ ...shipForm, carrier: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                placeholder="CJ대한통운"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-gray-500 mb-1 block">운송장 번호</label>
                              <input
                                value={shipForm.trackingNumber}
                                onChange={(e) => setShipForm({ ...shipForm, trackingNumber: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                                placeholder="123456789012"
                              />
                            </div>
                            <button onClick={handleShip} disabled={shipping} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50 whitespace-nowrap">
                              {shipping ? '처리중...' : '발송'}
                            </button>
                            <button onClick={() => setShipForm(null)} className="px-3 py-2 text-gray-500 text-sm hover:text-gray-700">취소</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShipForm({ orderId: order.orderId, carrier: '', trackingNumber: '' })}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-100 border border-purple-200"
                          >
                            <Truck className="w-4 h-4" /> 배송 처리
                          </button>
                        )
                      )}

                      <p className="text-[11px] text-gray-400">주문번호: {order.orderId}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {filter === 'all' ? '아직 들어온 주문이 없습니다.' : '해당 상태의 주문이 없습니다.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
