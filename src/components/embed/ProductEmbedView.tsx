'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductEmbedViewProps {
  product: any;
  partnerId: string;
  partnerName: string;
  apiKey: string;
}

/**
 * 상품 임베드 뷰 (클라이언트 컴포넌트)
 *
 * iframe 내에서 렌더링되는 상품 상세 화면
 * "지금 구매" 버튼 클릭 시 결제 페이지로 이동
 */
export default function ProductEmbedView({
  product,
  partnerId,
  partnerName,
  apiKey,
}: ProductEmbedViewProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  /**
   * 구매 버튼 클릭 핸들러
   * 세션을 생성하고 결제 페이지로 이동
   */
  const handleBuyNow = async () => {
    setLoading(true);

    try {
      // 세션 생성
      const response = await fetch('/api/sdk/session/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          productId: product.id,
          options: {
            quantity,
          },
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '세션 생성 실패');
      }

      // 부모 창에 구매 시작 알림
      if (window.parent !== window) {
        window.parent.postMessage(
          {
            type: 'embed.checkoutStarted',
            data: {
              productId: product.id,
              sessionId: data.sessionId,
            },
          },
          '*'
        );
      }

      // 결제 페이지로 이동
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error('Failed to start checkout:', error);
      alert('구매 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 상품 클릭 시 부모 창에 알림
   */
  const handleProductClick = () => {
    if (window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'embed.productSelected',
          data: {
            productId: product.id,
            productName: product.name,
          },
        },
        '*'
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* 상품 이미지 */}
      <div
        className="relative aspect-square mb-6 rounded-lg overflow-hidden cursor-pointer"
        onClick={handleProductClick}
      >
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">이미지 없음</span>
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

        {product.description && (
          <p className="text-gray-600 mb-4 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* 가격 */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold text-blue-600">
            {(product.price * quantity).toLocaleString()}원
          </span>
          {quantity > 1 && (
            <span className="text-sm text-gray-500">
              ({product.price.toLocaleString()}원 × {quantity})
            </span>
          )}
        </div>

        {/* 판매자 정보 */}
        {product.vendorName && (
          <div className="text-sm text-gray-500 mb-4">
            판매: {product.vendorName}
          </div>
        )}

        {/* 평점 */}
        {product.rating > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating.toFixed(1)} ({product.reviewCount || 0}개 리뷰)
            </span>
          </div>
        )}
      </div>

      {/* 수량 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">수량</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 border rounded-lg hover:bg-gray-50 flex items-center justify-center"
            disabled={quantity <= 1}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 px-3 py-2 text-center border rounded-lg"
          />

          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 border rounded-lg hover:bg-gray-50 flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* 구매 버튼 */}
      <button
        onClick={handleBuyNow}
        disabled={loading}
        className="w-full py-4 bg-blue-600 text-white rounded-lg font-medium text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '처리 중...' : '지금 구매'}
      </button>

      {/* Powered by */}
      <div className="mt-6 text-center text-xs text-gray-400">
        Powered by{' '}
        <a
          href="https://goodzz.co.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          GOODZZ
        </a>
      </div>
    </div>
  );
}
