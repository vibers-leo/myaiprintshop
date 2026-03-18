import { Timestamp } from 'firebase/firestore';

/**
 * 사용자 역할
 */
export type UserRole = 'customer' | 'seller' | 'admin';

/**
 * 사용자 정보
 */
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  roles: UserRole[];
  vendorId?: string; // seller 역할인 경우 vendors 컬렉션 참조
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}

/**
 * 판매자 상태
 */
export type VendorStatus = 'pending' | 'approved' | 'suspended' | 'rejected';

/**
 * 판매자 정보
 */
export interface Vendor {
  id: string;
  ownerId: string; // users.uid

  // 판매자 정보
  businessName: string;
  businessNumber?: string; // 사업자등록번호 (선택)
  ownerName: string;
  email: string;
  phone: string;

  // PortOne 배분정산 정보
  portone: {
    merchantId?: string; // PortOne 서브계정 ID
    accountVerified: boolean; // 계좌 인증 완료 여부
  };

  // 정산 정보
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };

  // 수수료 (개별 설정)
  commissionRate: number; // 0.15 = 15% (기본값)

  // 상태
  status: VendorStatus;

  // 통계 (캐시)
  stats?: {
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
  approvedAt?: Timestamp;
}

/**
 * 판매자 타입 (플랫폼 직판 vs 외부 판매자)
 */
export type VendorType = 'platform' | 'marketplace';

/**
 * 정산 로그 상태
 */
export type SettlementStatus = 'pending' | 'transferred' | 'failed';

/**
 * 정산 로그
 */
export interface SettlementLog {
  id: string;
  vendorId: string;
  orderId: string; // 주문 ID

  // 금액 정보
  orderAmount: number; // 주문 금액
  commission: number; // 수수료
  vendorAmount: number; // 판매자 수령액

  // PortOne 배분정산 정보
  portoneTransferId?: string; // PortOne 정산 ID
  status: SettlementStatus;

  transferredAt?: Timestamp; // PortOne 정산 완료 시각

  createdAt: Timestamp;
}

/**
 * 판매자별 주문 (Order의 vendorOrders 배열 항목)
 */
export interface VendorOrder {
  vendorId: string;
  vendorName: string;

  items: OrderItem[]; // 해당 판매자 상품
  subtotal: number;
  commission: number; // 플랫폼 수수료
  vendorAmount: number; // 판매자 실수령액

  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingInfo?: {
    trackingNumber?: string;
    carrier?: string;
    shippedAt?: string; // ISO string (payment.ts와 호환)
  };
}

/**
 * 주문 상품 항목
 */
export interface OrderItem {
  productId: string;
  productName: string; // 상품명 (payment.ts와 호환)
  name: string;
  thumbnail: string;
  price: number;
  quantity: number;
  options?: {
    size?: string;
    color?: string;
    [key: string]: any;
  };
  vendorId?: string; // Phase 5 추가
}

/**
 * 판매자 신청 폼 데이터
 */
export interface VendorApplicationForm {
  businessName: string;
  businessNumber?: string;
  ownerName: string;
  email: string;
  phone: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

/**
 * 판매자 통계 집계 (대시보드용)
 */
export interface VendorDashboardStats {
  // 이번 달
  thisMonth: {
    sales: number;
    orders: number;
    revenue: number; // 수수료 제외
  };

  // 전체
  total: {
    sales: number;
    orders: number;
    products: number;
  };

  // 최근 주문
  recentOrders: VendorOrder[];

  // 정산 현황
  settlement: {
    pending: number; // 정산 대기
    transferred: number; // 정산 완료
  };
}
