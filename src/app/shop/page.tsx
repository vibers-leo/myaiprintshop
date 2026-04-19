import React from 'react';
import { getAllCategories, getCategoryBySlug } from '@/lib/categories';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import ShopClientContent from '@/components/ShopClientContent';

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

  const currentCategory = category ? getCategoryBySlug(category) : null;

  return (
    <>
      <Navbar />
      <ShopClientContent
        products={[]}
        category={category}
        subcategory={subcategory}
        query={query}
        currentCategory={currentCategory}
        allCategories={getAllCategories()}
        fetchOnMount={true}
      />
      <Footer />
    </>
  );
}
