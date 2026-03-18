import { NextRequest, NextResponse } from 'next/server';
import { requireRole, unauthorizedResponse } from '@/lib/auth-middleware';
import { ApiError } from '@/lib/api-error-handler';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { measureQueryPerformance, cachedQuery } from '@/lib/query-optimizer';

/**
 * GET /api/admin/settlements
 * Admin 전용: 정산 로그 조회
 */
export async function GET(request: NextRequest) {
  // Admin 권한 확인
  const { authorized, error } = await requireRole(request, ['admin']);

  if (!authorized) {
    return unauthorizedResponse(error);
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'all' | 'pending' | 'transferred' | 'failed' | null;
    const vendorId = searchParams.get('vendorId');
    const orderId = searchParams.get('orderId');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    // 쿼리 빌드
    let q = query(
      collection(db, 'settlement_logs'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limit)
    );

    // status 필터
    if (status && status !== 'all') {
      q = query(q, where('status', '==', status));
    }

    // vendorId 필터
    if (vendorId) {
      q = query(q, where('vendorId', '==', vendorId));
    }

    // orderId 필터
    if (orderId) {
      q = query(q, where('orderId', '==', orderId));
    }

    // 캐시 키 생성
    const cacheKey = `settlements:${status || 'all'}:${vendorId || 'all'}:${orderId || 'all'}:${limit}`;

    // 캐시된 쿼리 실행 (5분 캐시)
    const settlements = await cachedQuery(
      cacheKey,
      async () => {
        return await measureQueryPerformance('admin-settlements', async () => {
          const snapshot = await getDocs(q);
          return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        });
      },
      5 * 60 * 1000 // 5분
    );

    // 통계 계산
    const stats = {
      total: settlements.length,
      pending: settlements.filter((s: any) => s.status === 'pending').length,
      transferred: settlements.filter((s: any) => s.status === 'transferred').length,
      failed: settlements.filter((s: any) => s.status === 'failed').length,
      totalAmount: settlements.reduce((sum: number, s: any) => sum + (s.vendorAmount || 0), 0),
      totalCommission: settlements.reduce((sum: number, s: any) => sum + (s.commission || 0), 0),
    };

    return NextResponse.json({
      success: true,
      settlements,
      stats,
    });
  } catch (error) {
    console.error('❌ Error fetching settlements:', error);
    return ApiError.internal('정산 내역 조회 실패', error);
  }
}
