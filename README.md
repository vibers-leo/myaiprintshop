# 🎨 GOODZZ

> AI로 디자인하고, 바로 제작하는 프리미엄 프린트샵

[![Next.js](https://img.shields.io/badge/Next.js-16.1.7-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ 주요 기능

### 🤖 AI 디자인
- **Google Gemini & Imagen 3** 통합
- 텍스트로 이미지 생성
- 다양한 스타일 템플릿

### 🖨️ 명함 에디터
- **Fabric.js** 기반 고급 에디터
- 앞면/뒷면 디자인
- QR 코드 자동 생성
- 10가지 한글 폰트
- 12가지 프리미엄 색상
- 템플릿 시스템

### 🛍️ 이커머스 기능
- 상품 카탈로그
- 장바구니 & 위시리스트
- **PortOne** 결제 연동
- 주문 관리 시스템

### 🔥 Firebase 통합
- **Authentication** - Google 소셜 로그인
- **Firestore** - 실시간 데이터베이스
- **Storage** - 이미지 저장

---

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 20+
- npm 또는 yarn
- Firebase 프로젝트
- Google AI API 키 (선택)

### 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/goodzz.git
cd goodzz

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열어 API 키 입력

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3300](http://localhost:3300)을 열어 확인하세요.

---

## 🎯 프로젝트 구조

```
goodzz/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── page.tsx           # 홈페이지
│   │   ├── shop/              # 상품 목록
│   │   ├── create/            # AI 이미지 생성
│   │   └── editor/
│   │       └── business-card/ # 명함 에디터
│   ├── components/            # React 컴포넌트
│   │   ├── editor/            # 에디터 컴포넌트
│   │   ├── Hero.tsx           # 히어로 섹션
│   │   ├── Navbar.tsx         # 네비게이션
│   │   └── Footer.tsx         # 푸터
│   ├── lib/                   # 유틸리티 & 로직
│   │   ├── firebase/          # Firebase 설정
│   │   ├── fabric/            # Fabric.js 헬퍼
│   │   ├── templates/         # 명함 템플릿
│   │   └── products.ts        # 상품 데이터
│   ├── store/                 # Zustand 상태 관리
│   ├── context/               # React Context
│   └── styles/                # 글로벌 스타일
├── public/                    # 정적 파일
├── scripts/                   # 시드 스크립트
└── DEPLOYMENT.md              # 배포 가이드
```

---

## 🎨 디자인 시스템

### Stripe + Aceternity UI 스타일

- **컬러**: 보라색(Primary) + 파란색(Accent)
- **타이포그래피**: Inter + Pretendard (한글)
- **레이아웃**: 넉넉한 여백, 미니멀한 디자인
- **버튼**: 그라디언트 + 부드러운 호버 효과
- **카드**: 섬세한 그림자 + 깔끔한 보더

자세한 내용은 [`src/app/globals.css`](src/app/globals.css)를 참고하세요.

---

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Canvas**: Fabric.js (명함 에디터)

### Backend & Database
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Storage**: Firebase Storage
- **API**: Next.js API Routes

### AI & 결제
- **AI Image Generation**: Google Gemini & Imagen 3
- **Payment**: PortOne (V2)
- **QR Code**: qrcode

### State Management
- **Global State**: Zustand
- **Form State**: React useState/useReducer

---

## 📝 환경 변수

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Google AI (선택)
GOOGLE_API_KEY=your-google-ai-key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3300
```

자세한 환경 변수 설정은 [DEPLOYMENT.md](DEPLOYMENT.md)를 참고하세요.

---

## 🚢 배포

### Vercel 배포 (추천)

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel --prod
```

자세한 배포 가이드는 [DEPLOYMENT.md](DEPLOYMENT.md)를 참고하세요.

---

## 🧪 테스트

```bash
# 유닛 테스트 실행
npm run test

# UI 모드로 테스트
npm run test:ui

# 테스트 한 번 실행
npm run test:run
```

---

## 📚 스크립트

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트
npm run lint

# 상품 데이터 시드
npm run seed
npm run seed:mock100

# 리뷰 데이터 시드
npm run seed:reviews
```

---

## 🎯 주요 페이지

### 홈페이지 (`/`)
- Hero 슬라이드
- Features 섹션
- 카테고리 그리드
- 인기 상품
- 고객 리뷰

### AI 이미지 생성 (`/create`)
- Google Gemini 프롬프트 입력
- 이미지 생성 및 다운로드
- 스타일 템플릿

### 명함 에디터 (`/editor/business-card`)
- Fabric.js 캔버스
- 앞면/뒷면 전환
- 텍스트/이미지/QR 코드 추가
- 템플릿 적용
- 300 DPI PNG 다운로드

### 상품 목록 (`/shop`)
- 필터링 & 검색
- 카테고리별 분류
- 정렬 옵션

### 마이페이지 (`/mypage`)
- 주문 내역
- AI 디자인 관리
- 프로필 설정

---

## 🤝 기여하기

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

---

## 🙏 감사의 말

- [Next.js](https://nextjs.org/)
- [Vercel](https://vercel.com/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Fabric.js](http://fabricjs.com/)
- [Google AI](https://ai.google.dev/)

---

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

**Built with ❤️ by GOODZZ Team**
