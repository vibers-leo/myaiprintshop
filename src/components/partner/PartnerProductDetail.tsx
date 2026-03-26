'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  thumbnail: string;
  images?: string[];
  category?: string;
  rating?: number;
  reviewCount?: number;
  vendorId?: string;
  stock?: number;
}

interface PartnerProductDetailProps {
  product: Product;
  partnerId: string;
  partnerName: string;
}

/**
 * 파트너 서브도메인용 상품 상세 컴포넌트
 *
 * 상품 정보를 보여주고 장바구니 담기 또는 바로 구매 기능 제공
 */
export default function PartnerProductDetail({
  product,
  partnerId,
  partnerName,
}: PartnerProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.thumbnail);

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.thumbnail];

  const handleAddToCart = () => {
    // TODO: 실제 장바구니 기능 구현
    alert(`장바구니에 ${quantity}개 추가되었습니다.`);
  };

  const handleBuyNow = () => {
    // TODO: 바로 구매 플로우
    // 기존 checkout 페이지로 리다이렉트 또는
    // SDK 세션 생성 후 결제 페이지로 이동
    window.location.href = `/checkout?productId=${product.id}&quantity=${quantity}&partnerId=${partnerId}`;
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
        {/* 왼쪽: 이미지 */}
        <div>
          {/* 메인 이미지 */}
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          {/* 썸네일 목록 */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`relative aspect-square bg-gray-100 rounded overflow-hidden border-2 ${
                    selectedImage === image
                      ? 'border-blue-600'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 오른쪽: 상품 정보 */}
        <div>
          {/* 카테고리 */}
          {product.category && (
            <div className="text-sm text-gray-500 mb-2">{product.category}</div>
          )}

          {/* 상품명 */}
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          {/* 평점 */}
          {product.rating !== undefined && product.rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating!)
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
                {product.rating.toFixed(1)}
              </span>
              {product.reviewCount !== undefined && product.reviewCount > 0 && (
                <span className="text-sm text-gray-500">
                  ({product.reviewCount}개 리뷰)
                </span>
              )}
            </div>
          )}

          {/* 설명 */}
          <p className="text-gray-700 mb-6 whitespace-pre-line leading-relaxed">
            {product.description}
          </p>

          {/* 가격 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">판매가</div>
            <div className="text-3xl font-bold text-blue-600">
              {product.price.toLocaleString()}원
            </div>
          </div>

          {/* 재고 */}
          {product.stock !== undefined && (
            <div className="mb-6">
              {product.stock > 0 ? (
                <div className="text-sm text-green-600">
                  ✓ 재고 {product.stock}개 남음
                </div>
              ) : (
                <div className="text-sm text-red-600">품절</div>
              )}
            </div>
          )}

          {/* 수량 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">수량</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-20 h-10 border border-gray-300 rounded text-center"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          {/* 총 금액 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">총 금액</span>
              <span className="text-2xl font-bold text-blue-600">
                {(product.price * quantity).toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 py-4 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              장바구니
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              바로 구매
            </button>
          </div>

          {/* 판매자 정보 */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-xs text-yellow-800 space-y-1">
              <div>
                <strong>통신판매업자:</strong> GOODZZ(굿쯔)
              </div>
              <div>
                <strong>판매 채널:</strong> {partnerName}
              </div>
              <div className="text-yellow-700 mt-2">
                본 상품은 GOODZZ(굿쯔)가 판매하며,
                결제/배송/환불 등 모든 책임을 부담합니다.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 상세 설명 (탭) */}
      <div className="border-t border-gray-200 p-8">
        <h2 className="text-xl font-bold mb-4">상품 상세 정보</h2>

        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {product.description}
          </p>

          {/* TODO: 상세 설명 필드 추가 */}
        </div>
      </div>
    </div>
  );
}
