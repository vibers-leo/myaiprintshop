# GOODZZ 버그 수정 목록 (2026-03-28 감사 결과)

## CRITICAL
- [x] **mypage 인증 가드 추가** — `src/app/mypage/layout.tsx`에서 `user`가 null일 때 `/login`으로 리다이렉트 필요. 현재는 미로그인 시 null 데이터로 페이지 렌더링됨.

## HIGH
- [x] **어드민 브랜딩 수정** — `src/app/admin/page.tsx` 353행 "MY AI PRINT SHOP" → "GOODZZ"로 변경
- [x] **로그인 약관 링크 연결** — 로그인 페이지의 "이용약관 및 개인정보처리방침에 동의" 텍스트를 `/terms`, `/privacy` 링크로 변경

## MEDIUM
- [x] **푸터 소셜 링크** — Instagram/YouTube 링크 실제 계정 URL로 변경 완료.
- [x] **mypage 사이드바** — vendor/dashboard 및 스튜디오 사이드바 메뉴 추가 완료.

## LOW
- [x] `/academy`, `/showcase` 페이지가 네비에서 접근 불가
- [x] `/developers` 페이지가 네비에서 접근 불가
