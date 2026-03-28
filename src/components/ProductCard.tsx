'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '../lib/mock-data';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const discountRate = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const getBadgeStyles = (badge: string) => {
    switch (badge) {
      case 'BEST':
        return 'bg-gray-900 text-white';
      case 'NEW':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'HOT':
        return 'bg-red-50 text-red-600 border border-red-100';
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  const cardStyle = {
    background: '#ffffff',
    border: '1px solid #E5E7EB',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 10) * 0.05 }}
    >
      <Link href={`/shop/${product.id}`} className="group block rounded-[20px] p-2.5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1" style={cardStyle}>
        <div className="relative overflow-hidden rounded-[14px] bg-gray-50 border border-gray-100 mb-3 aspect-square">
          {/* Badge */}
          {product.badge && (
            <div
              className={`absolute top-3 left-3 z-10 ${getBadgeStyles(product.badge)} text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm uppercase`}
            >
              {product.badge === 'NEW' && <span className="text-blue-500">✨</span>}
              {product.badge}
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-sm"
            style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            {/* @ts-ignore */}
            <iconify-icon 
              icon={isLiked ? "solar:heart-bold" : "solar:heart-linear"} 
              class={`text-lg ${isLiked ? 'text-red-500' : 'text-gray-400'}`} 
            />
          </button>

          {/* Image */}
          <img
            src={product.thumbnail}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"
          />

          {/* Quick Action Overlay */}
          <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <div className="bg-gray-900 text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-xl">
                상세보기
                {/* @ts-ignore */}
                <iconify-icon icon="solar:arrow-right-linear" class="text-base" />
            </div>
          </div>

          {/* Discount Badge */}
          {discountRate > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm">
              -{discountRate}%
            </div>
          )}
        </div>

        <div className="px-2 pb-2">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
            {product.category}
          </div>
          <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 leading-snug tracking-tight text-sm group-hover:text-black transition-colors" style={{ wordBreak: 'keep-all' }}>
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-lg text-gray-900 tracking-tighter" style={{ fontFamily: "'Outfit',sans-serif" }}>
                {product.price.toLocaleString()}<span className="text-xs font-bold text-gray-600 ml-0.5">원</span>
              </span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 font-medium line-through" style={{ fontFamily: "'Outfit',sans-serif" }}>
                  {product.originalPrice.toLocaleString()}원
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-100">
               {/* @ts-ignore */}
               <iconify-icon icon="solar:star-bold" class="text-yellow-400 text-xs" />
               <span className="pt-0.5">{product.rating}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
