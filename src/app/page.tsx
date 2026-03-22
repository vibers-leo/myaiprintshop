import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import HomeClientContent from '@/components/HomeClientContent';
import ReviewsSection from '@/components/ReviewsSection';
import GoodsRecommendationSearch from '@/components/GoodsRecommendationSearch';
import Link from 'next/link';
import { getLatestReviews } from '@/lib/reviews';
import { Sparkles, Zap, Shield, Truck } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  category: string;
  badge?: string;
  reviewCount: number;
  rating: number;
}

// 카테고리
const categories = [
  { name: '인쇄', href: '/shop?category=print', icon: '🖨️' },
  { name: '굿즈/팬시', href: '/shop?category=goods', icon: '✨' },
  { name: '패션/어패럴', href: '/shop?category=fashion', icon: '👕' },
  { name: '우리가게', href: '/shop?category=store', icon: '🏪' },
  { name: '주문제작', href: '/shop?category=custom', icon: '🎨' },
  { name: 'AI 레시피', href: '/shop?category=recipe', icon: '📚' },
];

// 하드코딩 리뷰 (DB에 리뷰가 없을 때 폴백)
const FALLBACK_REVIEWS = [
  {
    name: '김*현',
    product: '에코백',
    rating: 5,
    content: 'AI로 만든 디자인이 너무 예뻐요! 주변에서 어디서 샀냐고 물어봐요 ㅎㅎ',
    date: '2026.01.05'
  },
  {
    name: '이*진',
    product: '반팔 티셔츠',
    rating: 5,
    content: '프린팅 퀄리티가 생각보다 훨씬 좋아서 놀랐어요. 재주문할게요!',
    date: '2026.01.03'
  },
  {
    name: '박*수',
    product: '캔버스 액자',
    rating: 5,
    content: '거실에 걸어놨는데 분위기가 확 바뀌었어요. AI가 그린 그림이라고 하니까 다들 신기해해요.',
    date: '2025.12.28'
  },
];

// Firestore 리뷰를 HomeClientContent가 기대하는 형식으로 변환
function formatReviewForDisplay(review: { userName: string; rating: number; content: string; createdAt: string }) {
  const date = new Date(review.createdAt);
  return {
    name: review.userName,
    product: '', // Firestore 리뷰에는 productName이 없으므로 빈 문자열
    rating: review.rating,
    content: review.content,
    date: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`,
  };
}

async function getHomeReviews() {
  try {
    const dbReviews = await getLatestReviews(6);
    if (dbReviews.length > 0) {
      return dbReviews.map(formatReviewForDisplay);
    }
  } catch (error) {
    console.error('Failed to fetch reviews from Firestore:', error);
  }
  // DB에 리뷰가 없거나 오류 시 하드코딩 폴백
  return FALLBACK_REVIEWS;
}

async function getHomeProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3300';

  try {
    // 3개의 API 요청 병렬 처리
    const [aiGoodsRes, bestRes, allRes] = await Promise.all([
      fetch(`${baseUrl}/api/products?type=new&limit=8`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/products?type=best&limit=6`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/products?limit=6`, { cache: 'no-store' }),
    ]);

    const [aiGoodsData, bestData, allData] = await Promise.all([
      aiGoodsRes.json(),
      bestRes.json(),
      allRes.json(),
    ]);

    return {
      aiGoodsItems: aiGoodsData.success ? aiGoodsData.products : [],
      bestProducts: bestData.success ? bestData.products : [],
      allProducts: allData.success ? allData.products : [],
    };
  } catch (error) {
    console.error('Failed to fetch home products:', error);
    return {
      aiGoodsItems: [],
      bestProducts: [],
      allProducts: [],
    };
  }
}

export default async function Home() {
  const [{ aiGoodsItems, bestProducts, allProducts }, reviews] = await Promise.all([
    getHomeProducts(),
    getHomeReviews(),
  ]);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />

      {/* AI 굿즈 추천 검색 */}
      <GoodsRecommendationSearch />

      {/* Features Section - Stripe 스타일 */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI 디자인</h3>
              <p className="text-sm text-gray-600">
                몇 초만에 프로페셔널한<br />디자인 완성
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">프리미엄 품질</h3>
              <p className="text-sm text-gray-600">
                최고급 소재와<br />정교한 프린팅
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">빠른 배송</h3>
              <p className="text-sm text-gray-600">
                24시간 이내 제작,<br />빠른 배송
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">환불 보장</h3>
              <p className="text-sm text-gray-600">
                100% 만족 보장,<br />무료 환불
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Section - 미니멀하게 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            카테고리
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="card card-hover p-6 text-center group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 제품 섹션 */}
      <HomeClientContent
        aiGoodsItems={aiGoodsItems}
        bestProducts={bestProducts}
        allProducts={allProducts}
        reviews={reviews}
      />

      {/* 리뷰 섹션 */}
      <ReviewsSection />

      <Footer />
    </main>
  );
}
