import { ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-white overflow-hidden py-24 md:py-32 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-700 rounded border border-gray-200 text-sm font-bold mb-6">
              <ShoppingBag className="w-4 h-4 text-primary-600" />
              전 세계 배송 지원 · 최소 수량 없음
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.15] tracking-tight">
              사진 한 장이면,<br />
              <span className="text-primary-600">글로벌 굿즈</span> 완성
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed font-medium">
              goodzz.kr 하나면 끝. 원하는 사진만 올리세요.<br />
              어디서든 주문 가능한 가장 심플한 굿즈 커스텀 서비스.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/create"
                className="btn btn-primary btn-lg flex-1 sm:flex-none justify-center px-8"
              >
                무료로 시작하기
                <ArrowRight className="w-5 h-5 ml-1" />
              </Link>

              <Link
                href="/shop"
                className="btn btn-secondary btn-lg flex-1 sm:flex-none justify-center px-8"
              >
                상품 둘러보기
              </Link>
            </div>

            {/* 신뢰 포인트 */}
            <div className="flex items-center gap-6 text-sm font-bold text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-500"></span>
                <span>글로벌 해외 배송</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-500"></span>
                <span>원클릭 AI 목업</span>
              </div>
            </div>
          </div>

          {/* Visual Content (Mockup Graphics) */}
          <div className="relative w-full aspect-square lg:aspect-auto lg:h-[600px] bg-gray-50 rounded-3xl border border-gray-100 overflow-hidden flex items-center justify-center p-8">
             <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-white"></div>
             
             {/* Main Graphic - Business Card Mockup */}
             <div className="relative z-10 w-64 md:w-80 aspect-[1.5/1] bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col justify-between transform -rotate-6 hover:rotate-0 transition-transform duration-500 ease-in-out">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex-shrink-0"></div>
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded-md w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                   <div className="h-3 bg-gray-100 rounded-md w-full"></div>
                   <div className="h-3 bg-gray-100 rounded-md w-4/5"></div>
                </div>
             </div>
             
             {/* Floating element 1 - Sticker Roll */}
             <div className="absolute top-10 right-10 w-24 h-24 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.1)] border-4 border-gray-50 p-2 transform rotate-12 flex items-center justify-center">
                <div className="w-full h-full bg-accent-100 rounded-full flex items-center justify-center border-2 border-accent-200">
                  <span className="text-accent-600 font-bold text-xs">스티커</span>
                </div>
             </div>
             
             {/* Floating element 2 - UI Card */}
             <div className="absolute bottom-16 -left-8 md:left-4 w-48 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-50 p-4 transform rotate-3">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-gray-500">AI 완성본</span>
                  <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                </div>
                <div className="h-8 bg-gray-100 rounded-lg w-full flex items-center px-3">
                   <div className="h-2 bg-gray-300 rounded-full w-1/2"></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
