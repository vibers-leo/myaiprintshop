'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { SettlementLog } from './settlements';

export type SettlementSchedule = 'instant' | 'daily' | 'weekly' | 'monthly';

/**
 * 실패한 정산 재시도
 */
export async function retryFailedSettlement(settlementId: string): Promise<boolean> {
  try {
    const settlementRef = doc(db, 'settlement_logs', settlementId);
    const settlementDoc = await getDocs(query(collection(db, 'settlement_logs'), where('__name__', '==', settlementId)));

    if (settlementDoc.empty) {
      throw new Error('Settlement not found');
    }

    const settlement = { id: settlementDoc.docs[0].id, ...settlementDoc.docs[0].data() } as SettlementLog;

    if (settlement.status !== 'failed') {
      throw new Error('Only failed settlements can be retried');
    }

    // 최대 재시도 횟수 확인
    if (settlement.retryCount >= 3) {
      console.log(`⚠️ Settlement ${settlementId} exceeded max retry count (3)`);
      return false;
    }

    // PortOne API 호출 (실제 정산 실행)
    console.log(`🔄 Retrying settlement ${settlementId} (attempt ${settlement.retryCount + 1})`);

    try {
      // TODO: 실제 PortOne API 호출
      // const transferResult = await transferToVendor({
      //   orderId: settlement.orderId,
      //   vendorId: settlement.vendorId,
      //   amount: settlement.vendorAmount,
      // });

      // 성공 시 상태 업데이트
      await updateDoc(settlementRef, {
        status: 'transferred',
        transferredAt: Timestamp.now(),
        retryCount: settlement.retryCount + 1,
        portoneTransferId: `MOCK_TRANSFER_${Date.now()}`, // TODO: 실제 transfer ID
      });

      console.log(`✅ Settlement ${settlementId} transferred successfully`);

      // 정산 완료 이메일 발송
      try {
        const { sendSettlementTransferredEmail } = await import('./email');
        const { getVendor } = await import('./vendors');

        const vendor = await getVendor(settlement.vendorId);
        if (vendor) {
          await sendSettlementTransferredEmail(vendor.email, {
            vendorName: vendor.ownerName,
            amount: settlement.orderAmount,
            commission: settlement.commission,
            vendorAmount: settlement.vendorAmount,
            orderId: settlement.orderId,
            transferDate: new Date().toLocaleDateString('ko-KR'),
          });
        }
      } catch (emailError) {
        console.error('⚠️ Failed to send settlement email:', emailError);
      }

      return true;
    } catch (transferError: any) {
      // 실패 시 재시도 횟수 증가
      await updateDoc(settlementRef, {
        retryCount: settlement.retryCount + 1,
        failedReason: transferError.message,
      });

      console.error(`❌ Settlement ${settlementId} retry failed:`, transferError);
      return false;
    }
  } catch (error) {
    console.error('❌ Error retrying settlement:', error);
    throw error;
  }
}

/**
 * 실패한 정산 일괄 재시도
 */
export async function retryAllFailedSettlements(): Promise<{ success: number; failed: number }> {
  try {
    const settlementsRef = collection(db, 'settlement_logs');
    const q = query(
      settlementsRef,
      where('status', '==', 'failed'),
      where('retryCount', '<', 3)
    );

    const snapshot = await getDocs(q);
    let successCount = 0;
    let failedCount = 0;

    console.log(`🔄 Found ${snapshot.size} failed settlements to retry`);

    for (const doc of snapshot.docs) {
      const success = await retryFailedSettlement(doc.id);
      if (success) {
        successCount++;
      } else {
        failedCount++;
      }

      // API 호출 제한을 피하기 위해 약간의 지연
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Retry completed: ${successCount} succeeded, ${failedCount} failed`);

    return { success: successCount, failed: failedCount };
  } catch (error) {
    console.error('❌ Error retrying failed settlements:', error);
    throw error;
  }
}

/**
 * 대기 중인 정산 처리 (스케줄별)
 */
export async function processPendingSettlements(schedule: SettlementSchedule): Promise<number> {
  try {
    // 각 판매자의 정산 주기에 맞는 대기 중인 정산 처리
    console.log(`🔄 Processing pending settlements for schedule: ${schedule}`);

    const settlementsRef = collection(db, 'settlement_logs');
    const q = query(
      settlementsRef,
      where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);
    let processedCount = 0;

    for (const settlementDoc of snapshot.docs) {
      const settlement = { id: settlementDoc.id, ...settlementDoc.data() } as SettlementLog;

      // 판매자의 정산 주기 확인
      const { getVendor } = await import('./vendors');
      const vendor = await getVendor(settlement.vendorId);

      if (!vendor) continue;

      // TODO: vendor에 settlementSchedule 필드 추가 필요
      // const vendorSchedule = vendor.settlementSchedule || 'instant';
      // if (vendorSchedule !== schedule) continue;

      // 정산 실행
      try {
        await retryFailedSettlement(settlementDoc.id);
        processedCount++;
      } catch (error) {
        console.error(`Failed to process settlement ${settlementDoc.id}:`, error);
      }
    }

    console.log(`✅ Processed ${processedCount} settlements for schedule: ${schedule}`);

    return processedCount;
  } catch (error) {
    console.error('❌ Error processing pending settlements:', error);
    throw error;
  }
}

/**
 * 정산 주기별 크론 작업
 *
 * 사용 예시 (Vercel Cron, AWS EventBridge 등):
 * - Instant: 주문 완료 후 즉시 (이벤트 트리거)
 * - Daily: 매일 00:00 (cron: 0 0 * * *)
 * - Weekly: 매주 월요일 00:00 (cron: 0 0 * * 1)
 * - Monthly: 매월 1일 00:00 (cron: 0 0 1 * *)
 */
export async function runScheduledSettlementJob(schedule: SettlementSchedule): Promise<void> {
  console.log(`⏰ Running scheduled settlement job: ${schedule}`);

  try {
    // 1. 대기 중인 정산 처리
    await processPendingSettlements(schedule);

    // 2. 실패한 정산 재시도
    await retryAllFailedSettlements();

    console.log(`✅ Scheduled settlement job completed: ${schedule}`);
  } catch (error) {
    console.error(`❌ Scheduled settlement job failed: ${schedule}`, error);
    throw error;
  }
}
