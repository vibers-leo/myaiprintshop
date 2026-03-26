'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  thumbnail: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
}

interface PartnerProductListProps {
  products: Product[];
  partnerId: string;
  partnerName: string;
}

/**
 * 파트너 서브도메인용 상품 목록 컴포넌트
 *
 * 파트너 브랜딩을 유지하면서 상품을 표시합니다.
 */
export default function PartnerProductList({
  products,
  partnerId,
  partnerName,
}: PartnerProductListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">현재 판매 중인 상품이 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold">전체 상품</h2>
        <p className="text-gray-600 mt-1">{products.length}개 상품</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/partner/${partnerId}/products/${product.id}`}
            className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* 상품 이미지 */}
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={product.thumbnail}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* 상품 정보 */}
            <div className="p-4">
              {/* 카테고리 */}
              {product.category && (
                <div className="text-xs text-gray-500 mb-1">
                  {product.category}
                </div>
              )}

              {/* 상품명 */}
              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600">
                {product.name}
              </h3>

              {/* 설명 */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.description}
              </p>

              {/* 평점 */}
              {product.rating !== undefined && product.rating > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
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
                  {product.reviewCount !== undefined && product.reviewCount > 0 && (
                    <span className="text-xs text-gray-500">
                      ({product.reviewCount})
                    </span>
                  )}
                </div>
              )}

              {/* 가격 */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  {product.price.toLocaleString()}원
                </span>

                <button className="text-sm text-blue-600 group-hover:underline">
                  자세히 →
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 파트너 정보 배너 (선택사항) */}
      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">
          {partnerName}에서 제공하는 서비스
        </h3>
        <p className="text-sm text-blue-700">
          모든 상품은 GOODZZ(굿쯔)가 통신판매업자로서 판매하며,
          결제, 배송, 환불 등 모든 책임을 부담합니다.
          안심하고 구매하세요.
        </p>
      </div>
    </div>
  );
}
