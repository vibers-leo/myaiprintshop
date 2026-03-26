// Gemini API 테스트 스크립트
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyDvq3fljgcF353C2b470yokNJW2fV0qHTA';

async function testGeminiAPI() {
  console.log('🔍 Gemini API 테스트 시작...\n');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log('📡 API 호출 중...');
    const result = await model.generateContent('안녕하세요! 간단한 테스트입니다. "OK"라고만 답변해주세요.');
    const response = result.response.text();

    console.log('\n✅ API 호출 성공!');
    console.log('📝 응답:', response);
    console.log('\n✨ Gemini API가 정상 작동합니다!');
    console.log('\n💰 무료 티어 정보:');
    console.log('  - Gemini 1.5 Flash: 분당 15 요청, 하루 1,500 요청');
    console.log('  - Gemini 1.5 Pro: 분당 2 요청, 하루 50 요청');
    console.log('  - 크레딧 카드 등록 불필요 ✅');
    console.log('  - 완전 무료 ✅');
  } catch (error) {
    console.error('\n❌ API 호출 실패!');
    console.error('에러:', error.message);

    if (error.message.includes('API_KEY_INVALID')) {
      console.error('\n🔑 API 키가 유효하지 않습니다.');
      console.error('https://aistudio.google.com/apikey 에서 새 키를 발급받으세요.');
    } else if (error.message.includes('quota')) {
      console.error('\n⚠️ 무료 할당량을 초과했습니다.');
      console.error('내일 다시 시도하거나 유료 플랜을 사용하세요.');
    }
  }
}

testGeminiAPI();
