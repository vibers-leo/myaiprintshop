'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { VendorOrder, Vendor } from '@/types/vendor';

/**
 * PortOne 배분정산 API 클라이언트
 *
 * PortOne V2 API 문서: https://developers.portone.io/api/rest-v2
 */

const PORTONE_API_BASE_URL = 'https://api.portone.io';
const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET;

interface PortOneTransferRequest {
  merchantId: string;
  amount: number;
  currency: 'KRW';
  reason: string;
  orderId?: string;
}

interface PortOneTransferResponse {
  transferId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  completedAt?: string;
  failureReason?: string;
}

/**
 * PortOne API 호출 헬퍼
 */
async function callPortOneAPI<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' = 'POST',
  body?: any
): Promise<T> {
  const url = `${PORTONE_API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `PortOne ${PORTONE_API_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `PortOne API Error: ${response.status} - ${errorData.message || 'Unknown error'}`
    );
  }

  return await response.json();
}

/**
 * 판매자에게 정산 금액 전송
 */
export async function transferToVendor(
  vendorOrder: VendorOrder,
  vendor: Vendor,
  orderId: string
): Promise<string> {
  try {
    // PortOne 배분정산 기능이 활성화되어 있는지 확인
    const settlementEnabled = process.env.PORTONE_SETTLEMENT_ENABLED === 'true';

    if (!settlementEnabled) {
      console.log('⚠️ PortOne settlement is disabled (PORTONE_SETTLEMENT_ENABLED=false)');
      // 개발 모드에서는 settlement_log만 기록하고 실제 전송은 하지 않음
      return await recordSettlementLog(vendorOrder, vendor, orderId, 'pending', undefined);
    }

    // PortOne 서브계정 확인
    if (!vendor.portone.merchantId) {
      throw new Error(`Vendor ${vendor.id} does not have a PortOne merchant ID`);
    }

    if (!vendor.portone.accountVerified) {
      throw new Error(`Vendor ${vendor.id} account is not verified`);
    }

    // PortOne Transfer API 호출
    const transferRequest: PortOneTransferRequest = {
      merchantId: vendor.portone.merchantId,
      amount: vendorOrder.vendorAmount,
      currency: 'KRW',
      reason: `주문 ${orderId} 정산 (${vendor.businessName})`,
      orderId: orderId,
    };

    console.log(`📤 Initiating PortOne transfer for vendor ${vendor.id}:`, transferRequest);

    const transferResponse = await callPortOneAPI<PortOneTransferResponse>(
      '/v2/transfers',
      'POST',
      transferRequest
    );

    console.log(`✅ PortOne transfer initiated: ${transferResponse.transferId}`);

    // settlement_logs에 기록
    const settlementLogId = await recordSettlementLog(
      vendorOrder,
      vendor,
      orderId,
      transferResponse.status === 'completed' ? 'transferred' : 'pending',
      transferResponse.transferId
    );

    return settlementLogId;
  } catch (error) {
    console.error('❌ Error transferring to vendor:', error);

    // 실패 로그 기록
    await recordSettlementLog(vendorOrder, vendor, orderId, 'failed', undefined);

    throw error;
  }
}

/**
 * settlement_logs 컬렉션에 기록
 */
async function recordSettlementLog(
  vendorOrder: VendorOrder,
  vendor: Vendor,
  orderId: string,
  status: 'pending' | 'transferred' | 'failed',
  portoneTransferId?: string
): Promise<string> {
  try {
    const settlementLog = {
      vendorId: vendor.id,
      orderId: orderId,

      // 금액 정보
      orderAmount: vendorOrder.subtotal,
      commission: vendorOrder.commission,
      vendorAmount: vendorOrder.vendorAmount,

      // PortOne 정보
      portoneTransferId: portoneTransferId,
      status: status,

      transferredAt: status === 'transferred' ? Timestamp.now() : null,

      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'settlement_logs'), settlementLog);

    console.log(`📝 Settlement log created: ${docRef.id} (status: ${status})`);

    return docRef.id;
  } catch (error) {
    console.error('❌ Error recording settlement log:', error);
    throw error;
  }
}

/**
 * PortOne Transfer 상태 조회 및 업데이트
 */
export async function checkTransferStatus(
  settlementLogId: string,
  portoneTransferId: string
): Promise<void> {
  try {
    // PortOne API로 상태 조회
    const transferStatus = await callPortOneAPI<PortOneTransferResponse>(
      `/v2/transfers/${portoneTransferId}`,
      'GET'
    );

    // settlement_log 업데이트
    const logRef = doc(db, 'settlement_logs', settlementLogId);

    const updateData: any = {
      status: transferStatus.status === 'completed' ? 'transferred' : transferStatus.status === 'failed' ? 'failed' : 'pending',
    };

    if (transferStatus.status === 'completed' && transferStatus.completedAt) {
      updateData.transferredAt = Timestamp.fromDate(new Date(transferStatus.completedAt));
    }

    await updateDoc(logRef, updateData);

    console.log(`✅ Settlement log ${settlementLogId} updated: ${transferStatus.status}`);
  } catch (error) {
    console.error('❌ Error checking transfer status:', error);
    throw error;
  }
}

/**
 * 여러 판매자에게 일괄 정산
 */
export async function batchTransferToVendors(
  vendorOrders: VendorOrder[],
  vendorsMap: Map<string, Vendor>,
  orderId: string
): Promise<Map<string, string>> {
  const settlementLogIds = new Map<string, string>();

  for (const vendorOrder of vendorOrders) {
    const vendor = vendorsMap.get(vendorOrder.vendorId);

    if (!vendor) {
      console.warn(`⚠️ Vendor ${vendorOrder.vendorId} not found, skipping settlement`);
      continue;
    }

    // 플랫폼 판매자(수수료 0%)는 정산하지 않음
    if (vendor.id === 'PLATFORM_DEFAULT' || vendor.commissionRate === 0) {
      console.log(`ℹ️ Skipping settlement for platform vendor ${vendor.id}`);
      continue;
    }

    try {
      const logId = await transferToVendor(vendorOrder, vendor, orderId);
      settlementLogIds.set(vendorOrder.vendorId, logId);
    } catch (error) {
      console.error(`❌ Failed to transfer to vendor ${vendorOrder.vendorId}:`, error);
      // 다른 판매자 정산은 계속 진행
    }
  }

  return settlementLogIds;
}

/**
 * 정산 금액 계산
 */
export function calculateSettlement(
  subtotal: number,
  commissionRate: number
): {
  commission: number;
  vendorAmount: number;
} {
  const commission = Math.floor(subtotal * commissionRate);
  const vendorAmount = subtotal - commission;

  return {
    commission,
    vendorAmount,
  };
}

/**
 * VendorOrders 생성 (주문 상품을 판매자별로 그룹화)
 */
export function createVendorOrders(
  items: Array<{
    productId: string;
    name: string;
    thumbnail: string;
    price: number;
    quantity: number;
    options?: any;
    vendorId: string;
  }>,
  vendorsMap: Map<string, Vendor>
): VendorOrder[] {
  // 판매자별로 상품 그룹화
  const vendorGrouped = new Map<string, typeof items>();

  items.forEach((item) => {
    const vendorId = item.vendorId || 'PLATFORM_DEFAULT';

    if (!vendorGrouped.has(vendorId)) {
      vendorGrouped.set(vendorId, []);
    }

    vendorGrouped.get(vendorId)!.push(item);
  });

  // VendorOrder 배열 생성
  const vendorOrders: VendorOrder[] = [];

  vendorGrouped.forEach((vendorItems, vendorId) => {
    const vendor = vendorsMap.get(vendorId);

    if (!vendor) {
      console.warn(`⚠️ Vendor ${vendorId} not found, using default commission`);
    }

    const subtotal = vendorItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const commissionRate = vendor?.commissionRate || 0.15;
    const { commission, vendorAmount } = calculateSettlement(subtotal, commissionRate);

    vendorOrders.push({
      vendorId: vendorId,
      vendorName: vendor?.businessName || 'Unknown Vendor',
      items: vendorItems.map((item) => ({
        productId: item.productId,
        productName: item.name,
        name: item.name,
        thumbnail: item.thumbnail,
        price: item.price,
        quantity: item.quantity,
        options: item.options,
        vendorId: item.vendorId,
      })),
      subtotal,
      commission,
      vendorAmount,
      status: 'pending',
    });
  });

  return vendorOrders;
}
