/**
 * WowPress API 연결 테스트 스크립트
 *
 * 실행 방법:
 * ```bash
 * npx tsx scripts/test-wowpress-api.ts
 * ```
 *
 * 환경 변수 필요:
 * - WOWPRESS_API_KEY: WowPress API 키
 */

import 'dotenv/config';

const WOWPRESS_API_BASE = process.env.WOWPRESS_API_BASE || 'https://api.wowpress.co.kr/api/v1/std';
const WOWPRESS_API_KEY = process.env.WOWPRESS_API_KEY;

async function testWowPressAPI() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 WowPress API 연결 테스트');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. 환경 변수 확인
  console.log('1️⃣ 환경 변수 확인...');
  console.log(`   Base URL: ${WOWPRESS_API_BASE}`);
  console.log(`   API Key: ${WOWPRESS_API_KEY ? '✅ 설정됨 (' + WOWPRESS_API_KEY.substring(0, 10) + '...)' : '❌ 미설정'}\n`);

  if (!WOWPRESS_API_KEY) {
    console.error('❌ 오류: WOWPRESS_API_KEY 환경 변수가 설정되지 않았습니다.');
    console.log('\n해결 방법:');
    console.log('1. .env.local 파일에 다음 내용 추가:');
    console.log('   WOWPRESS_API_KEY=your_api_key_here');
    console.log('2. 스크립트 재실행\n');
    process.exit(1);
  }

  // 2. API 인증 테스트 (로그인 엔드포인트)
  console.log('2️⃣ API 인증 테스트...');
  try {
    const loginUrl = WOWPRESS_API_BASE.replace('/api/v1/std', '/api/login/issue');
    console.log(`   URL: ${loginUrl}`);

    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: WOWPRESS_API_KEY,
      }),
    });

    console.log(`   상태 코드: ${loginResponse.status} ${loginResponse.statusText}`);

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('   ✅ 인증 성공!');
      console.log(`   토큰: ${loginData.token ? loginData.token.substring(0, 20) + '...' : 'N/A'}\n`);
    } else {
      const errorText = await loginResponse.text();
      console.log(`   ❌ 인증 실패: ${errorText}\n`);
      console.log('   참고: WowPress API 키가 유효한지 확인하세요.\n');
    }
  } catch (error) {
    console.error(`   ❌ 네트워크 오류:`, error);
    console.log('   참고: WowPress API 서버에 접근할 수 없습니다.\n');
  }

  // 3. 상품 목록 조회 테스트
  console.log('3️⃣ 상품 목록 조회 테스트...');
  try {
    const prodlistUrl = `${WOWPRESS_API_BASE}/prodlist`;
    console.log(`   URL: ${prodlistUrl}`);

    const prodlistResponse = await fetch(prodlistUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WOWPRESS_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   상태 코드: ${prodlistResponse.status} ${prodlistResponse.statusText}`);

    if (prodlistResponse.ok) {
      const prodlistData = await prodlistResponse.json();
      console.log('   ✅ 상품 목록 조회 성공!');
      console.log(`   상품 개수: ${prodlistData.products?.length || 0}개`);

      if (prodlistData.products && prodlistData.products.length > 0) {
        console.log('\n   처음 3개 상품:');
        prodlistData.products.slice(0, 3).forEach((product: any, index: number) => {
          console.log(`   ${index + 1}. ${product.prodname || product.name} (${product.prodno || product.id})`);
        });
      }
      console.log();
    } else {
      const errorText = await prodlistResponse.text();
      console.log(`   ⚠️  상품 목록 조회 실패: ${errorText}`);
      console.log('   참고: API 키 권한 또는 엔드포인트를 확인하세요.\n');
    }
  } catch (error) {
    console.error(`   ❌ 네트워크 오류:`, error);
    console.log();
  }

  // 4. 특정 상품 조회 테스트
  console.log('4️⃣ 특정 상품 조회 테스트...');
  const testProdno = 'WOW001'; // 실제 상품 번호로 변경 필요
  try {
    const productUrl = `${WOWPRESS_API_BASE}/prod_info/${testProdno}`;
    console.log(`   URL: ${productUrl}`);
    console.log(`   상품 번호: ${testProdno}`);

    const productResponse = await fetch(productUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WOWPRESS_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   상태 코드: ${productResponse.status} ${productResponse.statusText}`);

    if (productResponse.ok) {
      const productData = await productResponse.json();
      console.log('   ✅ 상품 조회 성공!');
      console.log(`   상품명: ${productData.prodname || productData.name}`);
      console.log(`   카테고리: ${productData.category || 'N/A'}`);
      console.log(`   기본 가격: ${productData.basePrice?.toLocaleString() || 'N/A'}원`);
      console.log();
    } else {
      const errorText = await productResponse.text();
      console.log(`   ⚠️  상품 조회 실패: ${errorText}`);
      console.log(`   참고: 상품 번호 '${testProdno}'가 존재하지 않을 수 있습니다.`);
      console.log('   실제 상품 번호로 테스트하려면 스크립트를 수정하세요.\n');
    }
  } catch (error) {
    console.error(`   ❌ 네트워크 오류:`, error);
    console.log();
  }

  // 5. 요약
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 테스트 완료');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📝 다음 단계:');
  console.log('1. .env.local 파일에 WOWPRESS_API_KEY 설정');
  console.log('2. Firestore에 VENDOR_WOWPRESS 벤더 등록');
  console.log('   (scripts/setup-wowpress.md 참고)');
  console.log('3. 개발 서버 시작: npm run dev');
  console.log('4. 상품 동기화 API 호출 테스트');
  console.log('5. 테스트 주문 생성 및 WowPress 전달 확인\n');
}

// 스크립트 실행
testWowPressAPI().catch((error) => {
  console.error('\n❌ 테스트 실패:', error);
  process.exit(1);
});
