import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/orders';
import { requireRole, unauthorizedResponse } from '@/lib/auth-middleware';
import { getVendorById } from '@/lib/vendors';

export async function GET(request: NextRequest) {
  try {
    // 인증: seller 또는 admin만 접근 가능
    const authResult = await requireRole(request, ['seller', 'admin']);
    if (!authResult.authorized) {
      return unauthorizedResponse(authResult.error);
    }

    const vendorId = request.nextUrl.searchParams.get('vendorId');
    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId가 필요합니다.' }, { status: 400 });
    }

    // 소유권 검증: 해당 벤더의 ownerId가 요청자와 일치하는지 확인
    if (!authResult.roles?.includes('admin')) {
      const vendor = await getVendorById(vendorId);
      if (!vendor || vendor.ownerId !== authResult.userId) {
        return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
      }
    }

    const allOrders = await getOrders({ paymentStatus: 'PAID' });

    // vendorOrders에 해당 vendorId가 포함된 주문만 필터
    const vendorOrders = allOrders
      .filter((order) => order.vendorOrders?.some((vo) => vo.vendorId === vendorId))
      .map((order) => {
        const vo = order.vendorOrders!.find((v) => v.vendorId === vendorId)!;
        return {
          orderId: order.id,
          createdAt: order.createdAt,
          customer: order.shippingInfo?.name || '고객',
          items: vo.items,
          subtotal: vo.subtotal,
          commission: vo.commission,
          vendorAmount: vo.vendorAmount,
          status: vo.status,
          shippingInfo: vo.shippingInfo,
          shippingAddress: order.shippingInfo,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, orders: vendorOrders });
  } catch (error) {
    console.error('Vendor orders API error:', error);
    return NextResponse.json({ error: '주문 조회 실패' }, { status: 500 });
  }
}
