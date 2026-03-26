/**
 * SDK Build Script
 *
 * TypeScript SDK를 작은 JavaScript 번들로 빌드합니다.
 *
 * 목표:
 * - 번들 크기: 20KB 이하 (gzipped)
 * - 외부 의존성 없음 (순수 Vanilla JS)
 * - ES2020 타겟 (모던 브라우저 지원)
 *
 * 사용법:
 * ```bash
 * npm run build:sdk
 * ```
 */

import { build } from 'esbuild';
import { gzipSync } from 'zlib';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

async function buildSDK() {
  const startTime = Date.now();

  console.log('🚀 Building GOODZZ Buy Button SDK...\n');

  try {
    // 1. TypeScript → JavaScript 번들 생성
    await build({
      entryPoints: ['src/sdk/buy-button/index.ts'],
      bundle: true,
      minify: true,
      sourcemap: true,
      target: 'es2020',
      outfile: 'public/sdk/buy-button.min.js',
      format: 'iife',
      globalName: 'GoodzzSDKInit',
      external: [], // 외부 의존성 없음
      treeShaking: true,
      legalComments: 'none',
      logLevel: 'info',
    });

    console.log('✅ Bundle created: public/sdk/buy-button.min.js');

    // 2. 번들 크기 확인
    const bundlePath = resolve('public/sdk/buy-button.min.js');
    const bundleContent = readFileSync(bundlePath);
    const bundleSize = bundleContent.length;
    const bundleSizeKB = (bundleSize / 1024).toFixed(2);

    // 3. Gzip 압축 크기 확인
    const gzipped = gzipSync(bundleContent);
    const gzippedSize = gzipped.length;
    const gzippedSizeKB = (gzippedSize / 1024).toFixed(2);

    console.log(`\n📊 Bundle Size:`);
    console.log(`   - Minified: ${bundleSizeKB} KB`);
    console.log(`   - Gzipped:  ${gzippedSizeKB} KB`);

    // 4. 목표 크기 체크 (20KB)
    const targetSizeKB = 20;
    if (gzippedSize > targetSizeKB * 1024) {
      console.warn(
        `\n⚠️  Warning: Gzipped size (${gzippedSizeKB} KB) exceeds target (${targetSizeKB} KB)`
      );
    } else {
      console.log(`\n✅ Size check passed! (Target: ${targetSizeKB} KB)`);
    }

    // 5. 빌드 시간
    const buildTime = Date.now() - startTime;
    console.log(`\n⏱️  Build time: ${buildTime}ms`);

    console.log('\n✨ SDK build completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Build failed:', error);
    process.exit(1);
  }
}

// 스크립트 실행
buildSDK();
