'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Package, 
  Truck, 
  ChevronLeft, 
  CreditCard, 
  MapPin, 
  Clock, 
  ExternalLink,
  MessageSquare,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/payment';
import { toast } from 'sonner';
import ReviewModal from '@/components/ReviewModal';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!user || !id) return;
      
      try {
        const response = await fetch(`/api/orders?orderId=${id}`);
        const data = await response.json();
        
        if (data.success) {
          // 보안: 자신의 주문인지 확인 (서버에서도 체크하겠지만 프론트에서도 필터링)
          if (data.order.userId !== user.uid) {
            toast.error('권한이 없습니다.');
            router.push('/mypage/orders');
            return;
          }
          setOrder(data.order);
        } else {
          toast.error('주문 정보를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('Error fetching order detail:', error);
        toast.error('오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!user) {
        router.push('/');
        return;
      }
      fetchOrderDetail();
    }
  }, [id, user, authLoading, router]);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: '결제대기',
      PAID: '결제완료',
      PREPARING: '제작중',
      SHIPPED: '배송중',
      DELIVERED: '배송완료',
      CANCELLED: '취소됨',
    };
    return labels[status] || status;
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
        <p className="text-gray-500 font-medium tracking-tight">주문 상세 정보를 가져오는 중...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <Package className="mx-auto text-gray-300 mb-4" size={60} />
        <p className="text-gray-500 text-lg font-bold">주문을 찾을 수 없습니다.</p>
        <Link href="/mypage/orders" className="text-emerald-600 font-bold mt-4 inline-block hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const subtotal = order.totalAmount;
  const total = subtotal + order.shippingFee;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold group"
        >
          <ChevronLeft className="group-hover:-translate-x-1 transition-transform" /> 주문 목록으로
        </button>
        <div className="text-right">
          <p className="text-xs text-gray-400 font-mono">주문번호: {order.id}</p>
          <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-emerald-600 rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-emerald-100 relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-emerald-200 text-sm font-bold uppercase tracking-widest opacity-80">Current Status</span>
            <h1 className="text-4xl font-black mt-1">{getStatusLabel(order.orderStatus)}</h1>
            <p className="text-emerald-50 text-sm mt-3 opacity-90 max-w-sm">
              {order.orderStatus === 'PAID' && '결제가 확인되었습니다. 곧 제작이 시작될 예정입니다.'}
              {order.orderStatus === 'PREPARING' && '세상에 단 하나뿐인 당신의 디자인이 제품에 입혀지고 있습니다.'}
              {order.orderStatus === 'SHIPPED' && '제작이 완료되어 배송팀에 전달되었습니다.'}
              {order.orderStatus === 'DELIVERED' && '배송이 완료되었습니다. 마음에 드신다면 리뷰를 남겨주세요!'}
            </p>
          </div>
          <div className="relative z-10 flex flex-col gap-3 w-full md:w-auto">
            {order.shippingInfo.trackingNumber && (
              <a 
                href={`https://tracker.delivery/track/${order.shippingInfo.carrier || '대한통운'}/${order.shippingInfo.trackingNumber}`}
                target="_blank"
                className="bg-white text-emerald-600 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all shadow-lg active:scale-95"
              >
                <Truck size={20} /> 실시간 배송조회
              </a>
            )}
            {order.orderStatus === 'DELIVERED' && (
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="bg-emerald-800/30 backdrop-blur-md text-white border border-emerald-400/30 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-800/50 transition-all active:scale-95"
              >
                <MessageSquare size={20} /> 리뷰 작성하기
              </button>
            )}
          </div>
          {/* Background Decorative Icon */}
          <Package className="absolute right-[-40px] bottom-[-40px] text-white opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000" size={240} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Order Items */}
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="text-emerald-500" size={20} /> 주문 상품 상세
            </h2>
            <div className="divide-y divide-gray-50">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-6 first:pt-0 last:pb-0">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0 relative group">
                      <Image
                        src={item.options?.customDesign || 'https://via.placeholder.com/150'}
                        className="object-cover transition-transform group-hover:scale-110 duration-500"
                        alt={item.productName}
                        fill
                        unoptimized
                      />
                      {item.options?.customDesign && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">AI DESIGN</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{item.productName}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
                        {item.options?.color && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-200" />색상: {item.options.color}</span>}
                        {item.options?.size && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-200" />사이즈: {item.options.size}</span>}
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-200" />수량: {item.quantity}개</span>
                      </div>
                      <p className="font-black text-gray-900">{item.price.toLocaleString()}원</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 벤더 정보 */}
            {order.vendorOrders && order.vendorOrders.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">판매자</p>
                <div className="flex flex-wrap gap-3">
                  {order.vendorOrders.map((vo: any, i: number) => (
                    <div key={i} className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-100 rounded-xl">
                      <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {vo.vendorName?.charAt(0) || 'V'}
                      </span>
                      <span className="text-sm font-medium text-purple-700">{vo.vendorName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-500 font-medium">
                        {vo.status === 'pending' ? '준비중' : vo.status === 'shipped' ? '배송중' : vo.status === 'delivered' ? '배송완료' : vo.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Payment Info */}
          <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="text-emerald-500" size={20} /> 결제 정보
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>총 상품 금액</span>
                <span className="font-medium">{subtotal.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>배송비</span>
                <span className="font-medium">{order.shippingFee === 0 ? '무료배송' : `+ ${order.shippingFee.toLocaleString()}원`}</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-gray-900">
                <span className="font-bold text-lg">최종 결제 금액</span>
                <span className="font-black text-2xl text-emerald-600">{total.toLocaleString()}원</span>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100 text-gray-400">
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter leading-none">Payment Method</p>
                    <p className="text-sm font-bold text-gray-700 mt-1">전자결제 (카드/간편결제)</p>
                  </div>
                </div>
                {order.paymentId && (
                  <span className="text-[10px] font-mono text-gray-300">ID: {order.paymentId}</span>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Shipping Info */}
        <div className="space-y-8">
          <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm sticky top-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="text-emerald-500" size={20} /> 배송지 정보
            </h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Receiver</label>
                <p className="font-bold text-gray-800 text-lg leading-tight">{order.shippingInfo.name}</p>
                <p className="text-sm text-gray-500 mt-1">{order.shippingInfo.phone}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Address</label>
                <p className="text-sm text-gray-800 leading-relaxed">
                  [{order.shippingInfo.postalCode}]<br />
                  {order.shippingInfo.address}<br />
                  {order.shippingInfo.addressDetail}
                </p>
              </div>
              {order.shippingInfo.memo && (
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Memo</label>
                  <p className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-xl">"{order.shippingInfo.memo}"</p>
                </div>
              )}
              
              {order.shippingInfo.trackingNumber && (
                <div className="pt-6 border-t border-gray-100">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Delivery Status</label>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="text-xs font-bold text-emerald-700">{order.shippingInfo.carrier}</span>
                    <span className="text-sm font-mono font-bold text- emerald-900">{order.shippingInfo.trackingNumber}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Customer Support Info */}
          <div className="p-8 bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl text-white shadow-xl shadow-gray-200">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                 <Clock className="text-emerald-400" size={20} />
               </div>
               <h3 className="font-bold">고객센터 안내</h3>
             </div>
             <p className="text-xs text-gray-400 leading-relaxed mb-4">
               배송 지연이나 제품 하자 등 문의사항은 고객센터(1600-0000) 또는 1:1 문의를 이용해주세요.
             </p>
             <button className="w-full py-3 bg-emerald-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors">
               <MessageSquare size={16} /> 1:1 상담하기
             </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {order && user && order.items.length > 0 && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          orderId={order.id}
          productId={order.items[0].productId} // 우선 첫 번째 상품 기준
          productName={order.items[0].productName}
          userId={user.uid}
          userName={user.displayName || '고객'}
        />
      )}
    </div>
  );
}
