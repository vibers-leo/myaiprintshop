'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { ArrowLeft, CreditCard, ShoppingBag, Smartphone, Loader2 } from 'lucide-react';
import { TOSS_CONFIG } from '@/lib/payment';
import { useAuth } from '@/context/AuthContext';

// 결제 수단 타입
type PaymentMethod = 'CARD' | 'EASY_PAY' | 'VIRTUAL_ACCOUNT' | 'TRANSFER';

export default function CheckoutPage() {
  const { cart, clearCart } = useStore();
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    postcode: '',
    address: '',
    detailAddress: '',
    memo: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [portoneLoaded, setPortoneLoaded] = useState(false);

  // 쿠폰
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountType: string; discountValue: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 유저 정보가 있으면 폼에 채워넣기
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
      }));
    }

    // 토스 페이먼츠 SDK 로드
    const loadToss = async () => {
      try {
        const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk');
        const toss = await loadTossPayments(TOSS_CONFIG.clientKey);
        (window as any).TossPayments = toss;
        setPortoneLoaded(true);
        console.log('✅ Toss Payments SDK loaded');
      } catch (error) {
        console.error('Failed to load Toss SDK:', error);
      }
    };
    
    loadToss();
  }, [user]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 50000 ? 0 : 3000;

  // 쿠폰 할인 계산
  const couponDiscount = appliedCoupon
    ? appliedCoupon.discountType === 'fixed'
      ? appliedCoupon.discountValue
      : Math.round(subtotal * appliedCoupon.discountValue / 100)
    : 0;
  const total = Math.max(0, subtotal + shipping - couponDiscount);

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponCode.trim().toUpperCase())}&amount=${subtotal}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || '쿠폰을 사용할 수 없습니다.');
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon({ code: data.coupon.code, discountType: data.coupon.discountType, discountValue: data.coupon.discountValue });
      toast.success(`쿠폰이 적용되었습니다! (-₩${data.discount.toLocaleString()})`);
    } catch {
      toast.error('쿠폰 확인에 실패했습니다.');
    } finally {
      setCouponLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 다음 우편번호 검색
  const openPostcode = () => {
    new (window as any).daum.Postcode({
      oncomplete: (data: any) => {
        const fullAddress = `[${data.zonecode}] ${data.roadAddress}`;
        setFormData(prev => ({
          ...prev,
          postcode: data.zonecode,
          address: fullAddress,
        }));
      }
    }).open();
  };

  // 결제 진행
  const handlePayment = async () => {
    // 유효성 검사
    if (!formData.name.trim()) {
      toast.error('받는 분 이름을 입력해주세요.');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('연락처를 입력해주세요.');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('배송 주소를 입력해주세요.');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('이메일을 입력해주세요.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. 주문 생성 API 호출
      const orderResponse = await fetch('/api/payment/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.productId,
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
            options: {
              size: item.size,
              color: item.color,
              customDesign: item.customDesignUrl,
              customOptions: item.selectedOptions, // Pass serialized options
            },
          })),
          shippingInfo: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            addressDetail: formData.detailAddress,
            postalCode: formData.postcode,
            memo: formData.memo,
          },
          totalAmount: subtotal,
          shippingFee: shipping,
          userId: user?.uid || null,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.error || '주문 생성에 실패했습니다.');
      }

      const { orderId, paymentRequest } = orderData;
      console.log('📦 Order created:', orderId);

      // 2. 토스 결제창 호출
      const toss = (window as any).TossPayments;

      if (!toss) {
        console.log('⚠️ Toss SDK not loaded, using test mode');
        await handleTestPayment(orderId);
        return;
      }

      const tossMethod = paymentMethod === 'CARD' ? '카드'
        : paymentMethod === 'EASY_PAY' ? '간편결제'
        : paymentMethod === 'VIRTUAL_ACCOUNT' ? '가상계좌'
        : '계좌이체';

      // 토스 결제위젯이 아닌 일반 결제 (requestPayment)
      const payment = toss.payment({ customerKey: user?.uid || `guest_${Date.now()}` });
      await payment.requestPayment({
        method: tossMethod,
        amount: { currency: 'KRW', value: total },
        orderId,
        orderName: paymentRequest.orderName,
        customerName: paymentRequest.customer.name,
        customerEmail: paymentRequest.customer.email,
        customerMobilePhone: paymentRequest.customer.phone?.replace(/-/g, ''),
        successUrl: `${window.location.origin}/checkout/success?orderId=${orderId}&amount=${total}`,
        failUrl: `${window.location.origin}/checkout/fail?orderId=${orderId}`,
      });

      // 토스는 successUrl로 리다이렉트되므로 여기에 도달하지 않음

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || '결제 처리 중 오류가 발생했습니다.');
      setIsProcessing(false);
    }
  };

  // 테스트 결제 (포트원 SDK 없이)
  const handleTestPayment = async (orderId: string) => {
    const testPaymentId = `test-payment-${Date.now()}`;
    
    // 2초 대기 후 결제 완료 처리
    await new Promise(resolve => setTimeout(resolve, 2000));
    await verifyPayment(testPaymentId, orderId);
  };

  // 결제 검증
  const verifyPayment = async (paymentId: string, orderId: string) => {
    try {
      const verifyResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, orderId }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.success) {
        throw new Error(verifyData.error || '결제 검증에 실패했습니다.');
      }

      console.log('✅ Payment verified:', verifyData);
      
      // 성공!
      toast.success('결제가 완료되었습니다! 🎉');
      clearCart();
      
      // 주문 완료 페이지로 이동
      router.push(`/order-success/${orderId}`);

    } catch (error: any) {
      throw error;
    }
  };

  if (!mounted) return <div className="min-h-screen bg-white"></div>;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">장바구니가 비어있어 주문할 수 없습니다.</p>
          <Link href="/shop" className="text-emerald-600 underline font-bold">스토어로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 min-h-screen">
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />
      <Link href="/cart" className="inline-flex items-center text-gray-500 hover:text-black mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> 장바구니로 돌아가기
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left: Input Form */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">주문/결제</h1>
          
          <div className="space-y-8">
            {/* Shipping Info */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📍</span> 배송지 정보
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">받는 분 *</label>
                    <input 
                      type="text" name="name" 
                      value={formData.name} onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                      placeholder="이름"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">연락처 *</label>
                    <input 
                      type="tel" name="phone" 
                      value={formData.phone} onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                      placeholder="010-0000-0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일 *</label>
                  <input 
                    type="email" name="email" 
                    value={formData.email} onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">주소 *</label>
                  <div className="flex gap-2 mb-2">
                    <input 
                      type="text" name="postcode" 
                      value={formData.postcode} onChange={handleInputChange}
                      className="w-1/3 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                      placeholder="우편번호"
                    />
                    <button type="button" onClick={openPostcode} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200">
                      주소 찾기
                    </button>
                  </div>
                  <input 
                    type="text" name="address" 
                    value={formData.address} onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg mb-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                    placeholder="기본 주소"
                  />
                  <input 
                    type="text" name="detailAddress" 
                    value={formData.detailAddress} onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                    placeholder="상세 주소 (동/호수)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">배송 메모</label>
                  <input 
                    type="text" name="memo" 
                    value={formData.memo} onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                    placeholder="배송 시 요청사항을 입력해주세요"
                  />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>💳</span> 결제 수단
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-4 border-2 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'CARD' 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  신용카드
                </button>
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('EASY_PAY')}
                  className={`p-4 border-2 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'EASY_PAY' 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Smartphone className="w-6 h-6" />
                  간편결제
                </button>
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('VIRTUAL_ACCOUNT')}
                  className={`p-4 border-2 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'VIRTUAL_ACCOUNT' 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">🏦</span>
                  가상계좌
                </button>
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('TRANSFER')}
                  className={`p-4 border-2 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'TRANSFER' 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">📲</span>
                  계좌이체
                </button>
              </div>
              
              {/* 테스트 모드 안내 */}
              {!portoneLoaded && (
                <p className="mt-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  ⚠️ 테스트 모드로 실행 중입니다. 실제 결제는 진행되지 않습니다.
                </p>
              )}
            </section>

            {/* Coupon */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">쿠폰 할인</h2>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div>
                    <span className="font-bold text-purple-700">{appliedCoupon.code}</span>
                    <span className="text-sm text-purple-500 ml-2">
                      -{appliedCoupon.discountType === 'fixed' ? `₩${appliedCoupon.discountValue.toLocaleString()}` : `${appliedCoupon.discountValue}%`}
                    </span>
                  </div>
                  <button
                    onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } }}
                    placeholder="쿠폰 코드 입력"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none uppercase font-mono"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-5 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {couponLoading ? '확인중...' : '적용'}
                  </button>
                </div>
              )}
            </section>

            {/* Order Summary (Mobile) */}
            <section className="block lg:hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> 주문 상품 ({cart.length})
              </h2>

              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.cartId} className="flex gap-3 items-center">
                    <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100 relative">
                      <Image src={item.thumbnail} className="object-cover" fill sizes="56px" alt={item.name} />
                      {item.customDesignUrl && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-2/3 h-2/3">
                            <Image src={item.customDesignUrl} className="object-contain mix-blend-multiply opacity-90" fill sizes="56px" alt="Custom" unoptimized />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.color} / {item.size} / {item.quantity}개</p>
                    </div>
                    <span className="font-bold text-sm">{(item.price * item.quantity).toLocaleString()}원</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 py-4 border-t border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>상품 금액</span>
                  <span>{subtotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>배송비</span>
                  <span className={shipping === 0 ? 'text-emerald-600 font-bold' : ''}>
                    {shipping === 0 ? '무료' : `${shipping.toLocaleString()}원`}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-purple-600 font-medium">
                    <span>쿠폰 할인</span>
                    <span>-{couponDiscount.toLocaleString()}원</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center py-4 border-t border-gray-100">
                <span className="font-bold text-gray-900">총 결제 금액</span>
                <span className="font-bold text-xl text-emerald-600">{total.toLocaleString()}원</span>
              </div>
            </section>

            {/* Submit Button (Mobile) */}
            <div className="block lg:hidden">
              <button
                type="button"
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-emerald-700 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    결제 진행 중...
                  </>
                ) : (
                  '결제하기'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Order Summary (Desktop) */}
        <div className="hidden lg:block">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" /> 주문 상품 ({cart.length})
            </h2>

            <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.cartId} className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100 relative">
                    <Image src={item.thumbnail} className="object-cover" fill sizes="64px" alt={item.name} />
                    {item.customDesignUrl && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-2/3 h-2/3">
                          <Image src={item.customDesignUrl} className="object-contain mix-blend-multiply opacity-90" fill sizes="64px" alt="Custom" unoptimized />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.color} / {item.size} / {item.quantity}개</p>
                  </div>
                  <span className="font-bold text-sm">{(item.price * item.quantity).toLocaleString()}원</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-100 text-gray-600 text-sm">
              <div className="flex justify-between">
                <span>상품 금액</span>
                <span>{subtotal.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span>배송비</span>
                <span className={shipping === 0 ? 'text-emerald-600 font-bold' : ''}>
                  {shipping === 0 ? '무료' : `${shipping.toLocaleString()}원`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">
                  {(50000 - subtotal).toLocaleString()}원 더 구매하시면 무료배송!
                </p>
              )}
            </div>

            <div className="flex justify-between items-center py-6 border-t border-gray-100 mt-4">
              <span className="font-bold text-lg text-gray-900">총 결제 금액</span>
              <span className="font-bold text-2xl text-emerald-600">{total.toLocaleString()}원</span>
            </div>

            <button 
              type="button"
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  결제 진행 중...
                </>
              ) : (
                '결제하기'
              )}
            </button>
            
            <p className="mt-4 text-xs text-gray-400 text-center">
              주문 내용을 확인하였으며, 정보 제공 등에 동의합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
