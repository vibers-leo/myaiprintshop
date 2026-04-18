/**
 * 토스 페이먼츠 서버 사이드 유틸리티
 * https://docs.tosspayments.com/reference
 */

import { TOSS_CONFIG } from './payment';

const AUTH_HEADER = `Basic ${Buffer.from(TOSS_CONFIG.secretKey + ':').toString('base64')}`;

interface TossPayment {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  method: string;
  approvedAt?: string;
  receipt?: { url: string };
  card?: { number: string; company: string; installmentPlanMonths: number };
  easyPay?: { provider: string };
  failure?: { code: string; message: string };
}

/**
 * 토스 결제 승인
 * 클라이언트에서 결제 인증 완료 후 서버에서 최종 승인
 */
export async function confirmPayment(paymentKey: string, orderId: string, amount: number): Promise<TossPayment> {
  const res = await fetch(`${TOSS_CONFIG.apiUrl}/payments/confirm`, {
    method: 'POST',
    headers: {
      Authorization: AUTH_HEADER,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `토스 결제 승인 실패 (${data.code})`);
  }

  return data;
}

/**
 * 토스 결제 조회
 */
export async function getPayment(paymentKey: string): Promise<TossPayment> {
  const res = await fetch(`${TOSS_CONFIG.apiUrl}/payments/${encodeURIComponent(paymentKey)}`, {
    headers: { Authorization: AUTH_HEADER },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || '결제 조회 실패');
  return data;
}

/**
 * 토스 결제 취소
 */
export async function cancelPayment(paymentKey: string, cancelReason: string, cancelAmount?: number): Promise<TossPayment> {
  const body: any = { cancelReason };
  if (cancelAmount !== undefined) body.cancelAmount = cancelAmount;

  const res = await fetch(`${TOSS_CONFIG.apiUrl}/payments/${encodeURIComponent(paymentKey)}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: AUTH_HEADER,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || '결제 취소 실패');
  return data;
}

/**
 * 토스 정산 조회 (자동 정산)
 * 토스 페이먼츠는 자동 정산을 지원하며, 정산 내역을 조회할 수 있습니다.
 */
export async function getSettlements(startDate: string, endDate: string, page?: number) {
  const params = new URLSearchParams({ startDate, endDate });
  if (page) params.set('page', String(page));

  const res = await fetch(`${TOSS_CONFIG.apiUrl}/settlements?${params}`, {
    headers: { Authorization: AUTH_HEADER },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || '정산 조회 실패');
  return data;
}

/**
 * 토스 페이먼츠 상태 → 앱 PaymentStatus 매핑
 */
export function mapTossStatus(tossStatus: string): 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED' {
  switch (tossStatus) {
    case 'DONE': return 'PAID';
    case 'WAITING_FOR_DEPOSIT': return 'PENDING';
    case 'IN_PROGRESS': return 'PENDING';
    case 'CANCELED': return 'CANCELLED';
    case 'PARTIAL_CANCELED': return 'REFUNDED';
    case 'ABORTED': return 'FAILED';
    case 'EXPIRED': return 'FAILED';
    default: return 'PENDING';
  }
}
