'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';

export type SettlementStatus = 'pending' | 'transferred' | 'failed';

export interface SettlementLog {
  id: string;
  vendorId: string;
  vendorName: string;
  orderId: string;
  orderAmount: number;
  commission: number;
  commissionRate: number;
  vendorAmount: number;
  portoneTransferId?: string;
  status: SettlementStatus;
  createdAt: Timestamp;
  transferredAt?: Timestamp;
  failedReason?: string;
  retryCount: number;
}

/**
 * 판매자별 정산 내역 조회
 */
export async function getVendorSettlements(
  vendorId: string,
  options?: {
    status?: SettlementStatus;
    limitCount?: number;
    startAfterDoc?: DocumentSnapshot;
  }
): Promise<{ settlements: SettlementLog[]; hasMore: boolean }> {
  try {
    const settlementsRef = collection(db, 'settlement_logs');
    const limitCount = options?.limitCount || 20;

    let q = query(
      settlementsRef,
      where('vendorId', '==', vendorId),
      orderBy('createdAt', 'desc'),
      limit(limitCount + 1) // +1 to check if there are more
    );

    if (options?.status) {
      q = query(
        settlementsRef,
        where('vendorId', '==', vendorId),
        where('status', '==', options.status),
        orderBy('createdAt', 'desc'),
        limit(limitCount + 1)
      );
    }

    if (options?.startAfterDoc) {
      q = query(q, startAfter(options.startAfterDoc));
    }

    const snapshot = await getDocs(q);
    const settlements: SettlementLog[] = [];

    snapshot.docs.slice(0, limitCount).forEach((doc) => {
      settlements.push({ id: doc.id, ...doc.data() } as SettlementLog);
    });

    const hasMore = snapshot.docs.length > limitCount;

    return { settlements, hasMore };
  } catch (error) {
    console.error('❌ Error getting vendor settlements:', error);
    throw error;
  }
}

/**
 * 판매자 정산 통계 조회
 */
export async function getVendorSettlementStats(vendorId: string): Promise<{
  totalAmount: number;
  totalCommission: number;
  totalVendorAmount: number;
  transferredCount: number;
  pendingCount: number;
  failedCount: number;
}> {
  try {
    const settlementsRef = collection(db, 'settlement_logs');
    const q = query(settlementsRef, where('vendorId', '==', vendorId));

    const snapshot = await getDocs(q);

    let totalAmount = 0;
    let totalCommission = 0;
    let totalVendorAmount = 0;
    let transferredCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data() as SettlementLog;
      totalAmount += data.orderAmount || 0;
      totalCommission += data.commission || 0;
      totalVendorAmount += data.vendorAmount || 0;

      switch (data.status) {
        case 'transferred':
          transferredCount++;
          break;
        case 'pending':
          pendingCount++;
          break;
        case 'failed':
          failedCount++;
          break;
      }
    });

    return {
      totalAmount,
      totalCommission,
      totalVendorAmount,
      transferredCount,
      pendingCount,
      failedCount,
    };
  } catch (error) {
    console.error('❌ Error getting settlement stats:', error);
    throw error;
  }
}

/**
 * 기간별 정산 내역 조회
 */
export async function getVendorSettlementsByPeriod(
  vendorId: string,
  startDate: Date,
  endDate: Date
): Promise<SettlementLog[]> {
  try {
    const settlementsRef = collection(db, 'settlement_logs');
    const q = query(
      settlementsRef,
      where('vendorId', '==', vendorId),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const settlements: SettlementLog[] = [];

    snapshot.forEach((doc) => {
      settlements.push({ id: doc.id, ...doc.data() } as SettlementLog);
    });

    return settlements;
  } catch (error) {
    console.error('❌ Error getting settlements by period:', error);
    throw error;
  }
}
