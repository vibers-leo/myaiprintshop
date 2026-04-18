import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/orders';
import { cancelPayment } from '@/lib/toss-payments';
import { requireRole, unauthorizedResponse } from '@/lib/auth-middleware';
import { createNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    // admin만 환불 처리 가능
    const auth = await requireRole(request, ['admin']);
    if (!auth.authorized) return unauthorizedResponse(auth.error);

    const { orderId, cancelReason, cancelAmount } = await request.json();

    if (!orderId || !cancelReason) {
      return NextResponse.json({ error: 'orderId와 cancelReason이 필요합니다.' }, { status: 400 });
    }

    if (cancelAmount !== undefined && (typeof cancelAmount !== 'number' || cancelAmount <= 0)) {
      return NextResponse.json({ error: '취소 금액은 0보다 커야 합니다.' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (order.paymentStatus !== 'PAID') {
      return NextResponse.json({ error: '결제 완료된 주문만 취소할 수 있습니다.' }, { status: 400 });
    }

    if (!order.paymentId) {
      return NextResponse.json({ error: '결제 키가 없습니다.' }, { status: 400 });
    }

    // 토스 결제 취소
    const result = await cancelPayment(order.paymentId, cancelReason, cancelAmount);

    // DB 업데이트
    const newStatus = cancelAmount && cancelAmount < (order.totalAmount + order.shippingFee) ? 'REFUNDED' : 'CANCELLED';
    await updateOrder(orderId, {
      paymentStatus: newStatus,
      orderStatus: 'CANCELLED',
    });

    // 고객 알림
    if (order.userId) {
      createNotification({
        userId: order.userId,
        type: 'order_status',
        title: cancelAmount ? '부분 환불이 처리되었습니다' : '주문이 취소되었습니다',
        message: `주문 ${orderId} | ${cancelReason}`,
        link: `/mypage/orders/${orderId}`,
      }).catch(() => {});
    }

    console.log(`✅ Payment cancelled: ${orderId} (${cancelReason})`);

    return NextResponse.json({
      success: true,
      message: cancelAmount ? '부분 환불이 처리되었습니다.' : '주문이 취소되었습니다.',
      cancelAmount: cancelAmount || (order.totalAmount + order.shippingFee),
    });
  } catch (error: any) {
    console.error('Cancel payment error:', error);
    return NextResponse.json({ error: error.message || '환불 처리 실패' }, { status: 500 });
  }
}
