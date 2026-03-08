import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { getOrders } from "@/lib/orders";

export async function GET(request: NextRequest) {
  // 관리자 인증 검사
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const orders = await getOrders();
    const now = new Date();

    // 최근 7일 일별 매출 집계
    const dailySales: { date: string; amount: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];

      const dayOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt).toISOString().slice(0, 10);
        return orderDate === dateStr && o.paymentStatus === "PAID";
      });

      dailySales.push({
        date: dayLabel,
        amount: dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0) + (o.shippingFee || 0), 0),
        count: dayOrders.length,
      });
    }

    // 최근 30일 총 매출
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = orders.filter(
      (o) => new Date(o.createdAt) >= thirtyDaysAgo && o.paymentStatus === "PAID"
    );
    const monthlyRevenue = recentOrders.reduce(
      (sum, o) => sum + (o.totalAmount || 0) + (o.shippingFee || 0),
      0
    );

    // 이전 30일 매출 (전월 대비 계산용)
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const prevOrders = orders.filter(
      (o) =>
        new Date(o.createdAt) >= sixtyDaysAgo &&
        new Date(o.createdAt) < thirtyDaysAgo &&
        o.paymentStatus === "PAID"
    );
    const prevRevenue = prevOrders.reduce(
      (sum, o) => sum + (o.totalAmount || 0) + (o.shippingFee || 0),
      0
    );
    const revenueGrowth =
      prevRevenue > 0 ? Math.round(((monthlyRevenue - prevRevenue) / prevRevenue) * 100) : 0;

    // 상태별 카운트
    const statusCounts = {
      total: orders.length,
      pending: orders.filter((o) => o.orderStatus === "PENDING").length,
      paid: orders.filter((o) => o.paymentStatus === "PAID" && o.orderStatus === "PAID").length,
      preparing: orders.filter((o) => o.orderStatus === "PREPARING").length,
      shipped: orders.filter((o) => o.orderStatus === "SHIPPED").length,
      delivered: orders.filter((o) => o.orderStatus === "DELIVERED").length,
      cancelled: orders.filter((o) => o.orderStatus === "CANCELLED").length,
    };

    return NextResponse.json({
      success: true,
      dailySales,
      monthlyRevenue,
      revenueGrowth,
      statusCounts,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "통계 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
