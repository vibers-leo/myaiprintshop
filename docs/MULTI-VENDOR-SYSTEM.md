# Multi-Vendor Marketplace System Documentation

## 개요

MyAIPrintShop의 멀티벤더 마켓플레이스 시스템은 여러 판매자가 입점하여 상품을 등록하고 판매할 수 있는 B2B2C 플랫폼입니다. PortOne의 배분정산 기능을 활용하여 자동으로 판매자에게 수익을 분배합니다.

### 주요 특징

- **차등 수수료율**: 판매자별로 5~30% 범위에서 개별 설정 가능
- **자동 정산**: PortOne API를 통한 실시간 배분정산
- **수동 승인**: 품질 관리를 위한 판매자 수동 승인 프로세스
- **멀티벤더 주문**: 여러 판매자 상품을 한 번에 주문 가능
- **통합 결제**: 고객은 한 번의 결제로 모든 상품 구매

---

## 시스템 아키텍처

### 데이터베이스 구조

```
Firestore
├── users                    # 사용자 정보
│   ├── {uid}
│   │   ├── email
│   │   ├── displayName
│   │   ├── roles: ['customer', 'seller', 'admin']
│   │   └── vendorId (seller인 경우)
│
├── vendors                  # 판매자 정보
│   ├── {vendorId}
│   │   ├── ownerId
│   │   ├── businessName
│   │   ├── ownerName
│   │   ├── email
│   │   ├── phone
│   │   ├── bankAccount
│   │   │   ├── bankName
│   │   │   ├── accountNumber
│   │   │   └── accountHolder
│   │   ├── portone
│   │   │   ├── merchantId
│   │   │   └── accountVerified
│   │   ├── commissionRate (0.05 ~ 0.30)
│   │   ├── status: 'pending' | 'approved' | 'suspended' | 'rejected'
│   │   └── stats
│
├── products                 # 상품 정보
│   ├── {productId}
│   │   ├── vendorId
│   │   ├── vendorName (캐시)
│   │   ├── vendorType: 'platform' | 'marketplace'
│   │   ├── name
│   │   ├── price
│   │   ├── category
│   │   └── ... (기타 상품 정보)
│
├── orders                   # 주문 정보
│   ├── {orderId}
│   │   ├── items[]
│   │   ├── totalAmount
│   │   ├── shippingFee
│   │   ├── platformFee (수수료 총액)
│   │   ├── vendorOrders[]
│   │   │   ├── vendorId
│   │   │   ├── vendorName
│   │   │   ├── items[]
│   │   │   ├── subtotal
│   │   │   ├── commission
│   │   │   ├── vendorAmount
│   │   │   └── status
│   │   ├── paymentStatus
│   │   └── orderStatus
│
└── settlement_logs          # 정산 로그
    ├── {logId}
    │   ├── vendorId
    │   ├── orderId
    │   ├── orderAmount
    │   ├── commission
    │   ├── vendorAmount
    │   ├── portoneTransferId
    │   ├── status: 'pending' | 'transferred' | 'failed'
    │   └── transferredAt
```

---

## 주요 플로우

### 1. 판매자 온보딩 플로우

```
┌─────────────┐
│ 판매자 신청 │
│ /mypage/    │
│ vendor/apply│
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Firestore 저장   │
│ status: pending  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Admin 검토       │
│ /admin (Vendors) │
└──────┬───────────┘
       │
       ├─ 승인 ──────────┐
       │                 ▼
       │          ┌─────────────────┐
       │          │ status: approved│
       │          │ roles += seller │
       │          └─────────────────┘
       │
       └─ 거부 ──────────┐
                         ▼
                  ┌─────────────────┐
                  │ status: rejected│
                  └─────────────────┘
```

### 2. 주문 및 정산 플로우

```
┌──────────────┐
│ 고객이 상품  │
│ 장바구니 추가│ (여러 판매자 상품 가능)
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ POST /api/payment/   │
│ request              │
│                      │
│ 1. vendorOrders 생성 │
│ 2. commission 계산   │
│ 3. Firestore 저장    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ PortOne 결제 창      │
│ 표시                 │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ POST /api/payment/   │
│ verify               │
│                      │
│ 1. 결제 검증         │
│ 2. 주문 상태 업데이트│
│ 3. 배분정산 실행     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ PortOne API 호출 (판매자별)      │
│ POST /v2/transfers               │
│                                  │
│ {                                │
│   merchantId: vendor.portone.id, │
│   amount: vendorAmount,          │
│   currency: 'KRW'                │
│ }                                │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────┐
│ settlement_logs 기록 │
│ status: transferred  │
└──────────────────────┘
```

### 3. VendorOrders 생성 로직

```typescript
// POST /api/payment/request

// 1. 상품을 판매자별로 그룹화
const vendorGrouped = new Map<string, OrderItem[]>();
items.forEach(item => {
  const vendorId = item.vendorId || 'PLATFORM_DEFAULT';
  if (!vendorGrouped.has(vendorId)) {
    vendorGrouped.set(vendorId, []);
  }
  vendorGrouped.get(vendorId)!.push(item);
});

// 2. 각 판매자별로 VendorOrder 생성
const vendorOrders: VendorOrder[] = [];
vendorGrouped.forEach((vendorItems, vendorId) => {
  const vendor = vendorsMap.get(vendorId);

  // 소계 계산
  const subtotal = vendorItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 수수료 계산
  const commissionRate = vendor?.commissionRate || 0.15; // 기본 15%
  const commission = Math.round(subtotal * commissionRate);
  const vendorAmount = subtotal - commission;

  vendorOrders.push({
    vendorId,
    vendorName: vendor?.businessName || 'MyAIPrintShop',
    items: vendorItems,
    subtotal,
    commission,
    vendorAmount,
    status: 'pending'
  });
});

// 3. 플랫폼 수수료 총액 계산
const platformFee = vendorOrders.reduce(
  (sum, vo) => sum + vo.commission,
  0
);
```

---

## API 엔드포인트

### 판매자 관련

#### `POST /api/vendors`
판매자 신청

**Request Body:**
```json
{
  "ownerId": "firebase_auth_uid",
  "businessName": "테스트 판매자",
  "ownerName": "홍길동",
  "email": "vendor@example.com",
  "phone": "010-1234-5678",
  "bankAccount": {
    "bankName": "우리은행",
    "accountNumber": "1002-123-456789",
    "accountHolder": "홍길동"
  },
  "businessNumber": "123-45-67890" // 선택
}
```

**Response:**
```json
{
  "success": true,
  "vendor": {
    "id": "vendor_xxx",
    "status": "pending",
    ...
  }
}
```

---

#### `GET /api/vendors/{vendorId}`
판매자 정보 조회

**Response:**
```json
{
  "success": true,
  "vendor": {
    "id": "vendor_xxx",
    "businessName": "테스트 판매자",
    "status": "approved",
    "commissionRate": 0.15,
    ...
  }
}
```

---

#### `PATCH /api/admin/vendors/{vendorId}`
Admin 전용: 판매자 승인/거부/정지

**Request Body:**
```json
{
  "action": "approve" | "reject" | "suspend",
  "commissionRate": 0.10 // 선택 (승인 시)
}
```

**Response:**
```json
{
  "success": true,
  "vendor": {
    "id": "vendor_xxx",
    "status": "approved",
    ...
  }
}
```

---

### 주문 관련

#### `POST /api/payment/request`
주문 생성 및 결제 요청

**Request Body:**
```json
{
  "items": [
    {
      "productId": "p1",
      "vendorId": "vendor1",
      "productName": "커스텀 티셔츠",
      "price": 29000,
      "quantity": 2
    },
    {
      "productId": "p2",
      "vendorId": "vendor2",
      "productName": "에코백",
      "price": 15000,
      "quantity": 1
    }
  ],
  "totalAmount": 73000,
  "shippingFee": 3000,
  "shippingInfo": {
    "name": "김고객",
    "phone": "010-9999-8888",
    "address": "서울시 강남구 테헤란로 123",
    "email": "customer@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_xxx",
  "paymentRequest": {
    "orderId": "order_xxx",
    "orderName": "커스텀 티셔츠 외 1건",
    "totalAmount": 76000,
    "customer": {
      "name": "김고객",
      "email": "customer@example.com",
      "phone": "010-9999-8888"
    }
  }
}
```

**Firestore 저장 데이터:**
```json
{
  "id": "order_xxx",
  "items": [...],
  "totalAmount": 73000,
  "shippingFee": 3000,
  "platformFee": 11050, // (29000*2*0.1) + (15000*0.15)
  "vendorOrders": [
    {
      "vendorId": "vendor1",
      "vendorName": "테스트 판매자 1",
      "items": [{ "productId": "p1", "quantity": 2, "price": 29000 }],
      "subtotal": 58000,
      "commission": 5800,  // 10%
      "vendorAmount": 52200,
      "status": "pending"
    },
    {
      "vendorId": "vendor2",
      "vendorName": "테스트 판매자 2",
      "items": [{ "productId": "p2", "quantity": 1, "price": 15000 }],
      "subtotal": 15000,
      "commission": 2250,  // 15%
      "vendorAmount": 12750,
      "status": "pending"
    }
  ],
  "paymentStatus": "PENDING",
  "orderStatus": "PENDING"
}
```

---

#### `POST /api/payment/verify`
결제 검증 및 정산 실행

**Request Body:**
```json
{
  "paymentId": "portone_payment_xxx",
  "orderId": "order_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "message": "결제가 완료되었습니다.",
  "order": {
    "id": "order_xxx",
    "paymentStatus": "PAID",
    "orderStatus": "PAID",
    ...
  },
  "payment": {
    "paymentId": "portone_payment_xxx",
    "status": "PAID",
    "amount": 76000
  }
}
```

**자동 실행되는 작업:**
1. PortOne API로 결제 검증
2. 주문 상태 업데이트 (PAID)
3. 각 VendorOrder에 대해 PortOne 배분정산 API 호출
4. settlement_logs 기록

---

### 정산 관련

#### `GET /api/admin/settlements`
Admin 전용: 정산 로그 조회

**Query Parameters:**
- `status`: 'all' | 'pending' | 'transferred' | 'failed'
- `vendorId`: 특정 판매자 필터링
- `orderId`: 특정 주문 필터링

**Response:**
```json
{
  "success": true,
  "settlements": [
    {
      "id": "settlement_xxx",
      "vendorId": "vendor1",
      "vendorName": "테스트 판매자 1",
      "orderId": "order_xxx",
      "orderAmount": 58000,
      "commission": 5800,
      "vendorAmount": 52200,
      "portoneTransferId": "transfer_xxx",
      "status": "transferred",
      "transferredAt": "2026-03-02T14:23:45Z",
      "createdAt": "2026-03-02T14:23:30Z"
    },
    ...
  ],
  "stats": {
    "total": 10,
    "pending": 2,
    "transferred": 7,
    "failed": 1,
    "totalAmount": 500000,
    "totalCommission": 75000
  }
}
```

---

## 핵심 라이브러리 파일

### `src/lib/portone-settlement.ts`
PortOne 배분정산 통합

**주요 함수:**

```typescript
// VendorOrder 배열 생성
export function createVendorOrders(
  items: OrderItem[],
  vendorsMap: Map<string, Vendor>
): VendorOrder[]

// 단일 판매자 정산
export async function transferToVendor(
  vendorOrder: VendorOrder,
  vendor: Vendor,
  orderId: string
): Promise<string>

// 배치 정산
export async function batchTransferToVendors(
  vendorOrders: VendorOrder[],
  vendorsMap: Map<string, Vendor>,
  orderId: string
): Promise<Map<string, string>>

// 정산 금액 계산
export function calculateSettlement(
  amount: number,
  commissionRate: number
): { commission: number; vendorAmount: number }
```

---

### `src/lib/vendors.ts`
판매자 관리

**주요 함수:**

```typescript
// 판매자 생성
export async function createVendor(
  vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string | null>

// 판매자 조회
export async function getVendorById(vendorId: string): Promise<Vendor | null>
export async function getAllVendors(status?: VendorStatus): Promise<Vendor[]>

// 판매자 승인/거부
export async function approveVendor(
  vendorId: string,
  commissionRate?: number
): Promise<boolean>
export async function rejectVendor(vendorId: string): Promise<boolean>

// 상태 업데이트
export async function updateVendorStatus(
  vendorId: string,
  status: VendorStatus
): Promise<boolean>
```

---

### `src/lib/users.ts`
사용자 역할 관리

**주요 함수:**

```typescript
// 역할 조회
export async function getUserRole(uid: string): Promise<UserRole[]>

// 역할 추가/제거
export async function addRole(uid: string, role: UserRole): Promise<boolean>
export async function removeRole(uid: string, role: UserRole): Promise<boolean>

// 권한 체크
export async function isAdmin(uid: string): Promise<boolean>
export async function isSeller(uid: string): Promise<boolean>
```

---

## 환경 변수

### 필수 환경 변수

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# PortOne V2
PORTONE_STORE_ID=
PORTONE_API_SECRET=
PORTONE_MASTER_MERCHANT_ID=

# 수수료율 (선택)
NEXT_PUBLIC_DEFAULT_COMMISSION_RATE=0.15  # 기본 15%
```

---

## 보안 및 권한

### Role-Based Access Control (RBAC)

- **customer**: 일반 고객 (기본 역할)
  - 상품 조회, 주문 생성
- **seller**: 판매자
  - 자신의 상품 관리
  - 자신의 주문 조회
  - 자신의 정산 내역 조회
- **admin**: 관리자
  - 모든 데이터 접근
  - 판매자 승인/거부
  - 수수료율 설정

### API 권한 검증

```typescript
import { requireRole } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  // Admin 또는 Seller만 접근 가능
  const { authorized, userId, roles } = await requireRole(request, ['admin', 'seller']);

  if (!authorized) {
    return unauthorizedResponse();
  }

  // Seller는 자신의 데이터만 조회
  if (!roles.includes('admin')) {
    const vendor = await getVendorByOwnerId(userId!);
    // vendor 필터링 로직...
  }

  // 데이터 조회...
}
```

---

## 성능 최적화

### 1. 쿼리 캐싱

```typescript
import { cachedQuery, cache } from '@/lib/query-optimizer';

// 5분간 캐시
const vendors = await cachedQuery(
  'vendors:approved',
  () => getAllVendors('approved'),
  5 * 60 * 1000
);

// 캐시 무효화
cache.invalidate('vendors:approved');
```

### 2. Firestore 인덱스

필수 복합 인덱스:

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "fields": [
        { "fieldPath": "vendorId", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### 3. 배치 처리

```typescript
// 여러 판매자 정산을 병렬로 처리
const settlementResults = await batchTransferToVendors(
  vendorOrders,
  vendorsMap,
  orderId
);
```

---

## 에러 처리

### 표준 에러 응답

```typescript
import { ApiError } from '@/lib/api-error-handler';

// 인증 에러
return ApiError.unauthorized();

// 권한 에러
return ApiError.forbidden('판매자만 접근 가능합니다.');

// 리소스 없음
return ApiError.notFound('판매자');

// 유효성 검증 실패
return ApiError.validation('올바른 이메일 형식이 아닙니다.');

// 서버 에러
return ApiError.internal('정산 처리 중 오류가 발생했습니다.');
```

---

## 테스트

상세한 E2E 테스트 가이드는 [E2E-TESTING-GUIDE.md](./E2E-TESTING-GUIDE.md)를 참조하세요.

---

## FAQ

### Q1. 판매자 수수료율은 어떻게 설정하나요?

A: Admin 페이지 (`/admin` → Vendors 탭)에서 각 판매자별로 개별 설정 가능합니다. 기본값은 15%이며, 5%~30% 범위에서 조정할 수 있습니다.

### Q2. 정산은 언제 실행되나요?

A: 고객이 결제를 완료하면 즉시 PortOne API를 통해 자동으로 정산이 실행됩니다.

### Q3. 정산 실패 시 어떻게 되나요?

A: 정산 실패 시 `settlement_logs`에 `status: 'failed'`로 기록되며, Admin 페이지에서 확인할 수 있습니다. 수동으로 재시도하거나 판매자에게 연락해야 합니다.

### Q4. 플랫폼 직판 상품도 수수료가 부과되나요?

A: 아니요. `vendorType: 'platform'`인 상품은 수수료가 0원입니다.

### Q5. 판매자는 자신의 정산 내역을 볼 수 있나요?

A: 네. 판매자 대시보드 (`/mypage/vendor/settlements`)에서 자신의 정산 내역을 확인할 수 있습니다. (TODO: 구현 예정)

---

## 로드맵

### 완료
- ✅ 판매자 신청 및 승인
- ✅ 판매자 대시보드
- ✅ 멀티벤더 주문 처리
- ✅ PortOne 배분정산 연동
- ✅ Admin 정산 관리 UI

### 완료 (Phase 5 Week 8)
- ✅ API 권한 검증 강화
  - Firebase Admin SDK 통합 (개발 모드 fallback)
  - 역할 기반 접근 제어 (RBAC)
  - Next.js 15 동적 params 대응
- ✅ 성능 최적화
  - Firestore 쿼리 최적화 (복합 인덱스 회피)
  - 배치 쿼리 및 캐싱 구현
- ✅ E2E 테스트
  - 전체 판매자 관리 플로우 검증
  - Admin API 테스트 완료

### 예정
- 📝 판매자별 정산 내역 페이지 (판매자 대시보드)
- 📝 이메일 알림 시스템 (주문/정산 알림)
- 📝 판매자 통계 차트 (매출, 주문 추이)
- 📝 정산 자동 재시도 로직
- 📝 판매자 정산 주기 설정 (즉시 / 주간 / 월간)

---

## 지원

문제가 발생하거나 질문이 있으면 다음 채널로 문의하세요:

- **GitHub Issues**: https://github.com/myaiprintshop/issues
- **Email**: admin@myaiprintshop.com
- **Slack**: #dev-support (내부 채널)
