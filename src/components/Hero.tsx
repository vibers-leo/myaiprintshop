'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-3xl">
          {/* 메인 타이틀 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-[1.15] tracking-tight">
            사장님, 브랜드 굿즈{' '}
            <br className="hidden sm:block" />
            <span className="text-gradient">직접 만들어보세요</span>
          </h1>

          {/* 서브타이틀 */}
          <p className="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed max-w-xl">
            AI가 디자인하고, 굿쯔가 만들어드립니다.
            <br />
            소량도 OK! 부담 없이 브랜드 맞춤 제작을 시작하세요.
          </p>

          {/* CTA 버튼 */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/create"
              className="btn btn-primary btn-lg group"
            >
              무료로 시작하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/shop"
              className="btn btn-secondary btn-lg"
            >
              둘러보기
            </Link>
          </div>

          {/* 신뢰 배지 */}
          <div className="mt-10 flex flex-wrap items-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span>24시간 빠른 제작</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span>무료 배송</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span>100% 환불 보장</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
