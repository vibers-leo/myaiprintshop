'use client';

import { useState } from 'react';
import Image from 'next/image';
import { markSessionUsed } from '@/lib/sdk-sessions';

interface CheckoutEmbedViewProps {
  session: any;
  product: any;
  sessionId: string;
}

/**
 * 결제 임베드 뷰 (클라이언트 컴포넌트)
 *
 * SDK에서 생성한 세션을 기반으로 결제를 진행합니다.
 *
 * 프로세스:
 * 1. 배송지 정보 입력
 * 2. 주문 생성 (기존 /api/payment/request 재사용)
 * 3. PortOne 결제 시작
 * 4. 결제 완료 후 세션 사용 처리
 * 5. 부모 창에 결과 전달 (postMessage)
 */
export default function CheckoutEmbedView({
  session,
  product,
  sessionId,
}: CheckoutEmbedViewProps) {
  const [loading, setLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    postalCode: '',
    address: '',
    addressDetail: '',
    memo: '',
  });

  // 약관 동의 상태 (전자상거래법 제13조 요구사항)
  const [agreements, setAgreements] = useState({
    terms: false,        // 이용약관 동의
    privacy: false,      // 개인정보 수집/이용 동의
    refund: false,       // 환불정책 확인
  });

  const quantity = session.options?.quantity || 1;
  const totalAmount = product.price * quantity;

  /**
   * 결제 시작
   * 기존 PortOne 결제 플로우와 통합
   */
  const handlePayment = async () => {
    // 필수 정보 검증
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      alert('배송지 정보를 모두 입력해주세요.');
      return;
    }

    // 약관 동의 검증 (전자상거래법 필수)
    if (!agreements.terms || !agreements.privacy || !agreements.refund) {
      alert('필수 약관에 모두 동의해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 1. 주문 생성 (기존 API 재사용)
      const orderResponse = await fetch('/api/payment/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              productId: product.id,
              vendorId: product.vendorId,
              quantity,
              price: product.price,
              name: product.name,
              thumbnail: product.thumbnail,
            },
          ],
          shippingInfo,
          metadata: {
            source: 'sdk',
            partnerId: session.partnerId,
            sessionId,
          },
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || '주문 생성 실패');
      }

      // 2. 세션 사용 처리
      await fetch(`/api/sdk/session/${sessionId}/use`, {
        method: 'POST',
      });

      // 3. PortOne 결제 시작
      // TODO: 실제 PortOne SDK 통합
      // 현재는 결제 요청 페이지로 리다이렉트
      // 실제 구현 시 PortOne.requestPayment() 사용

      console.log('Payment data:', {
        paymentId: orderData.paymentId,
        amount: orderData.amount,
        orderId: orderData.orderId,
      });

      // 부모 창에 결제 시작 알림
      window.parent.postMessage(
        {
          type: 'payment.started',
          data: {
            orderId: orderData.orderId,
            amount: orderData.amount,
          },
        },
        '*'
      );

      // 임시: 결제 성공 시뮬레이션 (실제로는 PortOne 콜백 처리)
      // 실제 구현에서는 PortOne.requestPayment() → 콜백 → postMessage
      setTimeout(() => {
        window.parent.postMessage(
          {
            type: 'payment.success',
            data: {
              orderId: orderData.orderId,
              amount: orderData.amount,
            },
          },
          '*'
        );
      }, 1000);

    } catch (error) {
      console.error('Payment failed:', error);

      // 부모 창에 에러 알림
      window.parent.postMessage(
        {
          type: 'payment.error',
          data: {
            error: (error as Error).message,
          },
        },
        '*'
      );

      alert('결제 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 취소 버튼 클릭
   */
  const handleCancel = () => {
    window.parent.postMessage(
      {
        type: 'payment.cancel',
        data: {},
      },
      '*'
    );

    // 부모 창이 있으면 창 닫기, 없으면 뒤로가기
    if (window.parent !== window) {
      window.close();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">결제하기</h1>

      {/* 주문 요약 */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="font-medium mb-4">주문 상품</h2>

        <div className="flex gap-4">
          {product.thumbnail && (
            <div className="relative w-20 h-20 flex-shrink-0">
              <Image
                src={product.thumbnail}
                alt={product.name}
                fill
                className="object-cover rounded"
              />
            </div>
          )}

          <div className="flex-1">
            <h3 className="font-medium mb-1">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {product.price.toLocaleString()}원 × {quantity}개
            </p>
            <p className="text-lg font-bold text-blue-600">
              {totalAmount.toLocaleString()}원
            </p>
          </div>
        </div>
      </div>

      {/* 배송지 정보 */}
      <div className="mb-8">
        <h2 className="font-medium mb-4">배송지 정보</h2>

        <div className="space-y-4">
          {/* 받는 분 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              받는 분 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={shippingInfo.name}
              onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
              placeholder="홍길동"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={shippingInfo.phone}
              onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
              placeholder="010-1234-5678"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 우편번호 */}
          <div>
            <label className="block text-sm font-medium mb-2">우편번호</label>
            <input
              type="text"
              value={shippingInfo.postalCode}
              onChange={(e) =>
                setShippingInfo({ ...shippingInfo, postalCode: e.target.value })
              }
              placeholder="12345"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 주소 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              주소 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={shippingInfo.address}
              onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
              placeholder="서울시 강남구 테헤란로 123"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 상세 주소 */}
          <div>
            <label className="block text-sm font-medium mb-2">상세 주소</label>
            <input
              type="text"
              value={shippingInfo.addressDetail}
              onChange={(e) =>
                setShippingInfo({ ...shippingInfo, addressDetail: e.target.value })
              }
              placeholder="101동 1001호"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 배송 메모 */}
          <div>
            <label className="block text-sm font-medium mb-2">배송 메모</label>
            <textarea
              value={shippingInfo.memo}
              onChange={(e) => setShippingInfo({ ...shippingInfo, memo: e.target.value })}
              placeholder="부재 시 경비실에 맡겨주세요"
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 약관 동의 (전자상거래법 필수) */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="font-medium mb-4">약관 동의</h2>

        <div className="space-y-3">
          {/* 이용약관 동의 */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreements.terms}
              onChange={(e) => setAgreements({ ...agreements, terms: e.target.checked })}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="flex-1 text-sm">
              <span className="text-red-500 font-medium">[필수]</span>{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                이용약관
              </a>
              에 동의합니다.
            </span>
          </label>

          {/* 개인정보 수집/이용 동의 */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreements.privacy}
              onChange={(e) => setAgreements({ ...agreements, privacy: e.target.checked })}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="flex-1 text-sm">
              <span className="text-red-500 font-medium">[필수]</span>{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                개인정보 수집 및 이용
              </a>
              에 동의합니다.
            </span>
          </label>

          {/* 환불정책 확인 */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreements.refund}
              onChange={(e) => setAgreements({ ...agreements, refund: e.target.checked })}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="flex-1 text-sm">
              <span className="text-red-500 font-medium">[필수]</span>{' '}
              <a
                href="/refund"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                환불 및 교환 정책
              </a>
              을 확인했으며 이에 동의합니다.
            </span>
          </label>

          {/* 전체 동의 */}
          <div className="pt-3 border-t border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreements.terms && agreements.privacy && agreements.refund}
                onChange={(e) =>
                  setAgreements({
                    terms: e.target.checked,
                    privacy: e.target.checked,
                    refund: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium">전체 약관에 동의합니다</span>
            </label>
          </div>
        </div>
      </div>

      {/* 결제 금액 */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium">총 결제 금액</span>
          <span className="text-2xl font-bold text-blue-600">
            {totalAmount.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-4">
        <button
          onClick={handleCancel}
          className="flex-1 py-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          취소
        </button>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="flex-1 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '처리 중...' : `${totalAmount.toLocaleString()}원 결제하기`}
        </button>
      </div>

      {/* 개발자 노트 */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
        <p className="font-medium text-yellow-800 mb-2">🚧 개발 노트</p>
        <p className="text-yellow-700">
          실제 PortOne 결제 통합은 기존 시스템과 연동하여 구현됩니다.<br />
          현재는 데모 플로우로 결제 시작/완료 이벤트를 시뮬레이션합니다.
        </p>
      </div>
    </div>
  );
}
