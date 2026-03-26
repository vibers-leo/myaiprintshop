#!/bin/bash
# goodzz 프로젝트 초기 커밋 스크립트
set -e
cd "$(dirname "$0")"

echo "🔧 lock 파일 제거..."
rm -f .git/index.lock

echo "📦 리브랜딩 커밋..."
git add -A
git commit -m "feat: MyAIPrintShop → GOODZZ(굿쯔) 전체 리브랜딩

소상공인/브랜드 굿즈 제작 플랫폼으로 방향 전환:
- 브랜드명: GOODZZ(굿쯔), 도메인: goodzz.co.kr
- 패키지: @vibers/goodzz
- 50+ 파일 네이밍 변경 완료
- 브랜드 전략서: data/GOODZZ_BRAND_STRATEGY.md

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

echo "🎉 완료!"
git log -1 --oneline
