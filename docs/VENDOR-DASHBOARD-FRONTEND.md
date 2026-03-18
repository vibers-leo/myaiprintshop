# 판매자 대시보드 프론트엔드 구현 완료

## 🎨 UI/UX 개요

판매자가 매출, 정산, 통계를 한눈에 볼 수 있는 반응형 대시보드를 구현했습니다.

---

## ✅ 구현된 기능

### 1. 대시보드 메인 페이지
**경로**: `/mypage/vendor`

#### 주요 섹션

##### 📊 통계 카드 (Stats Cards)
4개의 주요 지표를 카드 형식으로 표시:
- **총 매출**: 선택한 기간의 총 매출액
- **주문 수**: 총 주문 건수
- **평균 주문액**: 주문당 평균 금액
- **수수료**: 플랫폼 수수료 총액 및 수수료율

##### 📈 매출 차트
- **기간 선택**: 7일 / 30일 / 90일
- **일별 막대 그래프**: 각 날짜의 매출과 주문 수 표시
- **호버 효과**: 마우스 오버 시 상세 정보 표시
- **반응형**: 모바일에서도 최적화된 차트 표시

##### 📋 정산 내역 테이블
최근 10개의 정산 내역을 테이블로 표시:
- 주문번호
- 주문금액
- 수수료
- 정산금액
- 상태 (완료/대기/실패)
- 일시

#### 상태별 색상 코딩
- **완료** (transferred): 초록색 배지
- **대기** (pending): 노란색 배지
- **실패** (failed): 빨간색 배지

---

## 🔧 기술 스택

### Frontend
- **Next.js 15** - App Router
- **React 18** - Hooks (useState, useEffect)
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링

### 상태 관리
- **useAuth Hook** - 인증 상태 관리
- **Local State** - 대시보드 데이터 상태

### API 통신
- **Fetch API** - RESTful API 호출
- **Firebase Auth** - 토큰 기반 인증

---

## 📱 반응형 디자인

### 브레이크포인트
- **Mobile**: < 768px (1열 레이아웃)
- **Tablet**: 768px ~ 1024px (2열 레이아웃)
- **Desktop**: > 1024px (4열 레이아웃)

### 반응형 요소
- 통계 카드: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- 헤더 버튼: `flex-col sm:flex-row`
- 테이블: 가로 스크롤 지원

---

## 🔐 권한 및 보안

### 접근 제어
1. **로그인 확인**: 미로그인 시 로그인 페이지로 리다이렉트
2. **판매자 확인**: 판매자 정보가 없으면 신청 페이지 안내
3. **토큰 인증**: 모든 API 요청에 Firebase ID 토큰 포함

### API 권한
- `/api/vendors?ownerId={uid}`: 본인 또는 Admin만 조회
- `/api/vendors/{id}/stats`: 판매자 본인 또는 Admin만
- `/api/vendors/{id}/settlements`: 판매자 본인 또는 Admin만

---

## 🚀 사용 방법

### 1. 판매자로 로그인
```
로그인 → 마이페이지 → 판매자 대시보드
```

### 2. 대시보드 접속
```
URL: /mypage/vendor
```

### 3. 기간 선택
우측 상단 버튼으로 7일/30일/90일 선택

### 4. 데이터 확인
- 통계 카드에서 주요 지표 확인
- 차트에서 일별 매출 추이 확인
- 테이블에서 정산 내역 확인

---

## 📄 코드 구조

### 컴포넌트 계층
```
VendorDashboardPage
├── Header
│   ├── Business Name
│   └── Period Selector (7d/30d/90d)
├── Stats Cards Grid
│   ├── Total Sales Card
│   ├── Orders Card
│   ├── Average Order Card
│   └── Commission Card
├── Sales Chart
│   └── Daily Bar Chart
└── Settlements Table
    ├── Table Header
    └── Table Rows
```

### 데이터 흐름
```
User Login
    ↓
Get Firebase Token
    ↓
Fetch Vendor Data (by ownerId)
    ↓
Fetch Stats (by vendorId, period)
    ↓
Fetch Settlements (by vendorId)
    ↓
Render Dashboard
```

---

## 🎨 UI 컴포넌트 상세

### 통계 카드
```tsx
<div className="bg-white rounded-lg shadow p-6">
  <p className="text-sm text-gray-500 mb-1">총 매출</p>
  <p className="text-2xl font-bold text-gray-900">
    ₩{totalSales.toLocaleString()}
  </p>
  <p className="text-xs text-gray-400 mt-1">최근 30일</p>
</div>
```

### 매출 차트 막대
```tsx
<div
  className="w-full bg-primary rounded-t hover:bg-primary/80
             transition-colors cursor-pointer relative group"
  style={{ height: `${height}%` }}
>
  <div className="absolute bottom-full mb-2 hidden group-hover:block
                  bg-gray-900 text-white text-xs rounded py-1 px-2">
    ₩{amount.toLocaleString()}<br />{orders}건
  </div>
</div>
```

### 상태 배지
```tsx
<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
  status === 'transferred'
    ? 'bg-green-100 text-green-800'
    : status === 'pending'
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-red-100 text-red-800'
}`}>
  {statusText}
</span>
```

---

## 🔄 API 연동

### 1. 판매자 정보 조회
```typescript
GET /api/vendors?ownerId=${userId}
Headers: Authorization: Bearer ${token}

Response:
{
  "success": true,
  "vendors": [{
    "id": "vendor123",
    "businessName": "테스트샵",
    "commissionRate": 0.15,
    ...
  }],
  "count": 1
}
```

### 2. 통계 조회
```typescript
GET /api/vendors/${vendorId}/stats?period=30d
Headers: Authorization: Bearer ${token}

Response:
{
  "success": true,
  "period": { "start": "...", "end": "...", "label": "30d" },
  "basicStats": { ... },
  "periodStats": {
    "totalSales": 1000000,
    "totalOrders": 30,
    "averageOrderValue": 33333,
    "totalCommission": 150000
  },
  "salesTrend": [
    { "date": "2025-12-03", "amount": 50000, "orders": 2 },
    ...
  ]
}
```

### 3. 정산 내역 조회
```typescript
GET /api/vendors/${vendorId}/settlements?limit=10&includeStats=true
Headers: Authorization: Bearer ${token}

Response:
{
  "success": true,
  "settlements": [{
    "id": "settlement123",
    "orderId": "order456",
    "orderAmount": 50000,
    "commission": 7500,
    "vendorAmount": 42500,
    "status": "transferred",
    "createdAt": { "seconds": 1234567890 }
  }],
  "hasMore": false,
  "count": 10
}
```

---

## 🐛 에러 처리

### 로딩 상태
```tsx
if (loading || isLoading) {
  return <LoadingSpinner />
}
```

### 판매자 없음
```tsx
if (!vendorData) {
  return (
    <div>
      <p>판매자 정보가 없습니다</p>
      <button onClick={() => router.push('/mypage/vendor/apply')}>
        판매자 신청하기
      </button>
    </div>
  )
}
```

### API 에러
```tsx
try {
  await fetch(...)
} catch (error) {
  console.error('Failed to load dashboard:', error);
  // 사용자에게 에러 메시지 표시
}
```

---

## 🎯 향후 개선 사항

### 1. 차트 라이브러리 도입
현재: 순수 CSS 막대 그래프
제안: **Recharts** 또는 **Chart.js** 도입
```bash
npm install recharts
```

### 2. 페이지네이션
현재: 최근 10개만 표시
제안: 무한 스크롤 또는 페이지네이션 추가

### 3. 필터 및 검색
- 날짜 범위 선택 (시작일 ~ 종료일)
- 정산 상태별 필터
- 주문번호 검색

### 4. 데이터 내보내기
- CSV 다운로드
- PDF 리포트 생성

### 5. 실시간 업데이트
- WebSocket 또는 Server-Sent Events
- 새 주문/정산 알림

### 6. 다크 모드
```tsx
const [theme, setTheme] = useState('light');
```

---

## 📊 성능 최적화

### 이미 적용된 최적화
1. **조건부 렌더링**: 데이터 없을 때 빈 상태 표시
2. **최소 API 호출**: useEffect 의존성 배열 최적화
3. **Tailwind CSS**: Zero-runtime CSS

### 추가 최적화 제안
1. **React.memo**: 통계 카드, 차트 메모이제이션
2. **useMemo**: 복잡한 계산 캐싱
3. **React Query**: API 상태 관리 및 캐싱
```bash
npm install @tanstack/react-query
```

---

## 🎉 완성된 파일

### 페이지
- `src/app/mypage/vendor/page.tsx` - 대시보드 메인 페이지

### API 수정
- `src/app/api/vendors/route.ts` - ownerId 쿼리 지원 추가

---

## 📸 화면 구성

```
┌─────────────────────────────────────────────────┐
│ [Business Name]            [7일][30일][90일]    │
│ 판매자 대시보드                                  │
├─────────────────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐        │
│ │총 매출│ │주문 수│ │평균  │ │수수료│         │
│ │₩1.0M │ │ 30건 │ │₩33K │ │₩150K│          │
│ └───────┘ └───────┘ └───────┘ └───────┘        │
├─────────────────────────────────────────────────┤
│ 일별 매출 추이                                   │
│ ┌─┐     ┌─┐ ┌─┐                                │
│ │█│ ┌─┐ │█│ │█│ ┌─┐                           │
│ │█│ │█│ │█│ │█│ │█│                           │
│ └─┘ └─┘ └─┘ └─┘ └─┘                           │
│  1   2   3   4   5  ...                         │
├─────────────────────────────────────────────────┤
│ 최근 정산 내역                                   │
│ ┌─────────────────────────────────────────┐    │
│ │주문│금액  │수수료│정산액│상태│일시    │     │
│ ├─────────────────────────────────────────┤    │
│ │... │₩50K │₩7.5K│₩42.5K│완료│12/03   │     │
│ └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## 🎊 완료!

판매자 대시보드 프론트엔드가 완성되었습니다!

### ✅ 구현 완료
- 반응형 레이아웃
- 통계 카드 (4개 지표)
- 일별 매출 차트
- 정산 내역 테이블
- 기간 선택 (7/30/90일)
- 로딩 상태 처리
- 에러 핸들링
- 권한 체크

### 📱 접속 방법
1. 판매자로 로그인
2. `/mypage/vendor` 접속
3. 실시간 데이터 확인!

이제 판매자들이 자신의 매출과 정산을 실시간으로 확인할 수 있습니다! 🚀
