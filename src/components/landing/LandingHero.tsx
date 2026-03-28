'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function LandingHero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.style.opacity = '0';
    const timer = setTimeout(() => {
      el.style.transition = 'opacity 0.8s ease';
      el.style.opacity = '1';
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100dvh] flex items-center pt-16 bg-white overflow-hidden"
    >
      {/* Subtle modern background dots/mesh representing light canvas */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <div 
        className="absolute top-0 inset-x-0 h-[500px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% -20%, rgba(0,0,0,0.03) 0%, transparent 70%)'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 bg-gray-50 border border-gray-200 shadow-sm"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-gray-600" style={{ wordBreak: 'keep-all' }}>
                지금 47,200명이 굿즈를 만들고 있습니다
              </span>
            </div>

            <h1
              className="font-black text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight text-gray-900 mb-4"
              style={{ fontFamily: "'Outfit', 'Pretendard', sans-serif", wordBreak: 'keep-all' }}
            >
              사진 한 장으로<br />
              <span className="text-black">나만의 굿즈를.</span>
            </h1>

            <p
              className="text-gray-500 text-base leading-relaxed mb-8 font-medium"
              style={{ maxWidth: '45ch', wordBreak: 'keep-all' }}
            >
              AI가 내 사진을 분석해 최적의 굿즈 시안을 만들어드립니다.
              명함부터 스티커, 에코백까지.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/create"
                className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold text-base px-6 py-3.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1"
              >
                {/* @ts-ignore */}
                <iconify-icon icon="solar:magic-stick-3-bold" />
                사진으로 굿즈 만들기
              </Link>
              <Link
                href="/shop"
                className="flex items-center justify-center gap-2 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-semibold text-base px-6 py-3.5 rounded-xl transition-all duration-300 border border-gray-200 shadow-sm"
              >
                상품 구경하기
                {/* @ts-ignore */}
                <iconify-icon icon="solar:arrow-right-linear" />
              </Link>
            </div>

            {/* Stats */}
            <div
              className="flex items-center gap-5 mt-10 pt-8 border-t border-gray-100"
            >
              <div>
                <div className="font-black text-2xl text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  47,200<span className="text-gray-400">+</span>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-1">총 주문 건수</div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <div className="font-black text-2xl text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  4.87<span className="text-gray-400">/5</span>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-1">고객 만족도</div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <div className="font-black text-2xl text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  3<span className="text-gray-400">분</span>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-1">평균 주문 완료</div>
              </div>
            </div>
          </div>

          {/* Right: Floating Product Card */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="animate-[float_6s_ease-in-out_infinite] relative">
              <div
                className="bg-white rounded-[2rem] p-5 w-80 sm:w-96 shadow-2xl border border-gray-100"
              >
                <div className="rounded-2xl overflow-hidden mb-5 bg-gray-50 border border-gray-100" style={{ aspectRatio: '1/1' }}>
                  <img
                    src="https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&q=80&w=800"
                    alt="굿즈 미리보기"
                    className="w-full h-full object-cover mix-blend-multiply"
                    loading="eager"
                  />
                </div>
                <div className="flex items-center justify-between px-1">
                  <div>
                    <div className="font-bold text-gray-900 text-sm">나만의 에코백</div>
                    <div className="text-gray-500 font-medium text-[11px] mt-0.5">AI 시안 완성 · 즉시 주문 가능</div>
                  </div>
                  <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center shadow-md">
                    {/* @ts-ignore */}
                    <iconify-icon icon="solar:cart-large-4-bold" class="text-white text-base" />
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div
                className="absolute -top-6 -right-6 bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl border border-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  {/* @ts-ignore */}
                  <iconify-icon icon="solar:star-bold" class="text-blue-500 text-lg" />
                </div>
                <span className="text-gray-900 text-sm font-bold">AI 자동 시안</span>
              </div>
              <div
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl border border-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                  {/* @ts-ignore */}
                  <iconify-icon icon="solar:delivery-bold" class="text-green-500 text-lg" />
                </div>
                <span className="text-gray-900 text-sm font-bold">국내외 배송</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
