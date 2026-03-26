# 서브도메인 방식 설정 가이드

이 가이드는 파트너에게 전용 서브도메인을 제공하여 법적 준수를 강화하고 브랜딩 효과를 높이는 방법을 안내합니다.

## 📋 서브도메인 방식의 장점

### 법적 준수 강화
- ✅ 통신판매업자 정보가 명확하게 표시됨
- ✅ 필수 약관 페이지 접근 용이
- ✅ 책임 소재가 명확함 (MyAIPrintShop이 통신판매업자)

### 기술적 장점
- ✅ CORS 문제 없음 (같은 도메인)
- ✅ SEO 향상 (검색 엔진 최적화)
- ✅ SSL 인증서 공유
- ✅ 쿠키/세션 공유 가능

### 비즈니스 장점
- ✅ 파트너별 브랜딩 효과
- ✅ 전문성 향상
- ✅ 신뢰도 증가
- ✅ 파트너별 맞춤 설정 가능

---

## 🔧 1단계: DNS 설정 (Vercel)

### Vercel 대시보드에서 도메인 추가

1. **Vercel 프로젝트 접속**
   - https://vercel.com/dashboard
   - MyAIPrintShop 프로젝트 선택

2. **도메인 설정**
   - Settings > Domains
   - "Add Domain" 클릭

3. **와일드카드 서브도메인 추가**
   ```
   *.myaiprintshop.com
   ```

4. **DNS 레코드 설정**

   도메인 등록 업체(가비아, Cloudflare 등)에서 다음 레코드 추가:

   ```
   Type: A
   Name: *
   Value: 76.76.21.21 (Vercel IP - 실제 값은 Vercel에서 확인)

   또는

   Type: CNAME
   Name: *
   Value: cname.vercel-dns.com
   ```

5. **DNS 전파 대기**
   - 최대 48시간 소요 (보통 1-2시간)
   - 확인 방법:
     ```bash
     dig partner.myaiprintshop.com
     nslookup partner.myaiprintshop.com
     ```

---

## 🗄️ 2단계: Firestore 파트너 등록

### 파트너 문서 생성

Firebase Console에서 `api_partners` 컬렉션에 문서 추가:

**컬렉션 ID**: `api_partners`
**문서 ID**: `partner_123` (파트너 고유 ID)

**필드**:
```javascript
{
  // 기본 정보
  name: "파트너 이름",
  subdomain: "partner", // 서브도메인 (partner.myaiprintshop.com)
  status: "active", // active | inactive | suspended

  // API 키
  apiKey: "sk_live_xxxxxxxxxx",

  // 설정
  allowedOrigins: ["*"], // CORS 허용 도메인
  features: {
    sdkEnabled: true,
    widgetEnabled: true,
    embedEnabled: true,
    subdomainEnabled: true, // 서브도메인 활성화
  },

  // 브랜딩
  brandColor: "#3B82F6", // 파트너 브랜드 컬러
  logo: "https://example.com/logo.png",
  homeUrl: null, // 서브도메인 홈에서 리다이렉트할 URL (null이면 상품 목록)

  // 연락처
  contactEmail: "support@partner.com",
  contactPhone: "02-1234-5678",

  // 통계
  tier: "enterprise", // free | pro | enterprise
  requestsPerHour: 20000,
  totalRequests: 0,

  // 타임스탬프
  createdAt: [Timestamp],
  updatedAt: [Timestamp],
}
```

### 예시

```javascript
// 파트너: ABC 스타트업
{
  name: "ABC 스타트업",
  subdomain: "abc",
  status: "active",
  apiKey: "sk_live_abc123456789",
  allowedOrigins: ["https://abc.com", "https://www.abc.com"],
  features: {
    sdkEnabled: true,
    widgetEnabled: true,
    embedEnabled: true,
    subdomainEnabled: true,
  },
  brandColor: "#FF5733",
  logo: "https://abc.com/logo.png",
  homeUrl: null,
  contactEmail: "support@abc.com",
  contactPhone: "02-9999-8888",
  tier: "enterprise",
  requestsPerHour: 20000,
  totalRequests: 0,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
}
```

---

## ✅ 3단계: 서브도메인 테스트

### 로컬 테스트

로컬에서 서브도메인을 테스트하려면 `/etc/hosts` 파일 수정:

```bash
# macOS/Linux
sudo nano /etc/hosts

# Windows
# C:\Windows\System32\drivers\etc\hosts 파일 편집 (관리자 권한)

# 다음 줄 추가
127.0.0.1 partner.localhost
127.0.0.1 abc.localhost
```

개발 서버 시작:
```bash
npm run dev
```

브라우저에서 접속:
```
http://partner.localhost:3300
http://abc.localhost:3300
```

### 프로덕션 테스트

1. **DNS 전파 확인**
   ```bash
   dig abc.myaiprintshop.com
   # 출력에서 Vercel IP 확인
   ```

2. **브라우저에서 접속**
   ```
   https://abc.myaiprintshop.com
   ```

3. **예상 동작**
   - Firestore에서 `api_partners/abc` 문서 조회
   - `status`가 "active"이면 상품 목록 페이지 표시
   - "inactive"이면 메인 사이트로 리다이렉트

4. **확인 사항**
   - ✅ 파트너 헤더 표시 (파트너 이름)
   - ✅ 상품 목록 조회
   - ✅ 상품 상세 페이지 접근
   - ✅ 법적 필수 정보 푸터 표시
   - ✅ SSL 인증서 유효

---

## 🎨 4단계: 파트너 커스터마이징 (선택사항)

### 브랜드 컬러 적용

`api_partners` 문서의 `brandColor` 필드를 사용하여 파트너별 테마 적용:

```typescript
// src/app/partner/[partnerId]/layout.tsx
export default async function PartnerLayout({ params, children }) {
  const { partnerId } = await params;
  const partnerDoc = await getDoc(doc(db, 'api_partners', partnerId));
  const brandColor = partnerDoc.data()?.brandColor || '#3B82F6';

  return (
    <div style={{ '--brand-color': brandColor }}>
      {children}
    </div>
  );
}
```

### 로고 표시

파트너 로고를 헤더에 표시:

```typescript
{partnerData.logo && (
  <Image
    src={partnerData.logo}
    alt={partnerData.name}
    width={120}
    height={40}
    className="h-10 w-auto"
  />
)}
```

### 커스텀 홈 URL

파트너가 별도의 홈페이지를 운영하는 경우:

```javascript
// Firestore api_partners 문서
{
  homeUrl: "https://abc.com",
  // ...
}
```

서브도메인 접속 시 파트너 홈페이지로 리다이렉트됩니다.

---

## 📊 5단계: 모니터링 및 분석

### Vercel Analytics

1. **Vercel 대시보드**
   - Analytics 탭
   - 서브도메인별 트래픽 확인

2. **커스텀 이벤트 추적**
   ```typescript
   import { track } from '@vercel/analytics';

   track('product_view', {
     partnerId: partnerId,
     productId: productId,
   });
   ```

### Firestore 로그

파트너별 사용량 추적:

```typescript
// API 호출 시 자동 기록
await updateDoc(doc(db, 'api_partners', partnerId), {
  totalRequests: increment(1),
  lastRequestAt: serverTimestamp(),
});
```

### Google Analytics

파트너별 트래픽 분석:

```typescript
// GA4 이벤트
gtag('event', 'page_view', {
  partner_id: partnerId,
  partner_name: partnerName,
});
```

---

## 🚨 문제 해결

### 1. "서브도메인에 접속할 수 없습니다"

**원인**: DNS 레코드가 설정되지 않음

**해결**:
```bash
# DNS 확인
dig abc.myaiprintshop.com

# 예상 출력:
# abc.myaiprintshop.com. 300 IN A 76.76.21.21
```

DNS 레코드가 없으면 도메인 등록 업체에서 CNAME 또는 A 레코드 추가

### 2. "파트너를 찾을 수 없습니다"

**원인**: Firestore에 파트너 문서가 없거나 status가 "active"가 아님

**확인**:
- Firebase Console > Firestore > api_partners > [partnerId]
- `status` 필드가 "active"인지 확인
- `subdomain` 필드와 URL 서브도메인이 일치하는지 확인

### 3. SSL 인증서 오류

**원인**: Vercel이 새 서브도메인 인증서를 아직 발급하지 않음

**해결**:
- Vercel이 자동으로 Let's Encrypt 인증서 발급 (최대 10분 소요)
- Vercel 대시보드 > Settings > Domains에서 확인

### 4. 상품 목록이 비어있음

**원인**: 파트너에게 할당된 상품이 없음

**해결**:
- 현재는 모든 활성 상품을 표시
- 파트너별 상품 필터링이 필요하면 `api_partners` 문서에 `allowedProducts` 배열 추가

---

## 📋 체크리스트

서브도메인 설정이 완료되었는지 확인하세요:

- [ ] Vercel에 와일드카드 도메인 추가 (*.myaiprintshop.com)
- [ ] DNS A/CNAME 레코드 설정
- [ ] DNS 전파 확인 (dig/nslookup)
- [ ] Firestore에 api_partners 문서 생성
- [ ] `subdomain` 필드와 `status: "active"` 설정
- [ ] 브라우저에서 서브도메인 접속 테스트
- [ ] 상품 목록 페이지 표시 확인
- [ ] 상품 상세 페이지 접근 확인
- [ ] 법적 필수 정보 푸터 표시 확인
- [ ] SSL 인증서 유효 확인
- [ ] 결제 플로우 테스트 (장바구니 → 결제)

모든 항목이 체크되면 서브도메인 설정이 완료된 것입니다! 🎉

---

## 🔗 참고 자료

- [Vercel 도메인 설정 가이드](https://vercel.com/docs/concepts/projects/domains)
- [Next.js Dynamic Routes](https://nextjs.org/docs/routing/dynamic-routes)
- [전자상거래법 제13조](https://www.law.go.kr/)

---

## 📞 지원

문제가 계속되면 다음 정보를 포함하여 문의하세요:

1. 파트너 ID (subdomain)
2. 서브도메인 URL
3. DNS 조회 결과 (dig 출력)
4. Firestore api_partners 문서 스크린샷
5. 브라우저 콘솔 에러 메시지
