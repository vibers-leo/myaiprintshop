# 🚀 GOODZZ 프로덕션 배포 가이드

GOODZZ MVP (SDK, Widget, Embed, WowPress 통합 포함)를 프로덕션 환경에 배포하는 완전한 가이드입니다.

## 📋 배포 전 체크리스트

### 1. 환경 변수 준비

Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:

#### 필수 환경 변수

```bash
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=myaiprintshop.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=myaiprintshop
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=myaiprintshop.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Google AI (Gemini/Imagen 3)
GOOGLE_API_KEY=your-google-ai-api-key

# Site URL (프로덕션)
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

#### PortOne 결제 설정 (필수)

```bash
# PortOne 결제 (V2)
NEXT_PUBLIC_PORTONE_STORE_ID=your-store-id
NEXT_PUBLIC_PORTONE_CHANNEL_KEY=your-channel-key
PORTONE_API_SECRET=your-api-secret
```

#### WowPress API 설정 (Print-on-Demand)

```bash
# WowPress API Key
WOWPRESS_API_KEY=your-wowpress-api-key
```

#### 관리자 설정

```bash
# 관리자 이메일 (쉼표로 구분)
ADMIN_EMAILS=admin@myaiprintshop.com,juno@myaiprintshop.com
```

#### 선택 환경 변수 (Firebase Admin SDK 사용 시)

```bash
# Firebase Admin SDK (서버 사이드)
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@myaiprintshop.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

---

## 🌐 Vercel 배포 방법

### 방법 1: Vercel CLI로 배포 (추천)

```bash
# 1. Vercel CLI 설치 (처음 한 번만)
npm install -g vercel

# 2. Vercel 로그인
vercel login

# 3. 프로젝트 링크 (처음 한 번만)
vercel link

# 4. 환경 변수 설정 (Vercel 대시보드에서)
# https://vercel.com/your-team/your-project/settings/environment-variables

# 5. 배포
vercel --prod
```

### 방법 2: GitHub 연동으로 자동 배포

1. GitHub에 코드 푸시
2. Vercel 대시보드에서 "Import Project"
3. GitHub 저장소 선택
4. 환경 변수 설정
5. Deploy 클릭

---

## ⚙️ 빌드 설정

### SDK 빌드 포함

`vercel.json` 파일이 SDK 빌드를 포함하도록 설정되어 있습니다:

```json
{
  "buildCommand": "npm run build && npm run build:sdk",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

**빌드 프로세스:**
1. Next.js 앱 빌드 (`npm run build`)
2. Buy Button SDK 빌드 (`npm run build:sdk`)
   - 출력: `public/sdk/buy-button.min.js` (2.01 KB gzipped)
   - 소스맵: `public/sdk/buy-button.min.js.map`

### 로컬에서 프로덕션 빌드 테스트

배포 전 로컬에서 빌드를 테스트하세요:

```bash
# SDK 빌드
npm run build:sdk

# Next.js 빌드
npm run build

# 프로덕션 모드 실행
npm run start
```

에러가 없는지 확인하고 http://localhost:3300 에서 테스트하세요.

---

## 🔥 Firebase 설정

### 1. Firebase Hosting (선택사항)

Vercel 대신 Firebase Hosting을 사용하려면:

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# Firebase 초기화
firebase init hosting

# 빌드 후 배포
npm run build
firebase deploy --only hosting
```

### 2. Firestore 인덱스 및 보안 규칙 배포

프로젝트에 `firestore.indexes.json` 파일이 생성되어 있습니다. Firebase CLI로 배포하세요:

```bash
# Firebase 로그인
firebase login

# Firestore 인덱스 배포
firebase deploy --only firestore:indexes --project myaiprintshop

# Firestore 보안 규칙 배포 (선택)
firebase deploy --only firestore:rules --project myaiprintshop
```

**중요**: 빌드 중 발견된 Firestore 인덱스가 필요합니다:
- `reviews` 컬렉션: `rating` (DESC) + `createdAt` (DESC)
- `products` 컬렉션: `category` (ASC) + `createdAt` (DESC)
- `orders` 컬렉션: `userId` (ASC) + `createdAt` (DESC)
- `orders` 컬렉션: `vendorId` (ASC) + `createdAt` (DESC)

위 명령으로 인덱스를 자동 생성하거나, Firebase Console에서 수동으로 생성할 수 있습니다.

---

## 🎯 도메인 설정

### 메인 도메인

1. Vercel 대시보드 → Settings → Domains
2. 메인 도메인 추가 (예: `myaiprintshop.com`)
3. DNS 설정:
   ```
   A    @    76.76.21.21
   CNAME www  cname.vercel-dns.com
   ```

### 와일드카드 서브도메인 (파트너용)

파트너별 전용 서브도메인 (예: `partner.myaiprintshop.com`)을 제공하려면:

1. **Vercel에서 와일드카드 도메인 추가**
   - Settings → Domains
   - `*.myaiprintshop.com` 추가

2. **DNS 레코드 추가**
   ```
   CNAME  *  cname.vercel-dns.com
   ```

3. **Firestore에 파트너 등록**

   `api_partners` 컬렉션에 파트너 문서 추가:
   ```javascript
   {
     subdomain: "partner",  // partner.myaiprintshop.com
     status: "active",
     // ... 기타 필드
   }
   ```

자세한 내용은 [scripts/setup-subdomain.md](scripts/setup-subdomain.md) 참고

### SSL 인증서

Vercel이 자동으로 Let's Encrypt 인증서를 발급합니다 (최대 24시간 소요, 보통 10분 이내).

---

## 🐛 문제 해결

### 빌드 오류 시

```bash
# 로컬에서 빌드 테스트
npm run build

# 캐시 클리어 후 재시도
rm -rf .next
npm run build
```

### 환경 변수 오류 시

- Vercel 대시보드에서 환경 변수를 다시 확인
- `NEXT_PUBLIC_` 접두사 확인
- 따옴표 없이 값만 입력

### Firebase 연결 오류 시

- Firebase Console에서 웹 앱 설정 확인
- API 키가 정확한지 확인
- Firestore 보안 규칙 확인

---

## 📊 성능 최적화

### 1. 이미지 최적화

Next.js Image 컴포넌트 사용 (이미 적용됨)

### 2. 폰트 최적화

- Inter 폰트: Google Fonts에서 자동 최적화
- 한글 폰트: subset으로 최적화됨

### 3. 번들 크기 최적화

```bash
# 번들 분석
npm run build
npx @next/bundle-analyzer
```

---

## 🧪 WowPress 통합 설정

배포 후 WowPress API 통합을 설정하세요:

1. **환경 변수 확인**
   - `WOWPRESS_API_KEY`가 Production 환경에 설정되어 있는지 확인

2. **Firestore 벤더 등록**
   - Firebase Console → Firestore
   - `vendors/VENDOR_WOWPRESS` 문서 생성
   - 필드: `businessName`, `vendorType`, `commissionRate`, `status: "approved"`

3. **테스트**
   ```bash
   # 상품 동기화 API 호출 (관리자 권한 필요)
   curl -X POST https://myaiprintshop.com/api/wowpress/sync/product/WOW001 \
     -H "Authorization: Bearer <admin-token>"
   ```

4. **주문 전달 확인**
   - WowPress 상품으로 테스트 주문 생성
   - Firestore `wowpress_order_logs` 컬렉션에서 `status: "forwarded"` 확인

자세한 내용은 [scripts/setup-wowpress.md](scripts/setup-wowpress.md) 참고

---

## 📦 SDK 배포

배포 후 파트너에게 제공할 SDK URL:

```html
<!-- 프로덕션 SDK -->
<script src="https://myaiprintshop.com/sdk/buy-button.min.js"></script>
```

**사용 예시:**

```html
<div id="buy-button"></div>

<script src="https://myaiprintshop.com/sdk/buy-button.min.js"></script>
<script>
  MyAIPrintShop.createBuyButton({
    apiKey: 'sk_live_xxxxxxxxxx',
    productId: 'prod_xxxxxxxxxx',
    containerId: 'buy-button',
    buttonText: '지금 구매하기',
    onPaymentSuccess: (order) => {
      console.log('주문 완료:', order);
    },
  });
</script>
```

**SDK 파일 확인:**
- 크기: 2.01 KB (gzipped)
- 경로: `public/sdk/buy-button.min.js`
- 캐시: 1년 (immutable)

---

## ✅ 배포 후 체크리스트

### 기본 기능
- [ ] 홈페이지 로딩 확인
- [ ] Firebase 로그인 테스트
- [ ] AI 이미지 생성 테스트
- [ ] 명함 에디터 작동 확인
- [ ] 상품 목록 로딩 확인
- [ ] 장바구니 기능 테스트
- [ ] 결제 플로우 (테스트 카드)
- [ ] 모바일 반응형 확인
- [ ] 성능 측정 (Lighthouse)

### 파트너 통합
- [ ] SDK 로드 테스트 (`https://myaiprintshop.com/sdk/buy-button.min.js`)
- [ ] Buy Button 렌더링 확인
- [ ] Embed 페이지 접속 (`/embed/product/[id]?apiKey=xxx`)
- [ ] 서브도메인 접속 (`partner.myaiprintshop.com`)
- [ ] CORS 헤더 확인 (Public API)

### WowPress 통합
- [ ] `WOWPRESS_API_KEY` 환경 변수 설정
- [ ] `vendors/VENDOR_WOWPRESS` 문서 생성
- [ ] 상품 동기화 API 테스트
- [ ] 주문 전달 테스트 (실제 주문 또는 테스트 주문)
- [ ] `wowpress_order_logs` 확인

### 법적 준수
- [ ] 이용약관 페이지 (`/terms`)
- [ ] 개인정보처리방침 (`/privacy`)
- [ ] 환불정책 (`/refund`)
- [ ] Embed 페이지 법적 푸터 표시
- [ ] 파트너 페이지 법적 푸터 표시

---

## 🔗 유용한 링크

- [Vercel 대시보드](https://vercel.com/dashboard)
- [Firebase Console](https://console.firebase.google.com/)
- [Next.js 배포 문서](https://nextjs.org/docs/deployment)
- [Vercel 환경 변수 가이드](https://vercel.com/docs/concepts/projects/environment-variables)

---

**배포 완료 후 프로덕션 URL을 `.env.local`의 `NEXT_PUBLIC_SITE_URL`에 업데이트하세요!**
