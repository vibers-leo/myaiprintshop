import { NextRequest, NextResponse } from 'next/server';
import { createVendor, getAllVendors } from '@/lib/vendors';
import { getUser, addRole } from '@/lib/users';
import { requireRole, unauthorizedResponse } from '@/lib/auth-middleware';
import { ApiError } from '@/lib/api-error-handler';

/**
 * POST /api/vendors
 * 판매자 신청 (로그인한 사용자 전용)
 */
export async function POST(request: NextRequest) {
  // 로그인 확인
  const { authorized, userId, error } = await requireRole(request, ['customer', 'seller', 'admin']);

  if (!authorized || !userId) {
    return unauthorizedResponse(error);
  }

  try {
    const body = await request.json();

    const {
      businessName,
      businessNumber,
      ownerName,
      email,
      phone,
      bankAccount,
    } = body;

    // 필수 필드 검증
    if (!businessName || !ownerName || !email || !phone) {
      return ApiError.validation('필수 항목을 모두 입력해주세요.');
    }

    if (!bankAccount?.bankName || !bankAccount?.accountNumber || !bankAccount?.accountHolder) {
      return ApiError.validation('계좌 정보를 모두 입력해주세요.');
    }

    // 사용자 존재 확인 (개발 모드에서는 스킵)
    if (process.env.NODE_ENV !== 'development') {
      const user = await getUser(userId);
      if (!user) {
        return ApiError.notFound('사용자');
      }
    }

    // 판매자 생성 (인증된 userId 사용)
    const vendor = await createVendor({
      ownerId: userId,
      businessName,
      businessNumber,
      ownerName,
      email,
      phone,
      bankAccount,
      commissionRate: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_COMMISSION_RATE || '0.15'),
    });

    console.log(`✅ Vendor application created: ${vendor.id} by ${userId}`);

    return NextResponse.json(
      {
        success: true,
        vendor,
        message: '판매자 신청이 완료되었습니다. 승인까지 1-2영업일 소요됩니다.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Error creating vendor:', error);

    if (error.message?.includes('already exists')) {
      return ApiError.conflict('이미 판매자 신청이 존재합니다.');
    }

    return ApiError.internal('판매자 신청 처리 중 오류가 발생했습니다.', error);
  }
}

/**
 * GET /api/vendors
 * 판매자 목록 조회
 * - status 파라미터 있음: Admin 전용 (모든 상태 조회 가능)
 * - status 파라미터 없음: 공개 (승인된 판매자만)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'approved' | 'suspended' | 'rejected' | null;
    const ownerId = searchParams.get('ownerId');

    // ownerId로 조회 (본인 판매자 정보 조회)
    if (ownerId) {
      const { authorized, userId, error } = await requireRole(request, ['customer', 'seller', 'admin']);

      if (!authorized || !userId) {
        return unauthorizedResponse(error);
      }

      // 본인 또는 Admin만 조회 가능
      if (userId !== ownerId && !error?.includes('admin')) {
        return unauthorizedResponse('본인의 판매자 정보만 조회할 수 있습니다.');
      }

      const { getVendorByOwnerId } = await import('@/lib/vendors');
      const vendor = await getVendorByOwnerId(ownerId);

      return NextResponse.json({
        success: true,
        vendors: vendor ? [vendor] : [],
        count: vendor ? 1 : 0,
      });
    }

    // status 파라미터가 있으면 Admin 권한 필요
    if (status) {
      const { authorized, error } = await requireRole(request, ['admin']);

      if (!authorized) {
        return unauthorizedResponse(error);
      }

      // Admin은 모든 상태 조회 가능
      const vendors = await getAllVendors(status);

      return NextResponse.json({
        success: true,
        vendors,
        count: vendors.length,
      });
    }

    // status 파라미터가 없으면 approved만 조회 (공개 API)
    const vendors = await getAllVendors('approved');

    return NextResponse.json({
      success: true,
      vendors,
      count: vendors.length,
    });
  } catch (error) {
    console.error('❌ Error fetching vendors:', error);
    return ApiError.internal('판매자 목록 조회 실패', error);
  }
}
