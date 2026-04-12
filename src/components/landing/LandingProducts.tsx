'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Sparkles } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  vendorName?: string;
}

export default function LandingProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products?type=best&limit=8')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProducts(data.products.slice(0, 8));
      })
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-24 px-4 relative" style={{ background: '#09090b' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-amber-400 text-sm font-bold tracking-widest uppercase mb-3 block">
            <Sparkles className="w-4 h-4 inline mr-1" />Best Sellers
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            가장 많이 찾는 굿즈
          </h2>
          <p className="text-zinc-400 text-lg">실제 주문이 가장 많은 인기 상품</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {products.map((product, i) => {
            const discount = product.originalPrice
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/shop/${product.id}`}
                  className="group block rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-300"
                  style={{ background: '#1c1c1f' }}
                >
                  <div className="aspect-square relative overflow-hidden bg-zinc-900">
                    <Image
                      src={product.thumbnail}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-luminosity group-hover:mix-blend-normal"
                    />
                    {product.badge && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-black text-[10px] font-black px-2 py-1 rounded-full">
                        {product.badge}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full">
                        -{discount}%
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-white text-sm font-bold line-clamp-1 group-hover:text-amber-300 transition-colors">
                      {product.name}
                    </h3>
                    {product.vendorName && (
                      <p className="text-zinc-500 text-[11px] mt-0.5">{product.vendorName}</p>
                    )}
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-white font-black" style={{ fontFamily: "'Outfit',sans-serif" }}>
                        ₩{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-zinc-600 text-xs line-through">₩{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    {product.reviewCount > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 text-[11px] text-zinc-500">
                        <Star className="w-3 h-3 text-amber-400 fill-current" />
                        {product.rating.toFixed(1)}
                        <span className="text-zinc-600">({product.reviewCount})</span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-700 text-zinc-300 hover:text-white hover:border-amber-500 transition-all text-sm font-medium"
          >
            전체 상품 보기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
