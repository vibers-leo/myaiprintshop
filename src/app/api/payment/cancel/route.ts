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

    const { orderId, cancelReason, cancelAmount, vendorOrderIndex } = await request.json();

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

    // 벤더별 부분취소 처리
    let actualCancelAmount = cancelAmount;
    const updateData: any = {};

    if (vendorOrderIndex !== undefined && order.vendorOrders) {
      const vo = order.vendorOrders[vendorOrderIndex];
      if (!vo) {
        return NextResponse.json({ error: '해당 벤더 주문을 찾을 수 없습니다.' }, { status: 404 });
      }
      if (vo.status === 'cancelled') {
        return NextResponse.json({ error: '이미 취소된 벤더 주문입니다.' }, { status: 400 });
      }

      // 해당 벤더 주문의 금액으로 부분환불
      actualCancelAmount = actualCancelAmount || vo.subtotal;

      // vendorOrders 업데이트
      const updatedVOs = [...order.vendorOrders];
      updatedVOs[vendorOrderIndex] = { ...vo, status: 'cancelled' as const };
      updateData.vendorOrders = updatedVOs;

      // 모든 벤더가 cancelled면 전체 취소
      const allCancelled = updatedVOs.every(v => v.status === 'cancelled');
      if (allCancelled) {
        updateData.orderStatus = 'CANCELLED';
        updateData.paymentStatus = 'CANCELLED';
      } else {
        updateData.paymentStatus = 'REFUNDED'; // 부분환불
      }
    }

    // 토스 결제 취소
    const result = await cancelPayment(order.paymentId, cancelReason, actualCancelAmount);

    // DB 업데이트
    if (!updateData.paymentStatus) {
      const totalOrder = order.totalAmount + order.shippingFee;
      updateData.paymentStatus = actualCancelAmount && actualCancelAmount < totalOrder ? 'REFUNDED' : 'CANCELLED';
      updateData.orderStatus = 'CANCELLED';
    }
    await updateOrder(orderId, updateData);

    // 고객 알림
    if (order.userId) {
      createNotification({
        userId: order.userId,
        type: 'order_status',
        title: cancelAmount ? '부분 환불이 완료됐어요' : '주문이 취소됐어요',
        message: `${cancelReason} — ${cancelAmount ? `₩${actualCancelAmount?.toLocaleString()} 환불 예정이에요` : '결제 금액이 환불될 예정이에요'}`,
        link: `/mypage/orders/${orderId}`,
      }).catch(() => {});
    }

    console.log(`✅ Payment cancelled: ${orderId} (${cancelReason})`);

    return NextResponse.json({
      success: true,
      message: cancelAmount ? '부분 환불이 처리되었습니다.' : '주문이 취소되었습니다.',
      cancelAmount: actualCancelAmount || (order.totalAmount + order.shippingFee),
    });
  } catch (error: any) {
    console.error('Cancel payment error:', error);
    return NextResponse.json({ error: error.message || '환불 처리 실패' }, { status: 500 });
  }
}
