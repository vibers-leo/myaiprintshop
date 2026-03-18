# 판매자 대시보드 & 자동화 시스템 구현 완료

## 📋 구현 개요

판매자 대시보드, 이메일 알림, 정산 자동화 시스템을 구현했습니다.

---

## ✅ 완료된 기능

### 1. 판매자 정산 API

#### GET /api/vendors/[vendorId]/settlements
- **기능**: 판매자별 정산 내역 조회
- **권한**: 판매자 본인 또는 Admin
- **Query Parameters**:
  - `status`: 'pending' | 'transferred' | 'failed'
  - `limit`: 조회 개수 (기본 20)
  - `includeStats`: 통계 포함 여부
- **응답**:
  ```json
  {
    "success": true,
    "settlements": [...],
    "hasMore": true,
    "count": 20,
    "stats": {
      "totalAmount": 1000000,
      "totalCommission": 150000,
      "totalVendorAmount": 850000,
      "transferredCount": 10,
      "pendingCount": 5,
      "failedCount": 2
    }
  }
  ```

### 2. 판매자 통계 API

#### GET /api/vendors/[vendorId]/stats
- **기능**: 판매자 매출 및 주문 통계
- **권한**: 판매자 본인 또는 Admin
- **Query Parameters**:
  - `period`: '7d' | '30d' | '90d' | '1y'
- **응답**:
  ```json
  {
    "success": true,
    "period": {
      "start": "2025-12-03T00:00:00.000Z",
      "end": "2026-01-02T00:00:00.000Z",
      "label": "30d"
    },
    "basicStats": {
      "totalSales": 5000000,
      "totalOrders": 150,
      "totalProducts": 25
    },
    "periodStats": {
      "totalSales": 1000000,
      "totalOrders": 30,
      "averageOrderValue": 33333,
      "totalCommission": 150000
    },
    "salesTrend": [
      { "date": "2025-12-03", "amount": 50000, "orders": 2 },
      { "date": "2025-12-04", "amount": 75000, "orders": 3 }
    ],
    "recentSettlements": [...]
  }
  ```

---

## 📧 이메일 알림 시스템

### 지원하는 이메일 서비스
- **Resend** (추천)
- **SendGrid**
- **Console** (개발 모드 기본값)

### 환경변수 설정
```env
EMAIL_SERVICE=console  # 'resend' | 'sendgrid' | 'console'
EMAIL_API_KEY=your-api-key
EMAIL_FROM=noreply@myaiprintshop.com
```

### 구현된 이메일 템플릿

#### 1. 판매자 승인 이메일
- **발송 시점**: Admin이 판매자 승인 시
- **수신자**: 판매자
- **내용**: 승인 축하, 수수료율, 대시보드 링크

#### 2. 판매자 거부 이메일
- **발송 시점**: Admin이 판매자 거부 시
- **수신자**: 판매자
- **내용**: 거부 사유, 고객센터 안내

#### 3. 주문 접수 이메일
- **발송 시점**: 새 주문 발생 시
- **수신자**: 판매자
- **내용**: 주문번호, 상품 목록, 주문 상세 링크

#### 4. 정산 완료 이메일
- **발송 시점**: 정산 성공 시
- **수신자**: 판매자
- **내용**: 정산금액, 수수료, 입금 정보

### 사용 예시
```typescript
import { sendVendorApprovedEmail } from '@/lib/email';

await sendVendorApprovedEmail('vendor@example.com', {
  vendorName: '홍길동',
  businessName: '테스트 굿즈샵',
  commissionRate: 0.15,
  dashboardUrl: 'https://myaiprintshop.com/mypage/vendor',
});
```

---

## ⚙️ 정산 자동화 시스템

### 1. 정산 재시도 로직

#### 함수: `retryFailedSettlement(settlementId)`
- **기능**: 실패한 정산 재시도
- **최대 재시도**: 3회
- **동작**:
  1. 정산 상태 확인 ('failed'만 재시도 가능)
  2. 재시도 횟수 확인 (3회 초과 시 중단)
  3. PortOne API 호출
  4. 성공 시: 상태 'transferred', 이메일 발송
  5. 실패 시: 재시도 횟수 증가, 실패 사유 기록

#### 함수: `retryAllFailedSettlements()`
- **기능**: 모든 실패한 정산 일괄 재시도
- **조건**: status='failed', retryCount<3
- **반환**: `{ success: number, failed: number }`

### 2. 정산 주기 설정

#### 지원하는 스케줄
- **instant**: 즉시 정산 (주문 완료 후)
- **daily**: 일일 정산 (매일 00:00)
- **weekly**: 주간 정산 (매주 월요일 00:00)
- **monthly**: 월간 정산 (매월 1일 00:00)

#### 함수: `runScheduledSettlementJob(schedule)`
- **기능**: 스케줄별 정산 작업 실행
- **동작**:
  1. 해당 스케줄의 대기 중인 정산 처리
  2. 실패한 정산 재시도
  3. 완료 로그 기록

### 3. 크론 작업 API

#### POST/GET /api/cron/settlements?schedule={schedule}
- **기능**: 정산 크론 작업 엔드포인트
- **인증**: Bearer 토큰 (프로덕션)
- **환경변수**: `CRON_SECRET`

### Vercel Cron 설정 예시

`vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/settlements?schedule=daily",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/settlements?schedule=weekly",
      "schedule": "0 0 * * 1"
    },
    {
      "path": "/api/cron/settlements?schedule=monthly",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

---

## 📁 생성된 파일

### 라이브러리 파일
- `src/lib/settlements.ts` - 정산 데이터 조회 함수
- `src/lib/email.ts` - 이메일 발송 시스템
- `src/lib/settlement-automation.ts` - 정산 자동화 로직

### API 엔드포인트
- `src/app/api/vendors/[vendorId]/settlements/route.ts` - 정산 내역 API
- `src/app/api/vendors/[vendorId]/stats/route.ts` - 통계 API
- `src/app/api/cron/settlements/route.ts` - 크론 작업 API

### 수정된 파일
- `src/lib/vendors.ts` - 이메일 발송 통합

---

## 🔧 다음 단계 (선택사항)

### 1. UI 구현
- 판매자 대시보드 페이지 (`/mypage/vendor`)
- 매출 차트 (Chart.js 또는 Recharts)
- 정산 내역 테이블
- 통계 카드 컴포넌트

### 2. 실제 이메일 서비스 연동
```bash
npm install resend
```

```env
EMAIL_SERVICE=resend
EMAIL_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@myaiprintshop.com
```

### 3. Vendor 모델 확장
```typescript
export interface Vendor {
  // ... 기존 필드
  settlementSchedule: 'instant' | 'daily' | 'weekly' | 'monthly';
  emailNotifications: {
    orderReceived: boolean;
    settlementTransferred: boolean;
  };
}
```

### 4. 크론 작업 모니터링
- Sentry 또는 Datadog 연동
- 실패 알림 설정
- 실행 로그 대시보드

---

## 📊 테스트 방법

### 1. 정산 내역 조회
```bash
curl http://localhost:3300/api/vendors/{vendorId}/settlements?includeStats=true \
  -H "Authorization: Bearer {token}"
```

### 2. 통계 조회
```bash
curl http://localhost:3300/api/vendors/{vendorId}/stats?period=30d \
  -H "Authorization: Bearer {token}"
```

### 3. 크론 작업 테스트
```bash
curl -X POST http://localhost:3300/api/cron/settlements?schedule=daily \
  -H "Authorization: Bearer your-cron-secret"
```

---

## 🎉 완료!

판매자를 위한 핵심 기능이 모두 구현되었습니다:
- ✅ 정산 내역 조회
- ✅ 매출 통계 및 트렌드
- ✅ 자동 이메일 알림
- ✅ 정산 재시도 로직
- ✅ 스케줄별 자동 정산

이제 판매자들이 자신의 매출과 정산을 실시간으로 확인하고,
중요한 이벤트에 대한 알림을 받을 수 있습니다.
