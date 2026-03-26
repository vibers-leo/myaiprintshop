# WowPress 통합 설정 가이드

이 가이드는 WowPress API를 MyAIPrintShop과 통합하기 위한 설정 방법을 안내합니다.

## 📋 사전 준비사항

1. **WowPress API 키 발급**
   - WowPress 계정 생성 및 API 키 발급 필요
   - API 문서: https://wowpress.co.kr/api/document

2. **Firebase 프로젝트 접근 권한**
   - Firebase Console 접근 필요
   - Firestore 데이터베이스 쓰기 권한 필요

---

## 🔧 1단계: 환경 변수 설정

### 로컬 개발 환경 (.env.local)

`.env.local` 파일에 다음 내용을 추가합니다:

```bash
# WowPress API 키 (필수)
WOWPRESS_API_KEY=your_actual_wowpress_api_key_here

# WowPress API Base URL (선택사항, 기본값 사용)
# WOWPRESS_API_BASE=https://api.wowpress.co.kr/api/v1/std
```

### 프로덕션 환경 (Vercel)

Vercel 대시보드에서 환경 변수를 추가합니다:

1. Vercel 프로젝트 > Settings > Environment Variables
2. 다음 변수 추가:
   - `WOWPRESS_API_KEY`: WowPress API 키

---

## 🗄️ 2단계: Firestore 벤더 등록

### Firebase Console에서 수동 등록

1. **Firebase Console 접속**
   - https://console.firebase.google.com
   - 프로젝트 선택

2. **Firestore Database 이동**
   - 좌측 메뉴 > Firestore Database

3. **vendors 컬렉션에 문서 추가**

**컬렉션 ID**: `vendors`
**문서 ID**: `VENDOR_WOWPRESS` (정확히 이 ID 사용)

**필드**:
```
businessName: "WowPress"
vendorType: "marketplace"
commissionRate: 0.20
status: "approved"
contactEmail: "support@wowpress.co.kr"
contactPhone: "02-XXXX-XXXX"
businessNumber: "123-45-67890"
description: "전문 인쇄 서비스 제공 업체"
createdAt: [현재 시간 Timestamp]
updatedAt: [현재 시간 Timestamp]
```

### 스크린샷 예시

```
컬렉션: vendors
└── 문서: VENDOR_WOWPRESS
    ├── businessName (string): "WowPress"
    ├── vendorType (string): "marketplace"
    ├── commissionRate (number): 0.20
    ├── status (string): "approved"
    ├── contactEmail (string): "support@wowpress.co.kr"
    ├── contactPhone (string): "02-XXXX-XXXX"
    ├── businessNumber (string): "123-45-67890"
    ├── description (string): "전문 인쇄 서비스 제공 업체"
    ├── createdAt (timestamp): 2024-01-01 00:00:00
    └── updatedAt (timestamp): 2024-01-01 00:00:00
```

---

## ✅ 3단계: 연결 테스트

### 개발 서버 시작

```bash
npm run dev
```

### API 연결 테스트 (관리자 계정 필요)

**1. 관리자 로그인**
- http://localhost:3300/login
- 관리자 이메일로 로그인 (ADMIN_EMAILS에 등록된 이메일)

**2. WowPress 상품 동기화 테스트**

터미널에서 다음 명령어 실행:

```bash
# 관리자 토큰 발급 (Firebase Auth 토큰)
# Firebase Console > Authentication > Users에서 테스트 사용자의 UID 복사

# 상품 동기화 API 호출
curl -X POST http://localhost:3300/api/wowpress/sync/product/WOW001 \
  -H "Authorization: Bearer YOUR_FIREBASE_AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

**예상 응답**:
```json
{
  "success": true,
  "message": "상품이 성공적으로 동기화되었습니다",
  "data": {
    "prodno": "WOW001",
    "productId": "prod_xxxxxxxxxx",
    "productName": "명함 인쇄",
    "price": 5000
  }
}
```

**3. Firestore 확인**

Firebase Console에서 다음 컬렉션 확인:

- `products`: 동기화된 상품 확인
  - `vendorId` = "VENDOR_WOWPRESS"
  - `metadata.source` = "wowpress"
  - `metadata.wowpressProdno` = "WOW001"

- `wowpress_products`: WowPress 캐시 확인
  - `prodno` = "WOW001"
  - `myProductId` = (products 문서 ID)

---

## 🧪 4단계: 주문 전달 테스트

### 테스트 주문 생성

1. **상품 페이지 접속**
   ```
   http://localhost:3300/products/[동기화된_상품_ID]
   ```

2. **결제 진행**
   - 장바구니 담기
   - 배송지 정보 입력
   - PortOne 테스트 결제 (테스트 카드 사용)

3. **주문 완료 후 로그 확인**

Firebase Console에서 다음 컬렉션 확인:

**컬렉션**: `wowpress_order_logs`

```
└── 문서: [자동 생성 ID]
    ├── myOrderId (string): "order_xxxxxxxxxx"
    ├── wowpressOrderNo (string): "WP2024010100001"
    ├── vendorOrderId (string): "VENDOR_WOWPRESS"
    ├── status (string): "forwarded"
    ├── spec (map): { coverinfo: {...}, ordqty: {...}, ... }
    ├── response (map): { orderno: "...", status: "..." }
    ├── createdAt (timestamp): 2024-01-01 00:00:00
    └── updatedAt (timestamp): 2024-01-01 00:00:00
```

**status 값**:
- `forwarded`: WowPress로 성공적으로 전달됨
- `failed`: 전달 실패 (error 필드에 상세 내용)

---

## 🚨 문제 해결

### 1. "WOWPRESS_API_KEY가 설정되지 않았습니다"

**원인**: 환경 변수가 설정되지 않음

**해결**:
```bash
# .env.local 파일 확인
cat .env.local | grep WOWPRESS

# 없으면 추가
echo "WOWPRESS_API_KEY=your_key_here" >> .env.local

# 개발 서버 재시작
npm run dev
```

### 2. "Invalid API key" (401 Unauthorized)

**원인**: WowPress API 키가 유효하지 않음

**해결**:
- WowPress에서 API 키 재발급
- `.env.local`에 새 키 입력
- 서버 재시작

### 3. "Vendor not found" (상품 동기화 실패)

**원인**: Firestore vendors 컬렉션에 VENDOR_WOWPRESS 문서가 없음

**해결**:
- Firebase Console에서 vendors/VENDOR_WOWPRESS 문서 생성
- 필드를 2단계 가이드대로 정확히 입력

### 4. 주문이 WowPress로 전달되지 않음

**원인**: 주문에 WowPress 상품이 포함되지 않음

**확인 사항**:
```javascript
// orders 컬렉션에서 주문 문서 확인
vendorOrders: [
  {
    vendorId: "VENDOR_WOWPRESS",  // 이 값이 있어야 함
    items: [...],
    ...
  }
]
```

**해결**:
- 상품의 `vendorId`가 "VENDOR_WOWPRESS"인지 확인
- 주문 생성 시 vendorOrders가 올바르게 생성되는지 확인

---

## 📊 모니터링

### Firestore 컬렉션 목록

WowPress 통합 관련 컬렉션:

1. **vendors**: 벤더 정보
2. **products**: 상품 목록 (vendorId로 필터링)
3. **orders**: 주문 목록 (vendorOrders 배열)
4. **wowpress_products**: WowPress 상품 캐시
5. **wowpress_order_logs**: WowPress 주문 전달 로그

### 로그 확인

```bash
# 개발 서버 로그
npm run dev

# WowPress 관련 로그 grep
npm run dev 2>&1 | grep -i wowpress
```

**예상 로그**:
```
🔄 WowPress 상품 동기화 시작: WOW001
✅ WowPress 상품 조회 완료: 명함 인쇄
✅ MyAIPrintShop 상품 생성 완료: prod_xxxxxxxxxx
✅ WowPress 캐시 저장 완료
✅ 동기화 완료

🚀 WowPress 주문 전달 시작: order_xxxxxxxxxx
📦 WowPress 주문 1개 발견
📤 WowPress API로 주문 전송 중...
✅ WowPress 주문 성공: WP2024010100001
💾 로그 저장 완료
✅ WowPress 주문 전달 완료
```

---

## 🎯 체크리스트

설정이 올바르게 완료되었는지 확인하세요:

- [ ] `.env.local`에 WOWPRESS_API_KEY 설정됨
- [ ] Firestore vendors/VENDOR_WOWPRESS 문서 생성됨
- [ ] 개발 서버가 에러 없이 시작됨
- [ ] 상품 동기화 API 호출 성공 (200 OK)
- [ ] products 컬렉션에 WowPress 상품 생성됨
- [ ] wowpress_products 캐시에 매핑 저장됨
- [ ] 테스트 주문 생성 및 결제 완료
- [ ] wowpress_order_logs에 전달 로그 생성됨 (status: "forwarded")
- [ ] 콘솔에서 WowPress 관련 로그 확인됨

모든 항목이 체크되면 WowPress 통합이 성공적으로 완료된 것입니다! 🎉

---

## 📞 지원

문제가 계속되면 다음 정보를 포함하여 문의하세요:

1. 에러 메시지 (전체 스택 트레이스)
2. `.env.local` 파일 (API 키는 제외)
3. Firestore vendors 문서 스크린샷
4. 개발 서버 로그 (WowPress 관련 부분)
