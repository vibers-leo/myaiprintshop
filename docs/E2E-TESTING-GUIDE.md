# E2E Testing Guide - MyAIPrintShop 멀티벤더 마켓플레이스

## 목차
1. [테스트 환경 준비](#테스트-환경-준비)
2. [시나리오 1: 판매자 온보딩](#시나리오-1-판매자-온보딩)
3. [시나리오 2: 멀티벤더 주문 및 결제](#시나리오-2-멀티벤더-주문-및-결제)
4. [시나리오 3: 정산 처리](#시나리오-3-정산-처리)
5. [성능 테스트](#성능-테스트)
6. [에러 시나리오](#에러-시나리오)

---

## 테스트 환경 준비

### 1. 환경변수 설정

`.env.local` 파일에 다음 설정이 모두 있는지 확인:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin (서버 사이드)
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# PortOne
PORTONE_STORE_ID=...
PORTONE_API_SECRET=...
PORTONE_MASTER_MERCHANT_ID=...

# Google AI (Imagen 3)
GOOGLE_API_KEY=...
```

### 2. Firestore 데이터 초기화

```bash
# 상품 데이터 생성 (이미 완료된 경우 스킵)
npm run seed

# 개발 서버 실행
npm run dev
```

### 3. 테스트 계정 준비

- **Admin 계정**: `admin@myaiprintshop.com` (환경변수 `ADMIN_EMAILS`에 등록된 계정)
- **판매자 계정 1**: `vendor1@test.com` (테스트용 Google 계정)
- **판매자 계정 2**: `vendor2@test.com` (테스트용 Google 계정)
- **고객 계정**: `customer@test.com` (테스트용 Google 계정)

---

## 시나리오 1: 판매자 온보딩

### 목표
판매자가 신청 → Admin 승인 → 상품 등록 → 판매 시작까지의 전체 흐름 검증

### 단계

#### 1.1 판매자 신청

1. **로그인**: `vendor1@test.com`으로 Google 로그인
2. **마이페이지 접속**: `/mypage/vendor/apply`
3. **신청 폼 작성**:
   - 상호명: `테스트 판매자 1`
   - 대표자명: `홍길동`
   - 이메일: `vendor1@test.com`
   - 연락처: `010-1234-5678`
   - 은행명: `우리은행`
   - 계좌번호: `1002-123-456789`
   - 예금주: `홍길동`
4. **신청 완료** → Firestore `vendors` 컬렉션 확인
   - `status: 'pending'` 확인
   - `ownerId` 확인 (Firebase Auth UID)

**검증 포인트**:
- [ ] Firestore에 vendor 문서 생성됨
- [ ] status가 'pending'으로 설정됨
- [ ] 모든 필드가 올바르게 저장됨

---

#### 1.2 Admin 승인

1. **Admin 로그인**: `admin@myaiprintshop.com`
2. **Admin 페이지 접속**: `/admin`
3. **Vendors 탭 클릭**
4. **승인 대기 목록**에서 "테스트 판매자 1" 확인
5. **승인 버튼 클릭** (또는 수수료율 변경 후 승인)
   - 기본 수수료율: 15% → 원하는 경우 10%로 변경
6. **Firestore 확인**:
   - `status: 'approved'` 확인
   - `approvedAt` 타임스탬프 확인
   - `users` 컬렉션에서 해당 ownerId의 `roles`에 `'seller'` 추가됨 확인

**검증 포인트**:
- [ ] Vendor 상태가 'approved'로 변경됨
- [ ] 승인 날짜가 기록됨
- [ ] users.roles에 'seller' 추가됨
- [ ] 판매자에게 이메일 알림 발송 (TODO: 구현 후 테스트)

---

#### 1.3 판매자 상품 등록

1. **판매자 로그인 유지**: `vendor1@test.com`
2. **판매자 대시보드**: `/mypage/vendor/dashboard`
3. **상품 관리 메뉴**: `/mypage/vendor/products`
4. **"상품 등록" 버튼 클릭**: `/mypage/vendor/products/new`
5. **상품 정보 입력**:
   - 상품명: `커스텀 티셔츠 - 판매자1`
   - 가격: `29000`
   - 카테고리: `의류`
   - 썸네일 업로드
   - 옵션 설정 (사이즈, 색상 등)
6. **등록 완료** → Firestore `products` 컬렉션 확인
   - `vendorId`: 판매자 ID 확인
   - `vendorType: 'marketplace'` 확인
   - `isActive: true` 확인

**검증 포인트**:
- [ ] Firestore에 product 문서 생성됨
- [ ] vendorId가 올바르게 설정됨
- [ ] vendorType이 'marketplace'로 설정됨
- [ ] 홈페이지 상품 목록에 표시됨

---

## 시나리오 2: 멀티벤더 주문 및 결제

### 목표
여러 판매자의 상품을 한 번에 주문하고, 자동으로 판매자별 정산이 이루어지는지 검증

### 전제 조건
- 판매자 1 (`vendor1@test.com`) 상품: `커스텀 티셔츠` (29,000원)
- 판매자 2 (`vendor2@test.com`) 상품: `에코백` (15,000원) - 사전에 위 1.1~1.3 과정 반복
- 플랫폼 직판 상품: `머그컵` (12,000원) - vendorType: 'platform'

### 단계

#### 2.1 장바구니에 상품 추가

1. **고객 로그인** (또는 비로그인): `customer@test.com`
2. **홈페이지에서 상품 검색**
3. **장바구니 추가**:
   - 커스텀 티셔츠 (판매자1) x 2개
   - 에코백 (판매자2) x 1개
   - 머그컵 (플랫폼) x 3개
4. **장바구니 페이지**: `/cart`
   - 총 금액 확인: 29,000 x 2 + 15,000 + 12,000 x 3 = **109,000원**
   - 배송비: 3,000원
   - **최종 결제 금액: 112,000원**

---

#### 2.2 주문 생성 (POST /api/payment/request)

1. **결제하기 버튼 클릭**
2. **배송 정보 입력**:
   - 이름: `김고객`
   - 연락처: `010-9999-8888`
   - 주소: `서울시 강남구 테헤란로 123`
   - 이메일: `customer@test.com`
3. **API 호출 확인** (브라우저 Network 탭):
   ```json
   POST /api/payment/request
   {
     "items": [
       { "productId": "p_vendor1_001", "vendorId": "vendor1_id", "quantity": 2, "price": 29000 },
       { "productId": "p_vendor2_001", "vendorId": "vendor2_id", "quantity": 1, "price": 15000 },
       { "productId": "p_platform_001", "vendorId": "PLATFORM_DEFAULT", "quantity": 3, "price": 12000 }
     ],
     "totalAmount": 109000,
     "shippingFee": 3000,
     "shippingInfo": { ... }
   }
   ```

4. **응답 확인**:
   ```json
   {
     "success": true,
     "orderId": "abc123xyz",
     "paymentRequest": {
       "orderId": "abc123xyz",
       "orderName": "커스텀 티셔츠 외 2건",
       "totalAmount": 112000,
       "customer": { ... }
     }
   }
   ```

5. **Firestore `orders` 컬렉션 확인**:
   - 주문 ID: `abc123xyz`
   - `paymentStatus: 'PENDING'`
   - `orderStatus: 'PENDING'`
   - **`vendorOrders` 배열 확인**:
     ```javascript
     vendorOrders: [
       {
         vendorId: 'vendor1_id',
         vendorName: '테스트 판매자 1',
         items: [{ productId: 'p_vendor1_001', quantity: 2, price: 29000 }],
         subtotal: 58000,
         commission: 5800,  // 10% (Admin이 설정한 수수료율)
         vendorAmount: 52200,
         status: 'pending'
       },
       {
         vendorId: 'vendor2_id',
         vendorName: '테스트 판매자 2',
         items: [{ productId: 'p_vendor2_001', quantity: 1, price: 15000 }],
         subtotal: 15000,
         commission: 2250,  // 15% (기본 수수료율)
         vendorAmount: 12750,
         status: 'pending'
       },
       {
         vendorId: 'PLATFORM_DEFAULT',
         vendorName: 'MyAIPrintShop',
         items: [{ productId: 'p_platform_001', quantity: 3, price: 12000 }],
         subtotal: 36000,
         commission: 0,  // 플랫폼 상품은 수수료 없음
         vendorAmount: 36000,
         status: 'pending'
       }
     ]
     ```
   - **`platformFee` 확인**: 5800 + 2250 = **8050원**

**검증 포인트**:
- [ ] vendorOrders가 올바르게 생성됨 (3개)
- [ ] 각 판매자별 subtotal, commission, vendorAmount 계산 정확
- [ ] platformFee 총합이 정확함
- [ ] 주문 상태가 PENDING으로 설정됨

---

#### 2.3 결제 진행 (PortOne)

1. **PortOne 결제 창 표시**
2. **테스트 결제 진행**:
   - 테스트 카드 번호 입력 (PortOne 문서 참조)
   - 또는 개발 모드에서 `paymentId: 'test-payment-123'` 사용
3. **결제 완료 콜백**

---

#### 2.4 결제 검증 (POST /api/payment/verify)

1. **API 호출**:
   ```json
   POST /api/payment/verify
   {
     "paymentId": "test-payment-123",
     "orderId": "abc123xyz"
   }
   ```

2. **서버 로그 확인**:
   ```
   ✅ Order abc123xyz payment verified and saved to DB
   💰 Starting settlement for 3 vendors...
   💸 Transferring 52200원 to vendor1_id (테스트 판매자 1)...
   💸 Transferring 12750원 to vendor2_id (테스트 판매자 2)...
   💸 Transferring 36000원 to PLATFORM_DEFAULT (MyAIPrintShop)...
   ✅ Settlement completed for 3 vendors
   ```

3. **Firestore 확인**:

   **orders 컬렉션**:
   - `paymentStatus: 'PAID'`
   - `orderStatus: 'PAID'`
   - `paymentId: 'test-payment-123'`

   **settlement_logs 컬렉션**:
   - 3개의 문서 생성됨 (판매자별)
   - 각 로그 확인:
     ```javascript
     {
       vendorId: 'vendor1_id',
       orderId: 'abc123xyz',
       orderAmount: 58000,
       commission: 5800,
       vendorAmount: 52200,
       portoneTransferId: 'portone_transfer_xxx',  // PortOne API 응답
       status: 'transferred',
       transferredAt: Timestamp,
       createdAt: Timestamp
     }
     ```

**검증 포인트**:
- [ ] 주문 상태가 PAID로 변경됨
- [ ] settlement_logs에 3개의 로그 생성됨
- [ ] 각 로그의 status가 'transferred'로 설정됨
- [ ] portoneTransferId가 기록됨
- [ ] 판매자에게 이메일 알림 발송 (TODO)

---

## 시나리오 3: 정산 처리

### 목표
Admin 페이지에서 정산 내역을 확인하고, CSV 내보내기 기능 검증

### 단계

#### 3.1 Admin 정산 관리 페이지

1. **Admin 로그인**: `admin@myaiprintshop.com`
2. **Admin 페이지**: `/admin`
3. **Settlements 탭 클릭**

#### 3.2 정산 내역 확인

1. **통계 카드 확인**:
   - 전체: 3건
   - 대기중: 0건
   - 완료: 3건
   - 실패: 0건
   - 총 정산액: 101,950원 (52200 + 12750 + 36000)
   - 총 수수료: 8,050원 (5800 + 2250)

2. **테이블에서 각 정산 내역 확인**:
   - 주문 ID: `abc123xyz`
   - 판매자: 테스트 판매자 1
   - 주문금액: 58,000원
   - 수수료: -5,800원
   - 정산금액: 52,200원
   - 상태: 정산완료
   - 정산일시: 2026-03-02 14:23:45

3. **필터 기능 테스트**:
   - "대기중" 클릭 → 빈 목록
   - "완료" 클릭 → 3건 표시
   - "전체" 클릭 → 3건 표시

4. **검색 기능 테스트**:
   - 주문 ID로 검색: `abc123xyz` 입력 → 3건 표시
   - 판매자 ID로 검색: `vendor1_id` 입력 → 1건 표시

#### 3.3 CSV 내보내기

1. **"CSV 내보내기" 버튼 클릭**
2. **다운로드된 파일 확인**:
   - 파일명: `settlements_2026-03-02.csv`
   - 내용:
     ```csv
     정산ID,판매자ID,판매자명,주문ID,주문금액,수수료,정산금액,상태,정산일시,생성일시
     settlement_001,vendor1_id,테스트 판매자 1,abc123xyz,58000,5800,52200,transferred,2026-03-02T14:23:45Z,2026-03-02T14:23:30Z
     settlement_002,vendor2_id,테스트 판매자 2,abc123xyz,15000,2250,12750,transferred,2026-03-02T14:23:46Z,2026-03-02T14:23:31Z
     settlement_003,PLATFORM_DEFAULT,MyAIPrintShop,abc123xyz,36000,0,36000,transferred,2026-03-02T14:23:47Z,2026-03-02T14:23:32Z
     ```

**검증 포인트**:
- [ ] 통계가 정확히 계산됨
- [ ] 테이블에 모든 정산 내역 표시됨
- [ ] 필터링 정상 작동
- [ ] 검색 정상 작동
- [ ] CSV 파일이 올바르게 다운로드됨

---

## 성능 테스트

### 4.1 대량 주문 처리

1. **시나리오**: 동시에 10개의 주문 생성
2. **측정 지표**:
   - 주문 생성 API 응답 시간 < 500ms
   - 결제 검증 API 응답 시간 < 1000ms
   - 정산 처리 시간 < 2000ms (판매자 10명 기준)

### 4.2 쿼리 성능

1. **상품 목록 조회** (`/api/products`):
   - 캐시 미스 시: < 500ms
   - 캐시 히트 시: < 50ms

2. **주문 목록 조회** (`/api/orders`):
   - 100건 조회: < 300ms
   - 1000건 조회: < 1000ms

3. **정산 로그 조회** (`/api/admin/settlements`):
   - 전체 조회: < 500ms
   - 필터링 조회: < 300ms

**측정 방법**:
- 브라우저 Network 탭에서 응답 시간 확인
- 서버 로그에서 `measureQueryPerformance` 출력 확인

---

## 에러 시나리오

### 5.1 인증 에러

1. **비로그인 상태에서 판매자 페이지 접근**:
   - `/mypage/vendor/dashboard` 접속
   - 예상: 로그인 페이지로 리다이렉트

2. **권한 없는 사용자의 Admin 접근**:
   - `customer@test.com`으로 `/admin` 접속
   - 예상: "접근 권한이 없습니다" 메시지

### 5.2 결제 에러

1. **결제 금액 불일치**:
   - 주문 금액: 100,000원
   - PortOne 결제 금액: 90,000원 (위조)
   - 예상: `POST /api/payment/verify` → 400 에러

2. **이미 결제 완료된 주문 재결제**:
   - 동일한 orderId로 두 번 `/api/payment/verify` 호출
   - 예상: "이미 결제가 완료된 주문입니다" 메시지

### 5.3 정산 에러

1. **PortOne API 실패 시뮬레이션**:
   - PortOne API 서버 다운 가정
   - 예상: 주문은 PAID 상태로 저장, 정산 로그는 'failed' 상태
   - 재시도 로직 확인

2. **판매자 계좌 정보 누락**:
   - 판매자 등록 시 계좌 정보 입력 안 함
   - 예상: 정산 실패, Admin 알림 발송

---

## 체크리스트

### 판매자 온보딩
- [ ] 판매자 신청 폼 정상 작동
- [ ] Firestore에 vendor 문서 생성됨
- [ ] Admin 승인 기능 정상 작동
- [ ] users.roles에 'seller' 추가됨
- [ ] 판매자 대시보드 접근 가능
- [ ] 판매자 상품 등록 정상 작동

### 멀티벤더 주문
- [ ] 여러 판매자 상품 장바구니 추가 가능
- [ ] vendorOrders 자동 생성 정확
- [ ] 판매자별 수수료율 차등 적용
- [ ] platformFee 계산 정확
- [ ] PortOne 결제 연동 정상

### 정산 처리
- [ ] 결제 완료 시 자동 정산 실행
- [ ] settlement_logs 생성 정확
- [ ] Admin 정산 관리 페이지 정상 작동
- [ ] 통계 계산 정확
- [ ] CSV 내보내기 정상 작동

### 성능
- [ ] API 응답 시간 목표 달성
- [ ] 쿼리 캐싱 정상 작동
- [ ] 대량 트래픽 처리 가능

### 에러 처리
- [ ] 인증/권한 에러 적절히 처리
- [ ] 결제 에러 적절히 처리
- [ ] 정산 실패 시 재시도 로직 작동
- [ ] 모든 에러 로그 기록됨

---

## 다음 단계

E2E 테스트 완료 후:
1. **Phase 4: B2B Solution (Widget + Public API)** 진행
2. **Phase 3: WowPress API 연동** (3/2 이후)
3. **Phase 2 추가 고도화 (3D Viewer 등)**

---

## 참고 자료

- [PortOne 개발자 문서](https://portone.io/docs)
- [Firebase Firestore 문서](https://firebase.google.com/docs/firestore)
- [Plan 파일](../C:\Users\desig\.claude\plans\sorted-cooking-porcupine.md)
