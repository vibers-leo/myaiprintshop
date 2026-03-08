import { NextRequest, NextResponse } from 'next/server';
import {
  getOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  updateShippingInfo,
  getOrderStats
} from '@/lib/orders';
import { OrderStatus } from '@/lib/payment';
import { requireAdmin } from '@/lib/auth-middleware';

// GET: 주문 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') as OrderStatus | null;
    const stats = searchParams.get('stats');
    
    // 통계 조회
    if (stats === 'true') {
      const orderStats = await getOrderStats();
      return NextResponse.json({
        success: true,
        stats: orderStats,
      });
    }
    
    // 단일 주문 조회
    if (orderId) {
      const order = await getOrderById(orderId);
      if (!order) {
        return NextResponse.json(
          { error: '주문을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        order,
      });
    }
    
    // 사용자별 주문 조회
    if (userId) {
      const orders = await getOrdersByUser(userId);
      return NextResponse.json({
        success: true,
        orders,
      });
    }
    
    // 전체 주문 조회 (관리자용)
    const orders = await getOrders({
      status: status || undefined,
    });
    
    return NextResponse.json({
      success: true,
      orders,
      total: orders.length,
    });
    
  } catch (error) {
    console.error('Error in orders API:', error);
    return NextResponse.json(
      { error: '주문 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PATCH: 주문 상태 업데이트 (관리자 전용)
export async function PATCH(request: NextRequest) {
  try {
    // 관리자 인증 검사
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { orderId, status, trackingNumber, carrier } = body;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 배송 정보 업데이트
    if (trackingNumber) {
      const success = await updateShippingInfo(orderId, trackingNumber, carrier);
      if (!success) {
        return NextResponse.json(
          { error: '배송 정보 업데이트에 실패했습니다.' },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        message: '배송 정보가 업데이트되었습니다.',
      });
    }
    
    // 주문 상태 업데이트
    if (status) {
      const success = await updateOrderStatus(orderId, status);
      if (!success) {
        return NextResponse.json(
          { error: '주문 상태 업데이트에 실패했습니다.' },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        message: '주문 상태가 업데이트되었습니다.',
      });
    }
    
    return NextResponse.json(
      { error: '업데이트할 데이터가 없습니다.' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: '주문 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
