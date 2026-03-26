# GOODZZ 디자인 시스템

> Stripe + Aceternity UI 스타일 기반. Tailwind CSS v4 + CSS 커스텀 속성으로 관리.
> 소스: `src/app/globals.css`

---

## 색상 시스템

### 라이트 모드 기본 색상

| 역할 | 변수 | 값 | 용도 |
|------|------|-----|------|
| 배경 (기본) | `--background` | `#ffffff` | 페이지 배경 |
| 배경 (보조) | `--background-secondary` | `#fafbfc` | 섹션/에디터 캔버스 영역 |
| 표면 | `--surface` | `#ffffff` | 카드, 모달 |
| 표면 (강조) | `--surface-elevated` | `#ffffff` | 떠있는 표면 |
| 텍스트 (기본) | `--foreground` | `#0a2540` | 주요 텍스트, 헤딩 |
| 텍스트 (보조) | `--foreground-secondary` | `#425466` | 본문 텍스트 |
| 텍스트 (뮤트) | `--foreground-muted` | `#6b7c93` | 보조 설명, 플레이스홀더 |

### 브랜드 컬러 (Primary — 퍼플)

| 단계 | 변수 | 값 | 용도 |
|------|------|-----|------|
| 50 | `--primary-50` | `#f5f3ff` | 호버 배경 |
| 100 | `--primary-100` | `#ede9fe` | 드래그 영역 활성 |
| 200 | `--primary-200` | `#ddd6fe` | 텍스트 선택 배경 |
| 300 | `--primary-300` | `#c4b5fd` | — |
| 400 | `--primary-400` | `#a78bfa` | — |
| 500 | `--primary-500` | `#8b5cf6` | 포커스 보더 |
| 600 | `--primary-600` | `#7c3aed` | **기본 Primary** (버튼, 링크) |
| 700 | `--primary-700` | `#6d28d9` | 호버 상태 |
| 800 | `--primary-800` | `#5b21b6` | 액티브 상태 |
| 900 | `--primary-900` | `#4c1d95` | 텍스트 선택 컬러 |

### 액센트 컬러 (블루)

| 단계 | 변수 | 값 | 용도 |
|------|------|-----|------|
| 500 | `--accent-500` | `#3b82f6` | 그라디언트 끝점 |
| 600 | `--accent-600` | `#2563eb` | **기본 Accent** |
| 700 | `--accent-700` | `#1d4ed8` | — |

### 시맨틱 컬러

| 역할 | 변수 | 값 | 용도 |
|------|------|-----|------|
| 성공 | `--success` | `#00d4aa` | 완료, 성공 버튼 |
| 경고 | `--warning` | `#ff6b35` | 주의 표시 |
| 에러 | `--error` | `#f43f5e` | 오류, 삭제 |
| 정보 | `--info` | `#0ea5e9` | 안내 |

### 뉴트럴 (Gray)

| 단계 | 변수 | 값 | 용도 |
|------|------|-----|------|
| 50 | `--gray-50` | `#fafbfc` | 토글/탭 배경 |
| 100 | `--gray-100` | `#f6f9fc` | — |
| 200 | `--gray-200` | `#e3e8ef` | 스크롤바, 슬라이더 트랙 |
| 300 | `--gray-300` | `#cbd5e1` | 보더 강조 |
| 400 | `--gray-400` | `#94a3b8` | 플레이스홀더 |
| 500 | `--gray-500` | `#64748b` | — |
| 600 | `--gray-600` | `#475569` | 토글 비활성 텍스트 |
| 700 | `--gray-700` | `#334155` | — |
| 800 | `--gray-800` | `#1e293b` | — |
| 900 | `--gray-900` | `#0f172a` | — |

### 보더

| 역할 | 변수 | 값 |
|------|------|-----|
| 기본 | `--border` | `#e3e8ef` |
| 연한 | `--border-light` | `#f1f5f9` |
| 강한 | `--border-strong` | `#cbd5e1` |

### 다크 모드 (prefers-color-scheme: dark)

| 변수 | 값 |
|------|-----|
| `--background` | `#0a0a0a` |
| `--background-secondary` | `#121212` |
| `--surface` | `#18181b` |
| `--surface-elevated` | `#1e1e1e` |
| `--foreground` | `#fafafa` |
| `--foreground-secondary` | `#d4d4d8` |
| `--foreground-muted` | `#a1a1aa` |
| `--border` | `#27272a` |
| `--border-light` | `#1e1e1e` |
| `--border-strong` | `#3f3f46` |

---

## 타이포그래피

### 폰트 패밀리

| 역할 | 변수 | 값 |
|------|------|-----|
| 본문 | `--font-sans` | `'Inter', 'Pretendard', -apple-system, system-ui, sans-serif` |
| 디스플레이 | `--font-display` | `'Inter', 'Pretendard', system-ui, sans-serif` |
| 코드 | `--font-mono` | `'SF Mono', 'Fira Code', Consolas, monospace` |

로컬 폰트 (layout.tsx):
- **Geist Sans**: `--font-geist-sans` (400, 500, 600, 700)
- **Geist Mono**: `--font-geist-mono` (400, 500)
- **Pretendard**: CDN 동적 서브셋 (한글)

Google Fonts (globals.css):
- Inter, Noto Sans KR, Nanum Gothic, Nanum Myeongjo, Black Han Sans, Jua, Do Hyeon, Noto Serif KR, Gowun Batang, Poor Story, Single Day

### 제목 계층

#### H1 — 페이지 메인 제목
```css
font-size: 3.75rem;        /* 60px */
font-weight: 800;          /* extrabold */
letter-spacing: -0.04em;
line-height: 1.25;
font-family: var(--font-display);
```

#### H2 — 섹션 제목
```css
font-size: 3rem;           /* 48px */
font-weight: 700;          /* bold */
letter-spacing: -0.035em;
line-height: 1.25;
```

#### H3 — 서브 섹션
```css
font-size: 2.25rem;        /* 36px */
font-weight: 700;
letter-spacing: -0.03em;
```

#### H4 — 카드 제목
```css
font-size: 1.875rem;       /* 30px */
font-weight: 700;
```

#### H5
```css
font-size: 1.5rem;         /* 24px */
font-weight: 700;
```

#### H6
```css
font-size: 1.25rem;        /* 20px */
font-weight: 700;
```

### 본문

```css
p {
  line-height: 1.625;       /* --leading-relaxed */
  color: var(--foreground-secondary);  /* #425466 */
}
```

### 폰트 웨이트 스케일

| 변수 | 값 | 용도 |
|------|-----|------|
| `--font-light` | 300 | 서브텍스트 |
| `--font-normal` | 400 | 본문 기본 |
| `--font-medium` | 500 | 라벨, 버튼 |
| `--font-semibold` | 600 | 강조 |
| `--font-bold` | 700 | 헤딩 기본 |
| `--font-extrabold` | 800 | H1 |

---

## 간격 시스템

### 스페이싱 스케일

| 변수 | 값 | px | 용도 |
|------|-----|-----|------|
| `--space-xs` | 0.25rem | 4px | 아이콘 간격 |
| `--space-sm` | 0.5rem | 8px | 인라인 요소 |
| `--space-md` | 1rem | 16px | 기본 간격 |
| `--space-lg` | 1.5rem | 24px | 카드 내부 |
| `--space-xl` | 2rem | 32px | 섹션 내 요소 간 |
| `--space-2xl` | 3rem | 48px | 제목-내용 간격 |
| `--space-3xl` | 4rem | 64px | 섹션 간 여백 |
| `--space-4xl` | 6rem | 96px | 대형 섹션 간 |

---

## 보더 라디우스

| 변수 | 값 | 용도 |
|------|-----|------|
| `--radius-sm` | 6px | 토글 버튼, 탭 |
| `--radius-md` | 8px | 입력 필드, 버튼, 컬러 스와치 |
| `--radius-lg` | 12px | 캔버스 컨테이너 |
| `--radius-xl` | 16px | 카드 |
| `--radius-2xl` | 24px | 대형 카드 |
| `--radius-full` | 9999px | 스크롤바, 알약 형태 |

---

## 그림자 시스템

| 변수 | 용도 |
|------|------|
| `--shadow-xs` | 토글 활성, 탭 활성 |
| `--shadow-sm` | 버튼 기본, 입력 포커스 |
| `--shadow-md` | 컬러 스와치 호버, 슬라이더 |
| `--shadow-lg` | 버튼 호버, 드래그 활성 |
| `--shadow-xl` | 카드 호버 |
| `--shadow-2xl` | 캔버스 컨테이너 (`0 25px 50px -12px rgba(0,0,0,0.15)`) |

---

## 트랜지션

| 변수 | 값 | 용도 |
|------|-----|------|
| `--transition-fast` | 150ms ease-out | 입력 포커스, 토글 |
| `--transition-base` | 250ms ease-out | 버튼, 카드 호버 |
| `--transition-slow` | 350ms ease-out | 패널 전환 |
| `--transition-bounce` | 500ms bounce | 특수 효과 |

---

## 컴포넌트 패턴

### 버튼

```tsx
{/* Primary — 퍼플 그라디언트 */}
<button className="btn btn-primary">확인</button>

{/* Secondary — 보더 스타일 */}
<button className="btn btn-secondary">취소</button>

{/* Success — 틸 */}
<button className="btn btn-success">완료</button>

{/* 크기 */}
<button className="btn btn-primary btn-sm">작은 버튼</button>
<button className="btn btn-primary btn-lg">큰 버튼</button>
```

### 카드

```tsx
{/* 기본 카드 */}
<div className="card p-6">{/* 내용 */}</div>

{/* 호버 효과 카드 (translateY -2px + shadow-xl) */}
<div className="card card-hover p-6">{/* 내용 */}</div>

{/* 스포트라이트 카드 (마우스 추적 그라디언트) */}
<div className="card spotlight-card p-6">{/* 내용 */}</div>
```

### 입력 필드

```tsx
<label className="input-label">라벨</label>
<input className="input-field" placeholder="입력하세요" />
```

### 그라디언트 텍스트

```tsx
{/* Primary → Accent 그라디언트 */}
<span className="text-gradient">AI 프린트샵</span>

{/* 퍼플 그라디언트 */}
<span className="text-gradient-purple">크리에이터</span>
```

### 글래스 효과

```tsx
<div className="glass-effect rounded-xl p-6">
  {/* 반투명 블러 배경 */}
</div>
```

### 드롭존

```tsx
<div className="dropzone">
  <p>이미지를 드래그하세요</p>
</div>
```

---

## 에디터 레이아웃

| 영역 | 클래스 | 규격 |
|------|--------|------|
| 헤더 | `.editor-header` | 높이 64px, 블러 배경, z-50 |
| 사이드바 | `.editor-sidebar` | 너비 20rem (최대 24rem), 스크롤 가능 |
| 캔버스 영역 | `.editor-canvas-area` | flex-1, 보조 배경색 |
| 캔버스 컨테이너 | `.canvas-container` | shadow-2xl, radius-lg |

---

## 애니메이션 클래스

| 클래스 | 효과 | 지속시간 |
|--------|------|----------|
| `.animate-fadeInUp` | 아래→위 페이드인 (24px) | 0.6s |
| `.animate-fadeIn` | 페이드인 | 0.5s |
| `.animate-slideInRight` | 오른쪽→왼쪽 슬라이드 (32px) | 0.5s |
| `.animate-shimmer` | 로딩 쉬머 | 2s 무한반복 |
| `.animate-float` | 위아래 떠다님 (8px) | 3s 무한반복 |

---

## 반응형 브레이크포인트

```css
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

---

## 체크리스트

모든 새 페이지/컴포넌트 작성 시 확인:

- [ ] 색상: CSS 변수 사용 (`var(--primary-600)` 등), 하드코딩 금지
- [ ] 타이포: 헤딩에 `font-family: var(--font-display)` + `letter-spacing: -0.025em`
- [ ] 버튼: `.btn` + `.btn-primary`/`.btn-secondary` 클래스 사용
- [ ] 카드: `.card` 클래스 사용 (radius-xl + border)
- [ ] 입력: `.input-field` + `.input-label` 클래스 사용
- [ ] 간격: `--space-*` 변수 또는 Tailwind 유틸리티
- [ ] 그림자: `--shadow-*` 변수 사용
- [ ] 트랜지션: `--transition-base` 기본 적용
- [ ] 다크모드: `prefers-color-scheme: dark` 자동 대응 확인
