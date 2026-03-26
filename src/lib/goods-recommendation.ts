/**
 * 굿즈 추천 엔진
 *
 * AI 분석 결과를 기반으로 어울리는 굿즈를 추천합니다.
 */

export interface AnalysisResult {
  brandColors: string[];
  keywords: string[];
  logoUrl: string | null;
  targetAudience: string;
  theme: string;
}

export interface GoodsRecommendation {
  id: string;
  name: string;
  productType: string; // 'tshirt' | 'hoodie' | 'mug' | 'tumbler' | 'sticker' | 'keyring' | 'bag' | 'notebook'
  category: string;
  basePrice: number;
  score: number; // 0-100 (추천 우선순위)
  reason: string; // 추천 이유
  previewTemplate: string; // 템플릿 ID
}

/**
 * 분석 결과를 기반으로 굿즈 추천
 */
export function recommendGoods(analysis: AnalysisResult): GoodsRecommendation[] {
  const recommendations: GoodsRecommendation[] = [];

  // 1. 타겟 고객층 기반 추천
  if (
    analysis.targetAudience.includes('MZ') ||
    analysis.targetAudience.includes('학생') ||
    analysis.targetAudience.includes('젊은')
  ) {
    recommendations.push({
      id: 'tshirt-oversized',
      name: '오버핏 반팔 티셔츠',
      productType: 'tshirt',
      category: '의류',
      basePrice: 25000,
      score: 95,
      reason: 'MZ세대가 선호하는 오버핏 스타일',
      previewTemplate: 'tshirt-white',
    });

    recommendations.push({
      id: 'sticker-diecut',
      name: '다이컷 스티커 (10장)',
      productType: 'sticker',
      category: '문구/잡화',
      basePrice: 8000,
      score: 90,
      reason: '젊은 층에게 인기 있는 굿즈',
      previewTemplate: 'sticker-square',
    });

    recommendations.push({
      id: 'eco-bag',
      name: '에코백',
      productType: 'bag',
      category: '생활용품',
      basePrice: 15000,
      score: 85,
      reason: '캠퍼스/일상에서 활용도 높음',
      previewTemplate: 'bag-tote',
    });
  }

  if (
    analysis.targetAudience.includes('기업') ||
    analysis.targetAudience.includes('B2B') ||
    analysis.targetAudience.includes('직장')
  ) {
    recommendations.push({
      id: 'mug-ceramic',
      name: '세라믹 머그컵',
      productType: 'mug',
      category: '생활용품',
      basePrice: 18000,
      score: 95,
      reason: '사무실 환경에 적합한 실용 굿즈',
      previewTemplate: 'mug-white',
    });

    recommendations.push({
      id: 'tumbler-steel',
      name: '스테인리스 텀블러',
      productType: 'tumbler',
      category: '생활용품',
      basePrice: 28000,
      score: 88,
      reason: '고급스러운 기업 선물용',
      previewTemplate: 'tumbler-steel',
    });

    recommendations.push({
      id: 'notebook-hardcover',
      name: '하드커버 노트',
      productType: 'notebook',
      category: '문구/잡화',
      basePrice: 12000,
      score: 82,
      reason: '업무용 필수 아이템',
      previewTemplate: 'notebook-a5',
    });
  }

  // 2. 테마 기반 추천
  if (
    analysis.theme === 'cute' ||
    analysis.theme === 'kawaii' ||
    analysis.keywords.some(k => ['귀여운', 'cute', 'kawaii', 'character'].includes(k.toLowerCase()))
  ) {
    recommendations.push({
      id: 'keyring-acrylic',
      name: '아크릴 키링',
      productType: 'keyring',
      category: '액세서리',
      basePrice: 6000,
      score: 85,
      reason: '귀여운 캐릭터에 적합',
      previewTemplate: 'keyring-round',
    });
  }

  if (
    analysis.theme === 'minimalist' ||
    analysis.theme === 'modern' ||
    analysis.keywords.some(k => ['simple', 'minimal', '심플', '모던'].includes(k.toLowerCase()))
  ) {
    recommendations.push({
      id: 'tshirt-basic',
      name: '베이직 티셔츠',
      productType: 'tshirt',
      category: '의류',
      basePrice: 22000,
      score: 90,
      reason: '미니멀한 디자인에 최적',
      previewTemplate: 'tshirt-white',
    });
  }

  // 3. 키워드 기반 추천
  const hasArtKeyword = analysis.keywords.some(k =>
    ['art', 'design', 'illustration', 'artwork', '아트', '그림', '디자인'].includes(k.toLowerCase())
  );

  if (hasArtKeyword) {
    recommendations.push({
      id: 'poster-canvas',
      name: '캔버스 포스터',
      productType: 'poster',
      category: '인테리어',
      basePrice: 35000,
      score: 92,
      reason: '아트워크 전시에 최적',
      previewTemplate: 'poster-a3',
    });
  }

  const hasCoffeeKeyword = analysis.keywords.some(k =>
    ['coffee', 'cafe', 'tea', '커피', '카페', '음료'].includes(k.toLowerCase())
  );

  if (hasCoffeeKeyword) {
    recommendations.push({
      id: 'mug-large',
      name: '라지 머그컵',
      productType: 'mug',
      category: '생활용품',
      basePrice: 20000,
      score: 94,
      reason: '카페 분위기에 어울리는 머그',
      previewTemplate: 'mug-white',
    });
  }

  // 4. 기본 추천 (타겟/테마가 불명확한 경우)
  if (recommendations.length === 0) {
    recommendations.push(
      {
        id: 'tshirt-basic',
        name: '베이직 티셔츠',
        productType: 'tshirt',
        category: '의류',
        basePrice: 22000,
        score: 85,
        reason: '가장 인기 있는 기본 굿즈',
        previewTemplate: 'tshirt-white',
      },
      {
        id: 'mug-ceramic',
        name: '세라믹 머그컵',
        productType: 'mug',
        category: '생활용품',
        basePrice: 18000,
        score: 80,
        reason: '실용적인 일상 아이템',
        previewTemplate: 'mug-white',
      },
      {
        id: 'sticker-square',
        name: '스퀘어 스티커 (10장)',
        productType: 'sticker',
        category: '문구/잡화',
        basePrice: 8000,
        score: 75,
        reason: '저렴하고 활용도 높은 굿즈',
        previewTemplate: 'sticker-square',
      }
    );
  }

  // 중복 제거 (같은 productType)
  const uniqueRecommendations = removeDuplicatesByType(recommendations);

  // 점수 순 정렬 후 상위 6개
  return uniqueRecommendations.sort((a, b) => b.score - a.score).slice(0, 6);
}

/**
 * 같은 productType 중복 제거 (점수가 높은 것만 남김)
 */
function removeDuplicatesByType(recommendations: GoodsRecommendation[]): GoodsRecommendation[] {
  const typeMap = new Map<string, GoodsRecommendation>();

  for (const rec of recommendations) {
    const existing = typeMap.get(rec.productType);
    if (!existing || rec.score > existing.score) {
      typeMap.set(rec.productType, rec);
    }
  }

  return Array.from(typeMap.values());
}

/**
 * 굿즈 카테고리 목록 (참고용)
 */
export const GOODS_CATEGORIES = {
  apparel: {
    name: '의류',
    items: ['tshirt', 'hoodie', 'sweatshirt', 'longsleeve'],
  },
  lifestyle: {
    name: '생활용품',
    items: ['mug', 'tumbler', 'waterbottle', 'bag'],
  },
  stationery: {
    name: '문구/잡화',
    items: ['sticker', 'notebook', 'postcard', 'bookmark'],
  },
  accessories: {
    name: '액세서리',
    items: ['keyring', 'badge', 'phonecase', 'airpodcase'],
  },
  interior: {
    name: '인테리어',
    items: ['poster', 'canvas', 'cushion', 'tapestry'],
  },
};
