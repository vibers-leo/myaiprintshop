import { NextRequest, NextResponse } from 'next/server';
import { requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth-middleware';
import { ApiError } from '@/lib/api-error-handler';
import { approveVendor, rejectVendor, suspendVendor, getVendor } from '@/lib/vendors';
import { addRole } from '@/lib/users';

/**
 * PATCH /api/admin/vendors/[vendorId]
 * Admin 전용: 판매자 승인/거부/정지
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ vendorId: string }> }
) {
  // Admin 권한 확인
  const { authorized, error } = await requireRole(request, ['admin']);

  if (!authorized) {
    return unauthorizedResponse(error);
  }

  try {
    const { vendorId } = await context.params;
    const body = await request.json();
    const { action, commissionRate } = body;

    // action 검증
    if (!['approve', 'reject', 'suspend'].includes(action)) {
      return ApiError.validation('유효하지 않은 action입니다. (approve, reject, suspend)');
    }

    // 판매자 존재 확인
    const vendor = await getVendor(vendorId);
    if (!vendor) {
      return ApiError.notFound('판매자');
    }

    switch (action) {
      case 'approve':
        // 승인
        const rate = commissionRate ? parseFloat(commissionRate) : vendor.commissionRate;

        if (rate < 0.05 || rate > 0.30) {
          return ApiError.validation('수수료율은 5%~30% 범위여야 합니다.');
        }

        await approveVendor(vendorId, rate);

        // users 컬렉션에 seller 역할 추가
        await addRole(vendor.ownerId, 'seller');
        console.log(`✅ Vendor ${vendorId} approved with commission rate ${rate * 100}%`);
        break;

      case 'reject':
        // 거부
        await rejectVendor(vendorId);
        console.log(`✅ Vendor ${vendorId} rejected`);
        break;

      case 'suspend':
        // 정지
        await suspendVendor(vendorId);
        console.log(`✅ Vendor ${vendorId} suspended`);
        break;

      default:
        return ApiError.validation('잘못된 요청입니다.');
    }

    // 업데이트된 판매자 정보 조회
    const updatedVendor = await getVendor(vendorId);

    return NextResponse.json({
      success: true,
      message: `판매자가 ${action === 'approve' ? '승인' : action === 'reject' ? '거부' : '정지'}되었습니다.`,
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error('❌ Error updating vendor:', error);
    return ApiError.internal('판매자 상태 업데이트 중 오류가 발생했습니다.', error);
  }
}

/**
 * GET /api/admin/vendors/[vendorId]
 * Admin 전용: 판매자 상세 조회
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ vendorId: string }> }
) {
  // Admin 권한 확인
  const { authorized, error } = await requireRole(request, ['admin']);

  if (!authorized) {
    return unauthorizedResponse(error);
  }

  try {
    const { vendorId } = await context.params;

    const vendor = await getVendor(vendorId);

    if (!vendor) {
      return ApiError.notFound('판매자');
    }

    return NextResponse.json({
      success: true,
      vendor,
    });
  } catch (error) {
    console.error('❌ Error fetching vendor:', error);
    return ApiError.internal('판매자 조회 실패', error);
  }
}
