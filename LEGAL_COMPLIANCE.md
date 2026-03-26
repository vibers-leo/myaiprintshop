# 한국 전자상거래법 준수 가이드

## 🔍 법적 이슈 분석

### 1. 통신판매업 신고 의무 (전자상거래법 제12조)

**문제점**: iframe 방식으로 파트너 사이트에 임베드할 경우
- 통신판매업자가 MyAIPrintShop인지 파트너인지 불명확
- 소비자가 누구와 계약하는지 혼란 가능
- 책임 소재가 모호함

**법적 요구사항**:
- 통신판매업 신고번호 표시
- 사업자 정보 명확히 표시
- 환불/교환/취소 정책 명시

### 2. 통신판매중개자 vs 통신판매업자 구분

#### 통신판매중개자 (플랫폼)
- 단순히 거래를 중개만 함
- 책임: 제한적
- 예: 오픈마켓, 배달앱

#### 통신판매업자 (판매자)
- 직접 상품/서비스 판매
- 책임: 전면적 (청약철회, 환불, AS 등)

**현재 MyAIPrintShop의 위치**:
- WowPress 상품을 판매 → **통신판매업자**
- 파트너에게 SDK 제공 → **통신판매중개자** 역할도 병행

### 3. 필수 표시사항 (전자상거래법 제13조)

다음 정보가 **반드시** 소비자에게 표시되어야 함:
- ✅ 사업자 상호 및 대표자 성명
- ✅ 사업자 주소, 전화번호
- ✅ 통신판매업 신고번호
- ✅ 이메일 주소
- ✅ 사업자등록번호
- ✅ 상품/서비스 가격
- ✅ 배송비
- ✅ 청약철회 및 환불 조건
- ✅ 개인정보처리방침

**문제**: iframe 임베드 시 이러한 정보가 누락되거나 파트너 정보와 혼재될 위험

---

## ✅ 법적 준수 솔루션

### 방안 1: 서브도메인 방식 (권장) ⭐

각 파트너에게 전용 서브도메인 발급:
```
partner1.myaiprintshop.com
partner2.myaiprintshop.com
```

**장점**:
- ✅ 명확한 통신판매업자 표시 (MyAIPrintShop)
- ✅ 필수 정보 누락 없음
- ✅ 브랜딩 효과
- ✅ CORS 이슈 없음
- ✅ 법적 책임 소재 명확

**단점**:
- ❌ 인프라 비용 증가
- ❌ SSL 인증서 관리

**구현 방법**:
```typescript
// Vercel에서 동적 서브도메인 지원
// vercel.json
{
  "rewrites": [
    {
      "source": "/:partner.myaiprintshop.com/:path*",
      "destination": "/partner/:partner/:path*"
    }
  ]
}
```

### 방안 2: API 기반 완전 분리형

파트너가 자신의 도메인에서 직접 호스팅:
```
partner.com/products (파트너가 직접 구현)
 └─► API 호출 → myaiprintshop.com/api
```

**장점**:
- ✅ 파트너가 통신판매업자 (책임도 파트너)
- ✅ MyAIPrintShop은 단순 공급자
- ✅ 법적 리스크 최소화

**단점**:
- ❌ 파트너의 개발 부담 증가
- ❌ 통합 난이도 높음

### 방안 3: 화이트라벨 솔루션 (기존 iframe 개선)

iframe 사용하되 법적 요구사항 충족:

```html
<!-- 파트너 사이트 -->
<div style="border: 2px solid #e5e7eb; padding: 16px; border-radius: 8px;">
  <!-- 필수 사업자 정보 -->
  <div style="background: #f3f4f6; padding: 12px; margin-bottom: 16px;">
    <strong>통신판매업자: MyAIPrintShop</strong><br>
    대표: 홍길동 | 사업자등록번호: 123-45-67890<br>
    통신판매업신고: 제2024-서울강남-0001호<br>
    주소: 서울시 강남구 테헤란로 123<br>
    전화: 02-1234-5678 | 이메일: support@myaiprintshop.com
  </div>

  <!-- iframe -->
  <iframe src="https://myaiprintshop.com/embed/product/123?apiKey=xxx"></iframe>

  <!-- 환불/교환 정책 링크 -->
  <div style="margin-top: 12px; font-size: 12px; color: #6b7280;">
    <a href="https://myaiprintshop.com/terms" target="_blank">이용약관</a> |
    <a href="https://myaiprintshop.com/privacy" target="_blank">개인정보처리방침</a> |
    <a href="https://myaiprintshop.com/refund" target="_blank">환불정책</a>
  </div>
</div>
```

**장점**:
- ✅ 기존 구현 활용 가능
- ✅ 법적 요구사항 충족

**단점**:
- ❌ 파트너가 정보 표시를 누락할 위험
- ❌ 디자인 일관성 낮음

---

## 🎯 최종 권장 사항

### 단기 (즉시 적용)
1. **SDK/Widget 사용 시 필수 정보 자동 표시**
   ```javascript
   MyAIPrintShop.createBuyButton({
     apiKey: 'xxx',
     productId: 'xxx',
     // 사업자 정보 자동 표시 (법적 준수)
     showBusinessInfo: true  // 기본값: true (강제)
   });
   ```

2. **Embed 페이지에 사업자 정보 푸터 추가**
   ```tsx
   // src/app/embed/layout.tsx
   <footer className="legal-footer">
     통신판매업자: MyAIPrintShop |
     신고번호: 제2024-서울강남-0001호 |
     대표: 홍길동 |
     사업자등록번호: 123-45-67890
   </footer>
   ```

3. **개인정보처리방침 및 이용약관 링크 필수 표시**

### 중기 (3개월 내)
1. **서브도메인 시스템 구축**
   - Vercel 동적 서브도메인 설정
   - 파트너별 커스텀 도메인 지원

2. **통신판매업 신고번호 발급**
   - 실제 사업자등록 후 신고
   - 번호를 모든 판매 페이지에 표시

### 장기 (6개월 내)
1. **에스크로 연동** (고액 거래 시)
   - 20만원 이상 거래 시 에스크로 의무
   - PortOne 에스크로 기능 활성화

2. **소비자 분쟁 해결 기준 명시**
   - 공정거래위원회 표준약관 준수
   - 환불/교환/AS 정책 상세화

---

## 📋 체크리스트

### 법적 준수 필수 항목
- [ ] 통신판매업 신고 (사업자등록 후)
- [ ] 사업자 정보 페이지 작성 (/about)
- [ ] 이용약관 작성 (/terms)
- [ ] 개인정보처리방침 작성 (/privacy)
- [ ] 환불/교환 정책 작성 (/refund)
- [ ] 모든 판매 페이지에 사업자 정보 표시
- [ ] 청약철회 안내 명시 (7일 이내)
- [ ] 고객센터 연락처 명시

### SDK/Embed 준수 항목
- [ ] 사업자 정보 자동 표시 기능
- [ ] 이용약관 동의 체크박스 (결제 전)
- [ ] 개인정보 수집/이용 동의 체크박스
- [ ] 환불 정책 링크 표시
- [ ] 고객센터 연락처 표시

---

## 🔗 관련 법령 링크

- [전자상거래 등에서의 소비자보호에 관한 법률](https://www.law.go.kr/)
- [통신판매업 신고 안내 (공정거래위원회)](https://www.ftc.go.kr/)
- [개인정보보호법](https://www.pipc.go.kr/)

---

## ⚠️ 주의사항

1. **파트너가 직접 판매자가 되려면**:
   - 파트너가 자체 통신판매업 신고 필요
   - MyAIPrintShop은 단순 공급자 (도매)
   - 파트너 사이트에서 결제/배송 모두 처리

2. **MyAIPrintShop이 판매자가 되려면** (현재 구조):
   - MyAIPrintShop 통신판매업 신고 필수
   - 모든 페이지에 사업자 정보 표시
   - 환불/AS 책임 전부 부담

3. **법적 자문 권장**:
   - 실제 서비스 오픈 전 법무법인 자문 필수
   - 약관 검토 및 승인 절차 진행
   - 소비자 피해 대비 보험 가입 고려
