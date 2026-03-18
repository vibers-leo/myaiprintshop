import { NextRequest, NextResponse } from 'next/server';
import { requireRole, canAccessResource } from '@/lib/auth-middleware';
import { ApiError } from '@/lib/api-error-handler';
import { getVendor, getVendorStats } from '@/lib/vendors';
import { getVendorSettlementsByPeriod } from '@/lib/settlements';

/**
 * GET /api/vendors/[vendorId]/stats
 * 판매자 통계 조회
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ vendorId: string }> }
) {
  const { authorized, userId, roles, error } = await requireRole(request, ['seller', 'admin']);

  if (!authorized || !userId || !roles) {
    return NextResponse.json(
      { success: false, error: error || 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { vendorId } = await context.params;
    const vendor = await getVendor(vendorId);
    
    if (!vendor) {
      return ApiError.notFound('판매자');
    }

    if (!canAccessResource(userId, vendor.ownerId, roles)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7d': startDate.setDate(endDate.getDate() - 7); break;
      case '30d': startDate.setDate(endDate.getDate() - 30); break;
      case '90d': startDate.setDate(endDate.getDate() - 90); break;
      case '1y': startDate.setFullYear(endDate.getFullYear() - 1); break;
      default: startDate.setDate(endDate.getDate() - 30);
    }

    const basicStats = await getVendorStats(vendorId);
    const settlements = await getVendorSettlementsByPeriod(vendorId, startDate, endDate);

    const dailySales: Record<string, { date: string; amount: number; orders: number }> = {};

    settlements.forEach((settlement) => {
      const dateKey = new Date(settlement.createdAt.seconds * 1000).toISOString().split('T')[0];
      if (!dailySales[dateKey]) {
        dailySales[dateKey] = { date: dateKey, amount: 0, orders: 0 };
      }
      dailySales[dateKey].amount += settlement.vendorAmount;
      dailySales[dateKey].orders += 1;
    });

    const salesTrend = Object.values(dailySales).sort((a, b) => a.date.localeCompare(b.date));

    const periodStats = {
      totalSales: settlements.reduce((sum, s) => sum + s.vendorAmount, 0),
      totalOrders: settlements.length,
      averageOrderValue: settlements.length > 0 
        ? settlements.reduce((sum, s) => sum + s.vendorAmount, 0) / settlements.length 
        : 0,
      totalCommission: settlements.reduce((sum, s) => sum + s.commission, 0),
    };

    return NextResponse.json({
      success: true,
      period: { start: startDate.toISOString(), end: endDate.toISOString(), label: period },
      basicStats,
      periodStats,
      salesTrend,
      recentSettlements: settlements.slice(0, 10),
    });
  } catch (error) {
    console.error('❌ Error fetching vendor stats:', error);
    return ApiError.internal('통계 조회 실패', error);
  }
}
