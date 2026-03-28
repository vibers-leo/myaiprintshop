'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function getVolumeDiscountedPrice(item: { price: number; quantity: number; metadata?: Record<string, any> }): number {
  const volumePricing = item.metadata?.volumePricing;
  const baseUnitPrice = item.metadata?.baseUnitPrice;
  if (!volumePricing || !baseUnitPrice) return item.price;

  const sorted = [...volumePricing].sort((a: any, b: any) => b.minQuantity - a.minQuantity);
  const tier = sorted.find((t: any) => item.quantity >= t.minQuantity);
  if (tier) {
    return Math.round(baseUnitPrice * (1 - (tier as any).discountRate));
  }
  return baseUnitPrice;
}

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #E5E7EB',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
};

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-[100dvh] bg-[#FAFAFA]"></div>; // Prevent hydration error

  const subtotal = cart.reduce((acc, item) => {
    const effectivePrice = getVolumeDiscountedPrice(item);
    return acc + effectivePrice * item.quantity;
  }, 0);
  const shipping = subtotal > 50000 ? 0 : 3000;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="bg-[#FAFAFA]">
        <Navbar />
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 pt-32 text-center">
          <div className="w-28 h-28 rounded-[24px] flex items-center justify-center mb-6 bg-white border border-gray-200 shadow-sm">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:cart-large-minimalistic-bold" class="text-5xl text-gray-300" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">장바구니가 비어있습니다</h2>
          <p className="text-gray-500 font-medium mb-12 text-lg">나만의 사진으로 특별한 굿즈를 디자인하고 담아보세요!</p>
          <div className="flex gap-4">
            <Link 
                href="/shop" 
                className="px-8 py-4 bg-white text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors font-bold flex items-center gap-2 border border-gray-200 shadow-sm"
            >
                {/* @ts-ignore */}
                <iconify-icon icon="solar:shop-bold" class="text-xl" />
                상품 구경하기
            </Link>
            <Link 
                href="/create" 
                className="px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-colors font-bold flex items-center gap-2 shadow-md hover:-translate-y-0.5"
            >
                {/* @ts-ignore */}
                <iconify-icon icon="solar:magic-stick-3-bold" class="text-xl" />
                사진으로 만들기
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 pt-32 min-h-[100dvh]">
        <h1 className="text-3xl font-black text-gray-900 mb-10 tracking-tight">장바구니 ({cart.length})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div 
                  key={item.cartId} 
                  className="flex gap-4 md:gap-6 p-5 rounded-3xl group transition-all hover:shadow-md"
                  style={cardStyle}
              >
                {/* Image */}
                <div className="relative w-28 h-28 md:w-36 md:h-36 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center p-2">
                  <Image src={item.thumbnail} alt={item.name} fill sizes="144px" className="object-cover opacity-90 mix-blend-multiply" />
                  
                  {/* Custom Design Overlay */}
                  {item.customDesignUrl && (
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                           <div className="relative w-3/4 h-3/4 shadow-xl rounded overflow-hidden">
                             <Image
                                src={item.customDesignUrl}
                                className="object-cover"
                                alt="Custom"
                                fill
                                sizes="96px"
                                unoptimized
                             />
                           </div>
                       </div>
                  )}
                  
                  {item.customDesignUrl && (
                      <div className="absolute top-2 left-2 z-20 bg-gray-900 text-white px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase shadow-sm">
                          AI 시안
                      </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1 pr-4 tracking-tight">{item.name}</h3>
                      <button 
                          onClick={() => {
                              removeFromCart(item.cartId);
                              toast.success('상품이 삭제되었습니다.');
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                          {/* @ts-ignore */}
                          <iconify-icon icon="solar:trash-bin-trash-bold" class="text-xl" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1.5 font-medium">
                      옵션: {item.color} / {item.size}
                    </p>
                    <div className="flex items-end gap-2 mt-3">
                      <p className="font-black text-gray-900 text-xl" style={{ fontFamily: "'Outfit',sans-serif" }}>
                        {item.price.toLocaleString()}<span className="text-sm font-bold text-gray-600 ml-0.5">원</span>
                      </p>
                      {item.price < (item.metadata?.baseUnitPrice || item.price) && (
                        <p className="text-xs text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 mb-1">
                          수량 할인 적용!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quantity Control */}
                  <div className="flex items-center gap-3 mt-4">
                      <div className="flex items-center rounded-xl bg-gray-50 border border-gray-200 overflow-hidden shadow-sm">
                          <button 
                              onClick={() => updateQuantity(item.cartId, -1)}
                              className="p-2.5 hover:bg-white text-gray-500 hover:text-gray-900 transition-colors"
                          >
                              {/* @ts-ignore */}
                              <iconify-icon icon="solar:minus-square-linear" class="text-lg" />
                          </button>
                          <span className="w-10 text-center text-sm font-bold text-gray-900 font-mono bg-white h-full py-2.5">{item.quantity}</span>
                          <button 
                              onClick={() => updateQuantity(item.cartId, 1)}
                              className="p-2.5 hover:bg-white text-gray-500 hover:text-gray-900 transition-colors"
                          >
                              {/* @ts-ignore */}
                              <iconify-icon icon="solar:add-square-linear" class="text-lg" />
                          </button>
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl p-6 lg:p-8 sticky top-24 space-y-6" style={cardStyle}>
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest text-sm mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:bill-list-bold" class="text-gray-500 text-xl" />
                결제 정보
              </h2>
              
              <div className="space-y-4 text-sm font-medium">
                  <div className="flex justify-between text-gray-500">
                      <span>총 상품금액</span>
                      <span className="text-gray-900 font-bold" style={{ fontFamily: "'Outfit',sans-serif" }}>{subtotal.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                      <span>배송비</span>
                      <span className="text-gray-900 font-bold" style={{ fontFamily: "'Outfit',sans-serif" }}>{shipping === 0 ? '무료' : `${shipping.toLocaleString()}원`}</span>
                  </div>
                  {shipping > 0 && subtotal < 50000 && (
                      <p className="text-xs text-black text-right mt-2 font-bold bg-gray-100 px-3 py-2 rounded-lg inline-block float-right">
                          {(50000 - subtotal).toLocaleString()}원 더 담으면 무료배송!
                      </p>
                  )}
              </div>

              <div className="pt-6 mt-6 flex flex-col gap-1 border-t border-gray-100">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-gray-500">총 결제 금액</span>
                    <span className="text-[32px] font-black text-gray-900" style={{ fontFamily: "'Outfit',sans-serif" }}>{total.toLocaleString()}원</span>
                  </div>
              </div>

              <Link 
                  href="/checkout"
                  className="w-full bg-gray-900 text-white font-bold py-4.5 rounded-[16px] hover:bg-black hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow-md mt-6 active:scale-[0.98] text-lg"
              >
                  {/* @ts-ignore */}
                  <iconify-icon icon="solar:wallet-money-bold" class="text-2xl" />
                  주문 진행하기
              </Link>
              
              <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1.5 mt-5 font-medium">
                  {/* @ts-ignore */}
                  <iconify-icon icon="solar:info-circle-linear" />
                  할인 코드 및 포인트는 다음 단계에서 적용할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
