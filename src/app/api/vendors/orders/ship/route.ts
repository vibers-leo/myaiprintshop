import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/orders';
import { createNotification } from '@/lib/notifications';
import { requireRole, unauthorizedResponse } from '@/lib/auth-middleware';
import { getVendorById } from '@/lib/vendors';

/**
 * 벤더 배송 처리 API
 * 벤더가 자신의 주문에 운송장을 입력하고 배송 상태를 변경합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 인증: seller 또는 admin만 접근 가능
    const authResult = await requireRole(request, ['seller', 'admin']);
    if (!authResult.authorized) {
      return unauthorizedResponse(authResult.error);
    }

    const { orderId, vendorId, trackingNumber, carrier } = await request.json();

    if (!orderId || !vendorId) {
      return NextResponse.json({ error: 'orderId와 vendorId가 필요합니다.' }, { status: 400 });
    }

    // 소유권 검증
    if (!authResult.roles?.includes('admin')) {
      const vendor = await getVendorById(vendorId);
      if (!vendor || vendor.ownerId !== authResult.userId) {
        return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
      }
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 해당 벤더의 vendorOrder 찾기
    const voIndex = order.vendorOrders?.findIndex((vo) => vo.vendorId === vendorId);
    if (voIndex === undefined || voIndex === -1 || !order.vendorOrders) {
      return NextResponse.json({ error: '해당 벤더의 주문을 찾을 수 없습니다.' }, { status: 404 });
    }

    // vendorOrder 상태 업데이트
    const updatedVendorOrders = [...order.vendorOrders];
    updatedVendorOrders[voIndex] = {
      ...updatedVendorOrders[voIndex],
      status: trackingNumber ? 'shipped' : 'confirmed',
      shippingInfo: trackingNumber ? {
        trackingNumber,
        carrier: carrier || '택배',
        shippedAt: new Date().toISOString(),
      } : updatedVendorOrders[voIndex].shippingInfo,
    };

    // 모든 벤더가 shipped이면 주문 전체 상태도 SHIPPED
    const allShipped = updatedVendorOrders.every((vo) => vo.status === 'shipped' || vo.status === 'delivered');
    const updateData: any = { vendorOrders: updatedVendorOrders };
    if (allShipped && trackingNumber) {
      updateData.orderStatus = 'SHIPPED';
      updateData.shippingInfo = {
        ...order.shippingInfo,
        trackingNumber,
        carrier: carrier || '택배',
      };
    }

    await updateOrder(orderId, updateData);

    // 고객 알림
    if (order.userId && trackingNumber) {
      const vendorName = updatedVendorOrders[voIndex].vendorName;
      createNotification({
        userId: order.userId,
        type: 'order_status',
        title: '상품이 출발했어요',
        message: `${vendorName}에서 보낸 택배예요 — ${carrier || '택배'} ${trackingNumber}`,
        link: `/mypage/orders/${orderId}`,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: trackingNumber ? '운송장이 등록되었습니다.' : '주문이 확인되었습니다.',
    });
  } catch (error) {
    console.error('Vendor ship error:', error);
    return NextResponse.json({ error: '배송 처리 실패' }, { status: 500 });
  }
}
