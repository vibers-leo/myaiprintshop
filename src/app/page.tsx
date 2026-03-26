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
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center">
            가장 많이 찾는 굿즈
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="card card-hover overflow-hidden group flex flex-col"
              >
                <div className="h-48 bg-gray-200 relative flex flex-col justify-end p-4">
                  <div className="absolute inset-0 bg-gray-300 group-hover:bg-gray-400 transition-colors flex items-center justify-center">
                    {/* Placeholder for mockup image */}
                    <span className="text-gray-500 font-medium">실물 목업 이미지 ({cat.name})</span>
                  </div>
                </div>
                <div className="p-5 flex justify-between items-center bg-white z-10">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{cat.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{cat.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 사용 흐름 섹션 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-12">
            굿쯔 제작, 단 4단계면 충분해요
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: 1, title: '카테고리 선택', icon: LayoutGrid },
              { num: 2, title: 'AI가 디자인', icon: Palette },
              { num: 3, title: '수량 선택 & 결제', icon: CheckCircle },
              { num: 4, title: '배송 완료', icon: Package },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                {idx < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gray-200" />
                )}
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 border-4 border-white">
                  <step.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.num}. {step.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 왜 굿쯔? 섹션 */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-12 text-center">
            사장님들이 굿쯔를 선택하는 이유
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Palette, title: '디자이너 없이', desc: 'AI가 브랜드에 맞는\n디자인을 제안합니다' },
              { icon: Box, title: '소량 주문 OK', desc: '100장부터 가능,\n부담 없는 가격' },
              { icon: Clock, title: '빠른 배송', desc: '주문 후\n2~3일 내 도착' },
              { icon: LayoutGrid, title: '브랜드 일관성', desc: '로고/컬러 등록 시\n모든 굿즈에 자동 적용' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-2xl shadow-sm text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">
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
