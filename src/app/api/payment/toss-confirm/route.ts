import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/orders';
import { confirmPayment, mapTossStatus } from '@/lib/toss-payments';
import { batchTransferToVendors } from '@/lib/portone-settlement';
import { getAllVendors } from '@/lib/vendors';
import { forwardOrderToWowPress } from '@/lib/wowpress/order-forwarder';
import { sendOrderConfirmEmail, sendOrderReceivedEmail } from '@/lib/email';
import { createNotification } from '@/lib/notifications';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { earnPoints, POINT_CONFIG } from '@/lib/points';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentKey, orderId, amount } = body;

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: 'paymentKey, orderId, amount가 필요합니다.' }, { status: 400 });
    }

    // Firestore 트랜잭션으로 멱등성 보호
    const db = await getAdminFirestore();
    const orderRef = db.collection('orders').doc(orderId);

    // 주문 확인 + 이미 결제됐는지 체크
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ success: true, message: '이미 결제 완료된 주문입니다.', order });
    }

    // CAS: PENDING → PROCESSING (원자적 상태 전환)
    const snap = await orderRef.get();
    if (snap.exists && snap.data()?.paymentStatus === 'PROCESSING') {
      return NextResponse.json({ error: '해당 주문이 처리 중입니다.' }, { status: 409 });
    }
    await orderRef.update({ paymentStatus: 'PROCESSING' });

    try {

      // 금액 검증 (쿠폰 할인 반영)
      const couponDiscount = (order as any).couponDiscount || 0;
      const expectedAmount = order.totalAmount + order.shippingFee - couponDiscount;
      if (amount !== expectedAmount) {
        console.error(`❌ Amount mismatch: expected=${expectedAmount} (total=${order.totalAmount} + ship=${order.shippingFee} - coupon=${couponDiscount}), got=${amount}`);
        return NextResponse.json({ error: '결제 금액이 일치하지 않습니다.' }, { status: 400 });
      }

      // 토스 결제 승인
      const payment = await confirmPayment(paymentKey, orderId, amount);
      const appStatus = mapTossStatus(payment.status);

      if (appStatus !== 'PAID') {
        await updateOrder(orderId, { paymentStatus: appStatus, orderStatus: 'CANCELLED' });
        return NextResponse.json({
          error: payment.failure?.message || '결제가 완료되지 않았습니다.',
          status: appStatus,
        }, { status: 400 });
      }

      // DB 업데이트
      await updateOrder(orderId, {
        paymentId: paymentKey,
        paymentStatus: 'PAID',
        orderStatus: 'PAID',
      });

      const updatedOrder = await getOrderById(orderId);
      console.log(`✅ Toss payment confirmed: ${orderId} (${paymentKey})`);

      // 쿠폰 사용 처리 (usedCount 증가)
      if ((updatedOrder as any)?.couponCode) {
        try {
          const db = await getAdminFirestore();
          const couponSnap = await db.collection('coupons').where('code', '==', (updatedOrder as any).couponCode).get();
          if (!couponSnap.empty) {
            const couponDoc = couponSnap.docs[0];
            const admin = await import('firebase-admin');
            await couponDoc.ref.update({ usedCount: admin.firestore.FieldValue.increment(1) });
            console.log(`🎫 Coupon ${(updatedOrder as any).couponCode} usedCount incremented`);
          }
        } catch (err) {
          console.error('❌ Coupon usage tracking failed:', err);
        }
      }

      // === 후처리 (비차단) ===

      // 구매자 이메일
      if (updatedOrder?.shippingInfo?.email) {
        sendOrderConfirmEmail(updatedOrder.shippingInfo.email, {
          customerName: updatedOrder.shippingInfo.name,
          orderId,
          items: updatedOrder.items.map((item: any) => ({
            name: item.productName || item.name,
            quantity: item.quantity,
            price: item.price * item.quantity,
          })),
          totalAmount: updatedOrder.totalAmount,
          shippingFee: updatedOrder.shippingFee,
        }).catch(() => {});
      }

      // in-app 알림
      if (updatedOrder?.userId) {
        const itemName = updatedOrder.items[0]?.productName || '상품';
        const itemCount = updatedOrder.items.length;
        createNotification({
          userId: updatedOrder.userId,
          type: 'order_status',
          title: '결제가 완료됐어요',
          message: `${itemCount > 1 ? `${itemName} 외 ${itemCount - 1}건` : itemName} — 제작이 시작되면 다시 알려드릴게요`,
          link: `/mypage/orders/${orderId}`,
        }).catch(() => {});
      }

      // 벤더 정산 + 이메일
      if (updatedOrder?.vendorOrders && updatedOrder.vendorOrders.length > 0) {
        try {
          const vendors = await getAllVendors('approved');
          const vendorsMap = new Map(vendors.map(v => [v.id, v]));

          await batchTransferToVendors(updatedOrder.vendorOrders, vendorsMap, orderId);

          for (const vo of updatedOrder.vendorOrders) {
            const vendor = vendorsMap.get(vo.vendorId);
            if (vendor?.email) {
              sendOrderReceivedEmail(vendor.email, {
                vendorName: vo.vendorName,
                orderId,
                orderAmount: vo.subtotal,
                items: vo.items.map((item: any) => ({
                  name: item.productName || item.name,
                  quantity: item.quantity,
                  price: item.price * item.quantity,
                })),
                orderUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://goodzz.co.kr'}/mypage/vendor/orders`,
              }).catch(() => {});
            }
            // 벤더 in-app 알림
            if (vendor?.ownerId) {
              createNotification({
                userId: vendor.ownerId,
                type: 'order_status',
                title: '새 주문이 들어왔어요',
                message: `${vo.items.map((i: any) => i.productName || i.name).join(', ')} | ₩${vo.subtotal.toLocaleString()} — 주문 관리에서 확인해주세요`,
                link: '/mypage/vendor/orders',
              }).catch(() => {});
            }
          }
        } catch (error) {
          console.error('❌ Settlement error (order still completed):', error);
        }
      }

      // 포인트 적립 (구매 금액의 1%)
      if (updatedOrder?.userId) {
        const pointAmount = Math.floor(updatedOrder.totalAmount * POINT_CONFIG.earnRate);
        if (pointAmount > 0) {
          earnPoints(updatedOrder.userId, pointAmount, '주문 적립', 'order', orderId).catch(() => {});
        }
      }

      // WowPress
      if (updatedOrder) {
        forwardOrderToWowPress(updatedOrder).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        message: '결제가 완료되었습니다.',
        order: updatedOrder,
        payment: {
          paymentKey: payment.paymentKey,
          method: payment.method,
          approvedAt: payment.approvedAt,
          receipt: payment.receipt,
        },
      });

    } catch (innerError) {
      // 결제 실패 시 PROCESSING → PENDING 복구
      await orderRef.update({ paymentStatus: 'PENDING' }).catch(() => {});
      throw innerError;
    }
  } catch (error: any) {
    console.error('Toss payment confirm error:', error);
    return NextResponse.json(
      { error: error.message || '결제 승인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
