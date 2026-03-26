
import React from 'react';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function fetchProduct(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3300';
    const res = await fetch(`${baseUrl}/api/products/${id}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success) {
      return data.product;
    }
  } catch (error) {
    console.error('Error fetching product:', error);
  }
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await fetchProduct(resolvedParams.id);

  if (!product) {
    return { title: "상품을 찾을 수 없습니다" };
  }

  const title = product.name;
  const description = product.description
    ? product.description.slice(0, 160)
    : `${product.name} - 마이AI프린트샵에서 AI로 디자인된 커스텀 상품을 만나보세요.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | 마이AI프린트샵`,
      description,
      ...(product.imageUrl ? { images: [{ url: product.imageUrl, alt: product.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | 마이AI프린트샵`,
      description,
      ...(product.imageUrl ? { images: [product.imageUrl] } : {}),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const resolvedParams = await params;
  const product = await fetchProduct(resolvedParams.id);

  if (!product) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://goodzz.co.kr';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} - AI로 디자인된 커스텀 상품`,
    ...(product.imageUrl ? { image: product.imageUrl } : {}),
    url: `${siteUrl}/shop/${resolvedParams.id}`,
    ...(product.category ? { category: product.category } : {}),
    ...(product.price != null
      ? {
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "KRW",
            availability: "https://schema.org/InStock",
            url: `${siteUrl}/shop/${resolvedParams.id}`,
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-8">
            Shop &gt; {product.category} &gt; <span className="text-black font-medium">{product.name}</span>
        </div>

        <ProductDetailClient product={product} />
      </div>
    </div>
  );
}
