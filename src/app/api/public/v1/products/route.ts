import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, checkRateLimit, logApiUsage } from '@/lib/api-auth';
import { ApiError } from '@/lib/api-error-handler';
import { collection, query, where, getDocs, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/lib/products';

/**
 * GET /api/public/v1/products
 *
 * Public API: 상품 목록 조회
 *
 * Query Parameters:
 * - category: string (optional) - 카테고리 필터
 * - vendorType: 'platform' | 'marketplace' (optional) - 판매자 유형 필터
 * - limit: number (optional, default: 20, max: 100) - 결과 개수 제한
 * - isActive: boolean (optional, default: true) - 활성 상품만 조회
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

    // 3. Query Parameters 파싱
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const vendorType = searchParams.get('vendorType') as 'platform' | 'marketplace' | null;
    const limitParam = parseInt(searchParams.get('limit') || '20');
    const isActive = searchParams.get('isActive') !== 'false'; // 기본값: true

    const resultLimit = Math.min(limitParam, 100); // 최대 100개

    // 4. Firestore 쿼리
    const productsRef = collection(db, 'products');
    const constraints: any[] = [];

    if (isActive) {
      constraints.push(where('isActive', '==', true));
    }

    if (category) {
      constraints.push(where('category', '==', category));
    }

    if (vendorType) {
      constraints.push(where('vendorType', '==', vendorType));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(firestoreLimit(resultLimit));

    const q = query(productsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
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
      });
    });

    // 5. 사용량 로깅
    await logApiUsage(partner.id, 'products.list', {
      category,
      vendorType,
      limit: resultLimit,
      resultCount: products.length,
    });

    // 6. 응답
    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        count: products.length,
        limit: resultLimit,
        partner: {
          tier: partner.tier,
          usage: {
            totalRequests: partner.usage.totalRequests + 1,
          },
        },
      },
    });
  } catch (error) {
    console.error('Public API /products error:', error);
    return ApiError.internal('상품 조회 중 오류가 발생했습니다.', error);
  }
}
