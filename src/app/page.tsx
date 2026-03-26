import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import HomeClientContent from '@/components/HomeClientContent';
import ReviewsSection from '@/components/ReviewsSection';
import Link from 'next/link';
import { getLatestReviews } from '@/lib/reviews';
import { Palette, Box, Clock, LayoutGrid, CheckCircle, Package } from 'lucide-react';

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

// 카테고리 — 소상공인 특화
const categories = [
  { name: '명함', href: '/shop?category=business-card', image: '/images/mockup-business-card.jpg', desc: '100장 15,000원~' },
  { name: '스티커', href: '/shop?category=sticker', image: '/images/mockup-sticker.jpg', desc: '50장 10,000원~' },
  { name: '전단지/리플렛', href: '/shop?category=flyer', image: '/images/mockup-flyer.jpg', desc: '100장 20,000원~' },
];

async function getHomeProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3300';

  try {
    const [aiGoodsRes, bestRes] = await Promise.all([
      fetch(`${baseUrl}/api/products?type=new&limit=8`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/products?type=best&limit=8`, { cache: 'no-store' }),
    ]);

    const [aiGoodsData, bestData] = await Promise.all([
      aiGoodsRes.json(),
      bestRes.json(),
    ]);

    return {
      aiGoodsItems: aiGoodsData.success ? aiGoodsData.products : [],
      bestProducts: bestData.success ? bestData.products : [],
    };
  } catch (error) {
    console.error('Failed to fetch home products:', error);
    return {
      aiGoodsItems: [],
      bestProducts: [],
    };
  }
}

export default async function Home() {
  const { aiGoodsItems, bestProducts } = await getHomeProducts();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />

      {/* 카테고리 섹션 */}
      <section className="py-24 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              가장 많이 찾는 굿즈
            </h2>
            <p className="text-gray-500 text-lg font-medium">사장님들이 가장 선호하는 베스트셀러입니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group flex flex-col items-center"
              >
                <div className="w-full aspect-[4/3] bg-white rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden mb-6 group-hover:shadow-md group-hover:border-primary-200 transition-all duration-300">
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 group-hover:bg-primary-50/30 transition-colors">
                    <span className="text-gray-400 font-bold text-lg">목업 이미지 ({cat.name})</span>
                  </div>
                </div>
                <h3 className="font-extrabold text-2xl text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{cat.name}</h3>
                <p className="text-gray-500 text-base font-medium">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 사용 흐름 섹션 */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-16 tracking-tight">
            사진 한 장으로 끝나는 4단계
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: 1, title: '상품 선택', icon: LayoutGrid },
              { num: 2, title: '사진 업로드', icon: Palette },
              { num: 3, title: '자동 AI 핏', icon: CheckCircle },
              { num: 4, title: '글로벌 배송', icon: Package },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                {idx < 3 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gray-100" />
                )}
                <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 border border-primary-100">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-gray-900 mb-2 text-xl">{step.num}. {step.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 왜 GOODZZ? 섹션 */}
      <section className="py-24 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-16 text-center text-gray-900 tracking-tight">
            왜 다들 <span className="text-primary-600">GOODZZ.KR</span>을 찾을까요?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Palette, title: '복잡한 툴 제로', desc: '포토샵 몰라도 OK.\n사진 한 장이면 끝납니다' },
              { icon: LayoutGrid, title: '완벽한 핏 (Fit)', desc: 'AI가 업로드한 사진을\n상품 틀에 맞춰 자동 조정' },
              { icon: Box, title: '단 1개도 제작', desc: '재고 부담 없이\n하나뿐인 굿즈도 만들어드려요' },
              { icon: Clock, title: '전 세계 글로벌 배송', desc: '국내외 어디서 주문하든\n안전하고 빠르게 배송' },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <div key={title} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center transform transition-transform hover:-translate-y-1 hover:shadow-md">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-extrabold text-xl text-gray-900 mb-3">{title}</h3>
                <p className="text-base text-gray-500 font-medium leading-relaxed">
                  {desc.split('\n').map((line, i) => (
                    <span key={i}>{line}{i === 0 && <br />}</span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 제품 섹션 */}
      <HomeClientContent
        aiGoodsItems={aiGoodsItems}
        bestProducts={bestProducts}
      />

      {/* 리뷰 섹션 (하나만) */}
      <ReviewsSection />

      <Footer />
    </main>
  );
}
