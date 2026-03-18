import { NextRequest, NextResponse } from 'next/server';
import { getAllVendors } from '@/lib/vendors';
import { isAdmin } from '@/lib/users';

/**
 * GET /api/admin/vendors
 * 관리자용 판매자 목록 조회 (모든 상태)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: 인증 미들웨어 추가
    // const userId = await getCurrentUserId(request);
    // if (!userId || !(await isAdmin(userId))) {
    //   return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'approved' | 'suspended' | 'rejected' | null;

    const vendors = await getAllVendors(status || undefined);

    // 상태별 통계
    const stats = {
      total: vendors.length,
      pending: vendors.filter((v) => v.status === 'pending').length,
      approved: vendors.filter((v) => v.status === 'approved').length,
      suspended: vendors.filter((v) => v.status === 'suspended').length,
      rejected: vendors.filter((v) => v.status === 'rejected').length,
    };

    return NextResponse.json(
      {
        success: true,
        vendors,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error fetching vendors (admin):', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
