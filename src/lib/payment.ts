// 포트원 결제 설정
// 실제 사용 시 환경 변수에서 가져오세요

export const PORTONE_CONFIG = {
  // 포트원 V2 Store ID (테스트용)
  storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID || 'store-test-id',
  
  // 채널 키 (결제 수단별로 다름)
  channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || 'channel-key-test',
  
  // API Secret (서버사이드에서만 사용)
  apiSecret: process.env.PORTONE_API_SECRET || '',
};

// 결제 상태 타입
export type PaymentStatus = 
  | 'PENDING'      // 결제 대기
  | 'PAID'         // 결제 완료
  | 'FAILED'       // 결제 실패
  | 'CANCELLED'    // 결제 취소
  | 'REFUNDED';    // 환불 완료

// 주문 상태 타입
export type OrderStatus = 
  | 'PENDING'      // 주문 대기
  | 'PAID'         // 결제 완료
  | 'PREPARING'    // 제작 중
  | 'SHIPPED'      // 배송 중
  | 'DELIVERED'    // 배송 완료
  | 'CANCELLED';   // 주문 취소

// 주문 아이템 타입
export interface OrderItem {
  productId: string;
  productName: string;
  name: string; // 상품명 (vendor.ts와 호환)
  thumbnail: string; // 썸네일 (vendor.ts와 호환)
  quantity: number;
  price: number;
  options?: {
    size?: string;
    color?: string;
    customDesign?: string; // AI 생성 디자인 URL
    customOptions?: { groupLabel: string; valueLabel: string }[]; // 자동 견적 옵션 내역
  };
  vendorId?: string; // Phase 5: 판매자 ID
}

// 판매자별 주문 (Phase 5: Multi-vendor)
export interface VendorOrder {
  vendorId: string;
  vendorName: string;
  items: OrderItem[];
  subtotal: number;
  commission: number;
  vendorAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingInfo?: {
    trackingNumber?: string;
    carrier?: string;
    shippedAt?: string;
  };
}

// 주문 타입
export interface Order {
  id: string;
  userId?: string;
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  platformFee?: number; // Phase 5: 플랫폼 수수료 총액

  // Phase 5: 멀티벤더 주문
  vendorOrders?: VendorOrder[];

  // 배송 정보
  shippingInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
    addressDetail: string;
    postalCode: string;
    memo?: string;
    trackingNumber?: string;
    carrier?: string;
  };

  // 결제 정보
  paymentId?: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;

  createdAt: string;
  updatedAt: string;
}

// 결제 요청 데이터
export interface PaymentRequestData {
  orderId: string;
  orderName: string;
  totalAmount: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}

// 결제 응답 데이터
export interface PaymentResponse {
  paymentId: string;
  orderId: string;
  status: PaymentStatus;
  amount: number;
  paidAt?: string;
  failReason?: string;
}
