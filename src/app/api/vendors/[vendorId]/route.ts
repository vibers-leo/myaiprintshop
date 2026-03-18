import { NextRequest, NextResponse } from 'next/server';
import { getVendor, updateVendor } from '@/lib/vendors';
import { isAdmin, getUser } from '@/lib/users';

/**
 * GET /api/vendors/[vendorId]
 * 판매자 정보 조회
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { vendorId } = await context.params;

    const vendor = await getVendor(vendorId);

    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vendor not found',
        },
        { status: 404 }
      );
    }

    // 승인되지 않은 판매자는 본인 또는 관리자만 조회 가능
    if (vendor.status !== 'approved') {
      // TODO: 인증 미들웨어 추가 후 권한 검증
      // const userId = await getCurrentUserId(request);
      // if (!userId || (userId !== vendor.ownerId && !(await isAdmin(userId)))) {
      //   return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      // }
    }

    return NextResponse.json(
      {
        success: true,
        vendor,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error fetching vendor:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/vendors/[vendorId]
 * 판매자 정보 수정 (본인 또는 Admin만 가능)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { vendorId } = await context.params;
    const body = await request.json();

    // TODO: 인증 미들웨어 추가
    // const userId = await getCurrentUserId(request);
    // if (!userId) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    const vendor = await getVendor(vendorId);

    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vendor not found',
        },
        { status: 404 }
      );
    }

    // TODO: 권한 검증
    // const isOwner = userId === vendor.ownerId;
    // const isAdminUser = await isAdmin(userId);
    // if (!isOwner && !isAdminUser) {
    //   return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    // }

    // 수정 가능한 필드만 허용
    const allowedFields = [
      'businessName',
      'businessNumber',
      'ownerName',
      'email',
      'phone',
      'bankAccount',
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Admin만 수정 가능한 필드
    // if (isAdminUser) {
    //   if (body.commissionRate !== undefined) {
    //     updateData.commissionRate = body.commissionRate;
    //   }
    //   if (body.portone !== undefined) {
    //     updateData.portone = body.portone;
    //   }
    // }

    await updateVendor(vendorId, updateData);

    const updatedVendor = await getVendor(vendorId);

    return NextResponse.json(
      {
        success: true,
        vendor: updatedVendor,
        message: '판매자 정보가 업데이트되었습니다.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error updating vendor:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
