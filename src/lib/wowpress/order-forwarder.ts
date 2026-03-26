/**
 * WowPress 주문 포워더
 *
 * GOODZZ에서 생성된 주문을 WowPress로 자동 전달합니다.
 *
 * 프로세스:
 * 1. 결제 완료 후 호출 (payment/verify 웹훅에서)
 * 2. 주문에서 WowPress 상품 필터링
 * 3. WowPress 스펙으로 변환
 * 4. WowPress API로 주문 전송
 * 5. 결과 로깅 (성공/실패)
 */

import { getWowPressClient } from './api-client';
import { mapOrderToWowPressSpec, validateWowPressSpec, formatSpecPreview } from './spec-mapper';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

/**
 * WowPress 벤더 ID (Firestore vendors 컬렉션에 등록된 ID)
 */
export const WOWPRESS_VENDOR_ID = 'VENDOR_WOWPRESS';

/**
 * 주문을 WowPress로 전달
 *
 * @param order - GOODZZ 주문 객체
 * @returns 전달 성공 여부
 */
export async function forwardOrderToWowPress(order: any): Promise<void> {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🚀 WowPress 주문 전달 시작: ${order.id}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // 1. WowPress 상품이 포함된 vendorOrder 찾기
  const wowpressOrders = order.vendorOrders?.filter(
    (vo: any) => vo.vendorId === WOWPRESS_VENDOR_ID
  );

  if (!wowpressOrders || wowpressOrders.length === 0) {
    console.log('ℹ️  WowPress 상품이 없습니다. 건너뜁니다.');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    return;
  }

  console.log(`📦 WowPress 주문 ${wowpressOrders.length}개 발견`);

  const client = getWowPressClient();

  // 2. 각 vendorOrder 처리
  for (const vendorOrder of wowpressOrders) {
    try {
      const orderItem = vendorOrder.items[0]; // 첫 번째 아이템 (보통 1개)

      console.log(`\n📝 주문 아이템: ${orderItem.name}`);

      // 3. WowPress 스펙으로 변환
      const spec = mapOrderToWowPressSpec(order, {
        id: orderItem.productId,
        price: orderItem.price,
        printMethod: 'dtg', // 기본값 (상품 정보에서 가져와야 함)
      });

      // 4. 스펙 검증
      const validation = validateWowPressSpec(spec);
      if (!validation.valid) {
        throw new Error(`스펙 검증 실패: ${validation.errors.join(', ')}`);
      }

      // 5. 스펙 프리뷰 로깅
      console.log('\n' + formatSpecPreview(spec));

      // 6. WowPress로 주문 전송
      console.log('\n📤 WowPress API로 주문 전송 중...');

      const result = await client.submitOrder(spec);

      console.log(`✅ WowPress 주문 성공: ${result.orderno}`);

      // 7. 성공 로그 저장
      await addDoc(collection(db, 'wowpress_order_logs'), {
        myOrderId: order.id,
        wowpressOrderNo: result.orderno,
        vendorOrderId: vendorOrder.id,
        status: 'forwarded',
        spec: spec,
        response: result,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // 8. TODO: vendorOrder에 externalOrderId 업데이트
      // await updateDoc(doc(db, 'orders', order.id), {
      //   [`vendorOrders.${index}.externalOrderId`]: result.orderno,
      //   [`vendorOrders.${index}.externalStatus`]: 'pending',
      // });

      console.log(`💾 로그 저장 완료`);

    } catch (error) {
      console.error(`\n❌ 주문 전달 실패:`, error);

      // 실패 로그 저장
      await addDoc(collection(db, 'wowpress_order_logs'), {
        myOrderId: order.id,
        vendorOrderId: vendorOrder.id,
        status: 'failed',
        error: (error as Error).message,
        stack: (error as Error).stack,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // TODO: 실패 알림 전송 (관리자 이메일, Slack 등)
      // await sendAdminAlert({
      //   type: 'wowpress_order_failed',
      //   orderId: order.id,
      //   error: (error as Error).message,
      // });

      // TODO: 재시도 스케줄링
      // await scheduleRetry(order.id, {
      //   maxRetries: 3,
      //   retryDelay: 60000, // 1분 후
      // });

      // 에러를 던지지 않음 - WowPress 전달 실패가 주문 완료를 방해하지 않도록
      console.log('⚠️  WowPress 전달 실패 (비차단)');
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ WowPress 주문 전달 완료`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

/**
 * WowPress 주문 상태 동기화
 *
 * WowPress에서 주문 상태를 조회하여 GOODZZ 주문 업데이트
 *
 * @param myOrderId - GOODZZ 주문 ID
 */
export async function syncWowPressOrderStatus(myOrderId: string): Promise<void> {
  console.log(`🔄 WowPress 주문 상태 동기화: ${myOrderId}`);

  try {
    // 1. wowpress_order_logs에서 주문 로그 조회
    // 2. WowPress API로 상태 조회
    // 3. GOODZZ 주문 상태 업데이트
    // 4. 송장 번호가 있으면 업데이트

    // TODO: 구현
    console.log('⚠️  아직 구현되지 않았습니다');
  } catch (error) {
    console.error('주문 상태 동기화 실패:', error);
  }
}

/**
 * 배치 주문 전달 (크론 작업용)
 *
 * 실패한 주문들을 재시도
 */
export async function retryFailedOrders(): Promise<void> {
  console.log('🔄 실패한 WowPress 주문 재시도 중...');

  try {
    // 1. wowpress_order_logs에서 status='failed'인 주문 조회
    // 2. 재시도 횟수 확인
    // 3. forwardOrderToWowPress() 재호출
    // 4. 성공/실패 로그 업데이트

    // TODO: 구현
    console.log('⚠️  아직 구현되지 않았습니다');
  } catch (error) {
    console.error('재시도 실패:', error);
  }
}
