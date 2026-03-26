# GOODZZ 개발 로드맵 & 현황

## 완료된 기능

### 1. 쇼핑 핵심 기능
- [x] 상점 메인 (`/shop`): 상품 목록 그리드, 카테고리 탭
- [x] 상품 상세 (`/shop/[id]`): AI 디자인 캔버스, 옵션 UI
- [x] 상태 관리 (Zustand): 장바구니/위시리스트
- [x] 장바구니 페이지 (`/cart`)
- [x] 위시리스트 페이지 (`/wishlist`)

### 2. 주문 및 결제
- [x] 주문서 작성 (`/checkout`) + PortOne PG 연동
- [x] 주문 완료 페이지 (`/order/complete`)
- [x] 주문 API (`/api/orders`, `/api/payment/*`)

### 3. 마이페이지
- [x] 대시보드 (`/mypage`), 주문 내역, 쿠폰함

### 4. 관리자
- [x] 대시보드, 주문/상품/디자인/배너/리뷰 관리
- [x] 수출바우처 사업계획서

### 5. AI 디자인
- [x] 생성 페이지 (`/create`): Gemini Pro + Imagen 3
- [x] 에디터 (`/editor/[id]`)

### 6. 인증
- [x] Google 소셜 로그인 (Firebase Auth)

---

## Phase 1: 크리티컬 수정 & 안정화 (완료)

- [x] **1.1 Google Fonts 빌드 오류 수정**: `next/font/google` → `next/font/local` 전환
- [x] **1.2 환경변수 검증**: `.env.example` 생성, `firebase.ts` graceful fallback 추가
- [x] **1.3 npm 취약점 해결**: Next.js 16.1.6 업데이트, high/critical 0개
- [x] **1.4 관리자 보안 강화**: 서버사이드 Firebase Admin 인증, API 라우트 인증 미들웨어
- [x] **1.5 다크모드 CSS 충돌 수정**: `prefers-color-scheme: dark` 블록 제거
- [x] **1.6 대시보드 실데이터 연동**: `/api/admin/stats` API, 매출 차트/통계 실데이터

---

## Phase 2: UX/UI 개선 & SEO (완료)

- [x] **2.1 Next.js Image 최적화**: 19개 파일 27개 `<img>` → `<Image>` 교체, remotePatterns 설정
- [x] **2.2 SEO 최적화**: generateMetadata (shop, product detail), robots.ts, sitemap.ts, JSON-LD 구조화 데이터
- [x] **2.3 다음 주소 API 연동**: 체크아웃 페이지 Daum Postcode API 통합
- [x] **2.4 로딩/에러 상태**: loading.tsx (root, shop, product detail, mypage) + error.tsx
- [x] **2.5 검색 성능 개선**: Firestore where() 쿼리 최적화, 인메모리 캐시
- [x] **2.6 홈페이지 리뷰 실데이터 연동**: Firestore 베스트 리뷰 동적 로드 + 폴백

---

## Phase 3: 고급 기능 (완료)

- [x] **3.1 디자인 에디터 고도화**: 앞면/뒷면 전환, 인쇄 영역(Print Zone) 시각화, 회전 슬라이더, PNG 내보내기
- [x] **3.2 단체/대량 주문 시스템**: volumePricing UI 표시, 수량별 할인 자동 적용, 대량주문 문의 폼
- [x] **3.3 리뷰 시스템 강화**: 사진 리뷰 업로드, 별점 분포 차트, 평균 평점 표시
- [x] **3.4 실시간 주문 알림**: Firestore 실시간 리스너, NotificationDropdown 컴포넌트, Navbar 알림 벨
- [x] **3.5 테스트 환경 구축**: Vitest + React Testing Library 설정, Zustand 스토어 테스트 작성

---

## Phase 4: 크리에이터 플랫폼 & 소셜 커머스 (완료)

- [x] **4.1 크리에이터 마켓플레이스**: 등록 플로우 (`/creators/register`), 대시보드 (`/creators/dashboard`), 스토어프론트 (`/creators/[handle]`), API (`/api/creators`), 정산 시스템 구조
- [x] **4.2 소셜 커머스 연동**: 카카오톡/트위터/페이스북/링크 공유 버튼, 상품 상세 페이지 통합
- [x] **4.3 AI 디자인 쇼케이스 & 커뮤니티**: 공개 갤러리, 좋아요/리믹스 기능, 스타일 필터
- [x] **4.4 상품 카탈로그 확장**: Product 타입에 printMethod 필드 추가, 인쇄 방식별 가격/설명 (DTG, 스크린, 승화전사, 자수, UV, 레이저)
