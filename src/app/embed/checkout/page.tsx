import { validateSession } from '@/lib/sdk-sessions';
import { getProductById } from '@/lib/products';
import CheckoutEmbedView from '@/components/embed/CheckoutEmbedView';

/**
 * GET /embed/checkout?sessionId=xxx
 *
 * SDK에서 생성한 세션으로 접근하는 결제 페이지
 *
 * 프로세스:
 * 1. sessionId로 세션 검증
 * 2. 세션에서 productId 추출
 * 3. 상품 정보 조회
 * 4. 결제 폼 렌더링
 * 5. PortOne 결제 시작
 */
export default async function EmbedCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const { sessionId } = await searchParams;

  // 1. 세션 ID 검증
  if (!sessionId) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 font-medium mb-2">
          ❌ 세션 ID가 필요합니다
        </div>
        <p className="text-sm text-gray-600">
          결제 세션이 만료되었거나 유효하지 않습니다.
        </p>
      </div>
    );
  }

  // 2. 세션 검증
  const session = await validateSession(sessionId);
  if (!session) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 font-medium mb-2">
          ❌ 세션이 만료되었습니다
        </div>
        <p className="text-sm text-gray-600">
          결제 세션은 15분 동안만 유효합니다.<br />
          다시 시도해주세요.
        </p>
      </div>
    );
  }

  // 3. 상품 조회
  const product = await getProductById(session.productId);
  if (!product) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 font-medium mb-2">
          ❌ 상품을 찾을 수 없습니다
        </div>
        <p className="text-sm text-gray-600">
          요청한 상품이 존재하지 않거나 삭제되었습니다.
        </p>
      </div>
    );
  }

  // 4. 결제 뷰 렌더링
  return (
    <CheckoutEmbedView
      session={session}
      product={product}
      sessionId={sessionId}
    />
  );
}

// 동적 렌더링 (세션은 항상 최신 정보 필요)
export const dynamic = 'force-dynamic';
