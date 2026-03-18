import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, checkRateLimit, logApiUsage } from '@/lib/api-auth';
import { ApiError } from '@/lib/api-error-handler';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * GET /api/public/v1/categories
 *
 * Public API: 카테고리 목록 조회
 *
 * Headers:
 * - x-api-key: string (required) - API 키
 */
export async function GET(request: NextRequest) {
  try {
    // 1. API 키 인증
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return ApiError.unauthorized('API 키가 필요합니다. x-api-key 헤더에 API 키를 포함해주세요.');
    }

    const partner = await validateApiKey(apiKey);
    if (!partner) {
      return ApiError.unauthorized('유효하지 않은 API 키입니다.');
    }

    if (partner.status !== 'active') {
      return ApiError.forbidden('API 키가 비활성화되었습니다. 관리자에게 문의하세요.');
    }

    // 2. Rate Limiting
    const hourLimitOk = await checkRateLimit(partner.id, `${partner.rateLimit.requestsPerHour}/hour`);
    const dayLimitOk = await checkRateLimit(partner.id, `${partner.rateLimit.requestsPerDay}/day`);

    if (!hourLimitOk || !dayLimitOk) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          rateLimit: {
            tier: partner.tier,
            requestsPerHour: partner.rateLimit.requestsPerHour,
            requestsPerDay: partner.rateLimit.requestsPerDay,
          },
        },
        { status: 429 }
      );
    }

    // 3. 상품에서 카테고리 추출 (간단한 구현)
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);

    const categorySet = new Set<string>();
    const categoryMap = new Map<string, { count: number; subcategories: Set<string> }>();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isActive !== false && data.category) {
        categorySet.add(data.category);

        if (!categoryMap.has(data.category)) {
          categoryMap.set(data.category, { count: 0, subcategories: new Set() });
        }

        const categoryData = categoryMap.get(data.category)!;
        categoryData.count++;

        if (data.subcategory) {
          categoryData.subcategories.add(data.subcategory);
        }
      }
    });

    // 카테고리 목록 생성
    const categories = Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      subcategories: Array.from(data.subcategories),
    }));

    // 4. 사용량 로깅
    await logApiUsage(partner.id, 'categories.list', {
      categoryCount: categories.length,
    });

    // 5. 응답
    return NextResponse.json({
      success: true,
      data: categories,
      meta: {
        count: categories.length,
        partner: {
          tier: partner.tier,
          usage: {
            totalRequests: partner.usage.totalRequests + 1,
          },
        },
      },
    });
  } catch (error) {
    console.error('Public API /categories error:', error);
    return ApiError.internal('카테고리 조회 중 오류가 발생했습니다.', error);
  }
}
