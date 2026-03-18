import { NextRequest, NextResponse } from 'next/server';
import { requireRole, canAccessResource } from '@/lib/auth-middleware';
import { ApiError } from '@/lib/api-error-handler';
import { getVendor } from '@/lib/vendors';
import { getVendorSettlements, getVendorSettlementStats, SettlementStatus } from '@/lib/settlements';

/**
 * GET /api/vendors/[vendorId]/settlements
 * 판매자 정산 내역 조회
 * - 판매자 본인 또는 Admin만 접근 가능
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ vendorId: string }> }
) {
  // 로그인 확인
  const { authorized, userId, roles, error } = await requireRole(request, ['seller', 'admin']);

  if (!authorized || !userId || !roles) {
    return NextResponse.json(
      { success: false, error: error || 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { vendorId } = await context.params;

    // 판매자 존재 확인
    const vendor = await getVendor(vendorId);
    if (!vendor) {
      return ApiError.notFound('판매자');
    }

    // 권한 확인: 판매자 본인 또는 Admin
    if (!canAccessResource(userId, vendor.ownerId, roles)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only access your own settlements' },
        { status: 403 }
      );
    }

    // Query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as SettlementStatus | null;
    const limitParam = searchParams.get('limit');
    const limitCount = limitParam ? parseInt(limitParam) : 20;
    const includeStats = searchParams.get('includeStats') === 'true';

    // 정산 내역 조회
    const { settlements, hasMore } = await getVendorSettlements(vendorId, {
      status: status || undefined,
      limitCount,
    });

    const response: any = {
      success: true,
      settlements,
      hasMore,
      count: settlements.length,
    };

    // 통계 포함 옵션
    if (includeStats) {
      const stats = await getVendorSettlementStats(vendorId);
      response.stats = stats;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error fetching vendor settlements:', error);
    return ApiError.internal('정산 내역 조회 실패', error);
  }
}
