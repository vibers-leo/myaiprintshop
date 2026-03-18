import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, checkRateLimit, logApiUsage } from '@/lib/api-auth';
import { ApiError } from '@/lib/api-error-handler';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/lib/products';

/**
 * GET /api/public/v1/products/[id]
 *
 * Public API: 상품 상세 조회
 *
 * Headers:
 * - x-api-key: string (required) - API 키
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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

    // 3. Product 조회
    const productId = id;
    const productRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      return ApiError.notFound('상품');
    }

    const data = productDoc.data();

    const product: Product = {
      id: productDoc.id,
      name: data.name,
      price: data.price,
      originalPrice: data.originalPrice,
      thumbnail: data.thumbnail,
      category: data.category,
      subcategory: data.subcategory,
      badge: data.badge,
      reviewCount: data.reviewCount || 0,
      rating: data.rating || 0,
      stock: data.stock,
      isActive: data.isActive !== false,
      vendorId: data.vendorId,
      vendorName: data.vendorName,
      vendorType: data.vendorType || 'platform',
      images: data.images || [data.thumbnail],
      tags: data.tags || [],
      options: data.options,
      volumePricing: data.volumePricing,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    };

    // 4. 사용량 로깅
    await logApiUsage(partner.id, 'products.get', {
      productId,
    });

    // 5. 응답
    return NextResponse.json({
      success: true,
      data: product,
      meta: {
        partner: {
          tier: partner.tier,
          usage: {
            totalRequests: partner.usage.totalRequests + 1,
          },
        },
      },
    });
  } catch (error) {
    console.error('Public API /products/[id] error:', error);
    return ApiError.internal('상품 조회 중 오류가 발생했습니다.', error);
  }
}
