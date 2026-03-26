import { validateApiKey } from '@/lib/api-auth';
import { getProductById } from '@/lib/products';
import ProductEmbedView from '@/components/embed/ProductEmbedView';

/**
 * GET /embed/product/[id]?apiKey=xxx
 *
 * iframe에 임베드 가능한 상품 상세 페이지
 *
 * 특징:
 * - API 키로 접근 제어
 * - 미니멀 UI (헤더/푸터 없음)
 * - "지금 구매" 버튼으로 결제 플로우 시작
 *
 * 사용 예시:
 * ```html
 * <iframe
 *   src="https://goodzz.co.kr/embed/product/prod_123?apiKey=sk_live_xxx"
 *   width="400"
 *   height="600"
 *   frameborder="0"
 * ></iframe>
 * ```
 */
export default async function EmbedProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ apiKey?: string }>;
}) {
  const { id } = await params;
  const { apiKey } = await searchParams;

  // 1. API 키 검증
  if (!apiKey) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 font-medium mb-2">
          ❌ API 키가 필요합니다
        </div>
        <p className="text-sm text-gray-600">
          URL에 apiKey 파라미터를 포함해주세요.
        </p>
        <code className="mt-4 block text-xs bg-gray-100 p-2 rounded">
          ?apiKey=sk_live_xxx
        </code>
      </div>
    );
  }

  const partner = await validateApiKey(apiKey);
  if (!partner) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 font-medium mb-2">
          ❌ 유효하지 않은 API 키
        </div>
        <p className="text-sm text-gray-600">
          API 키를 확인하고 다시 시도해주세요.
        </p>
      </div>
    );
  }

  // 2. Embed 기능 확인
  if (partner.features && !partner.features.embedEnabled) {
    return (
      <div className="p-8 text-center">
        <div className="text-orange-600 font-medium mb-2">
          ⚠️ Embed 기능이 비활성화되어 있습니다
        </div>
        <p className="text-sm text-gray-600">
          파트너 대시보드에서 Embed 기능을 활성화해주세요.
        </p>
      </div>
    );
  }

  // 3. 상품 조회
  const product = await getProductById(id);
  if (!product) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 font-medium mb-2">
          ❌ 상품을 찾을 수 없습니다
        </div>
        <p className="text-sm text-gray-600">
          상품 ID를 확인하고 다시 시도해주세요.
        </p>
      </div>
    );
  }

  // 4. 상품 상세 뷰 렌더링
  return (
    <ProductEmbedView
      product={product}
      partnerId={partner.id}
      partnerName={partner.name}
      apiKey={apiKey}
    />
  );
}

// ISR (Incremental Static Regeneration) 설정
// 5분마다 페이지 재생성
export const revalidate = 300;
