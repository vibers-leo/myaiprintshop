
import React from 'react';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { getAllCategories, getCategoryBySlug } from '@/lib/categories';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams.category as string | undefined;
  const query = resolvedSearchParams.q as string | undefined;

  const currentCategory = category ? getCategoryBySlug(category) : null;

  let title = "상품 전체보기";
  let description = "사장님을 위한 맞춤형 브랜드 굿즈. 명함, 스티커, 전단지 등 GOODZZ(GOODZZ).";

  if (query) {
    title = `"${query}" 검색 결과`;
    description = `"${query}" 검색 결과 - GOODZZ`;
  } else if (currentCategory) {
    title = currentCategory.label;
    description = `${currentCategory.label} 카테고리 - AI로 디자인한 커스텀 ${currentCategory.label} 상품을 만나보세요.`;
  }

  return {
    title,
    description,
    openGraph: {
      title: `${title} | GOODZZ`,
      description,
    },
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q as string | undefined;
  const category = resolvedSearchParams.category as string | undefined;
  const subcategory = resolvedSearchParams.subcategory as string | undefined;

  // 현재 선택된 카테고리 정보
  const currentCategory = category ? getCategoryBySlug(category) : null;

  // Fetch products from API
  let products = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3300';
    let apiUrl = `${baseUrl}/api/products`;
    
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    if (subcategory) params.append('subcategory', subcategory);
    if (query) params.append('type', 'search');
    
    const res = await fetch(`${apiUrl}?${params.toString()}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success) {
      products = data.products;
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  const filteredProducts = products;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-16">
        {/* Header / Banner */}
      <div className="bg-gray-50 py-24 border-b border-gray-100">
        <div className="container mx-auto px-4 text-center">
          {query ? (
              <div>
                <span className="text-gray-500 font-bold mb-3 block uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Search Results
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                </span>
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 inline-block">
                    "{query}"
                </h1>
              </div>
          ) : (
              <>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
                    글로벌 커스텀 굿즈
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
                    어디서든 주문 가능한 가장 심플한 굿즈 서비스. <br className="hidden md:block" />
                    사진 한 장만 준비하세요. 배송은 굿쯔가 책임집니다.
                </p>
              </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Category Tabs */}
        {!query && (
            <div className="mb-8">
              {/* 상위 카테고리 */}
              <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar">
                <Link
                  href="/shop"
                  className={`px-6 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                    !category
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  전체
                </Link>
                {getAllCategories().map(cat => {
                    const isActive = category === cat.slug;
                    return (
                      <Link
                        key={cat.slug}
                        href={`/shop?category=${cat.slug}`}
                        className={`px-6 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                            isActive
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {cat.label}
                      </Link>
                    );
                })}
              </div>

              {/* 하위 카테고리 (현재 카테고리에 서브카테고리가 있을 때만 표시) */}
              {currentCategory && currentCategory.subcategories && currentCategory.subcategories.length > 0 && (
                <div className="flex overflow-x-auto gap-2 no-scrollbar mt-4 pl-4 border-l-4 border-primary-300">
                  <Link
                    href={`/shop?category=${category}`}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
                      !subcategory
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                    }`}
                  >
                    전체
                  </Link>
                  {currentCategory.subcategories.map(sub => {
                    const isActive = subcategory === sub.slug;
                    return (
                      <Link
                        key={sub.slug}
                        href={`/shop?category=${category}&subcategory=${sub.slug}`}
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                        }`}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
        )}

        {/* Product Grid with Masonry Layout */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {filteredProducts.map((product: any, index: number) => (
            <div key={product.id} className="break-inside-avoid mb-6">
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
            <div className="py-20 text-center">
                <p className="text-2xl font-bold text-gray-300">검색 결과가 없습니다.</p>
                <p className="text-gray-400 mt-2">다른 검색어를 입력해보세요.</p>
            </div>
        )}
      </div>
      </div>
      <Footer />
    </>
  );
}
