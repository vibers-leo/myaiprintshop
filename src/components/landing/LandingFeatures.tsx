'use client';
import { useEffect, useRef } from 'react';

const FEATURES = [
  {
    icon: 'solar:magic-stick-3-bold',
    title: 'AI가 시안을 자동으로 만들어드립니다',
    desc: '사진을 올리면 AI가 상품별 적정 사이즈, 배치, 색상까지 자동으로 조정합니다. 디자인을 몰라도 됩니다.',
    large: true,
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800',
  },
  {
    icon: 'solar:clock-circle-bold',
    title: '3분 내 주문 완료',
    desc: '사진 업로드부터 결제까지 단 3분. 복잡한 절차 없이 즉시 주문할 수 있습니다.',
    stat: '3분',
    statSub: '이내',
  },
  {
    icon: 'solar:box-bold',
    title: '100가지 이상의 굿즈',
    desc: '명함, 스티커, 포스터, 에코백, 마스킹테이프까지. 원하는 거의 모든 굿즈를 한 곳에서.',
    chips: [
      { icon: 'solar:card-2-bold', label: '명함' },
      { icon: 'solar:sticker-bold', label: '스티커' },
      { icon: 'solar:bag-4-bold', label: '에코백' },
    ],
  },
  {
    icon: 'solar:delivery-bold',
    title: '전국 어디서든, 해외까지 배송',
    desc: '제작 완료 후 평균 2-5일 내 수령. 국내는 물론 전 세계 주요 도시로 배송해드립니다.',
    large: true,
    badges: ['국내 2-3일 내', '해외 7-14일 내', '실시간 배송 추적'],
  },
];

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #E5E7EB',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02)',
};

export default function LandingFeatures() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const cards = sectionRef.current.querySelectorAll('.bento-card');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) (e.target as HTMLElement).style.cssText += 'opacity:1;transform:translateY(0)';
      }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    cards.forEach((card) => {
      (card as HTMLElement).style.cssText = 'opacity:0;transform:translateY(2rem);transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1),transform 0.7s cubic-bezier(0.16,1,0.3,1)';
      observer.observe(card);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="py-24 bg-[#FAFAFA]" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bento-card mb-12 text-center lg:text-left">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">왜 GOODZZ인가</p>
          <h2
            className="font-black text-3xl sm:text-4xl text-gray-900 leading-tight mb-3 tracking-tight"
            style={{ fontFamily: "'Outfit','Pretendard',sans-serif", wordBreak: 'keep-all' }}
          >
            굿즈를 쉽게 만드는<br />가장 빠른 방법
          </h2>
          <p className="text-gray-500 font-medium text-lg leading-relaxed mx-auto lg:mx-0" style={{ maxWidth: '55ch', wordBreak: 'keep-all' }}>
            복잡한 디자인 툴 없이도, AI가 내 이미지를 분석해 제품에 최적화된 시안을 즉시 제안합니다.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Large: AI Design */}
          <div
            className="bento-card rounded-3xl p-6 lg:p-8 md:col-span-2 group cursor-default transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            style={cardStyle}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gray-100 border border-gray-200 shadow-sm">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:magic-stick-3-bold" class="text-gray-900 text-2xl" />
            </div>
            <h3 className="font-extrabold text-xl text-gray-900 mb-2 tracking-tight" style={{ wordBreak: 'keep-all' }}>AI가 시안을 자동으로 만들어드립니다</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-lg mb-6 font-medium" style={{ wordBreak: 'keep-all' }}>
              사진을 올리면 AI가 상품별 적정 사이즈, 배치, 색상까지 자동으로 조정합니다.
            </p>
            <div className="rounded-2xl overflow-hidden bg-gray-100 border border-gray-200" style={{ aspectRatio: '16/9' }}>
              <img
                src={FEATURES[0].image}
                alt="AI 시안 생성"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          {/* Small: Speed */}
          <div
            className="bento-card rounded-3xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between"
            style={cardStyle}
          >
            <div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gray-100 border border-gray-200 shadow-sm">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:clock-circle-bold" class="text-gray-900 text-2xl" />
              </div>
              <h3 className="font-extrabold text-lg text-gray-900 mb-2 tracking-tight" style={{ wordBreak: 'keep-all' }}>3분 내 주문 완료</h3>
              <p className="text-gray-500 text-xs leading-relaxed font-medium mb-6" style={{ wordBreak: 'keep-all' }}>
                사진 업로드부터 결제까지 단 3분. 복잡한 절차 없이 빨리 주문할 수 있습니다.
              </p>
            </div>
            <div className="mt-auto flex items-end gap-2">
              <span className="font-black text-6xl text-gray-900 tracking-tighter" style={{ fontFamily: "'Outfit',sans-serif" }}>3</span>
              <span className="text-gray-500 font-bold text-sm pb-2">분<br />이내</span>
            </div>
          </div>

          {/* Small: Products */}
          <div
            className="bento-card rounded-3xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between"
            style={cardStyle}
          >
            <div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gray-100 border border-gray-200 shadow-sm">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:box-bold" class="text-gray-900 text-2xl" />
              </div>
              <h3 className="font-extrabold text-lg text-gray-900 mb-2 tracking-tight" style={{ wordBreak: 'keep-all' }}>100가지 이상의 굿즈</h3>
              <p className="text-gray-500 text-xs leading-relaxed font-medium mb-6" style={{ wordBreak: 'keep-all' }}>
                명함부터 에코백까지. 원하는 거의 모든 굿즈를 한 곳에서 제공합니다.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-auto">
              {FEATURES[2].chips?.map((chip) => (
                <div key={chip.label} className="rounded-xl p-3 flex flex-col items-center gap-2 bg-gray-50 border border-gray-200 shadow-sm transition-colors hover:bg-gray-100">
                  {/* @ts-ignore */}
                  <iconify-icon icon={chip.icon} class="text-gray-700 text-2xl" />
                  <span className="text-gray-600 font-semibold text-xs">{chip.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Large: Delivery */}
          <div
            className="bento-card rounded-3xl p-6 lg:p-8 md:col-span-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between"
            style={cardStyle}
          >
            <div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gray-100 border border-gray-200 shadow-sm">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:delivery-bold" class="text-gray-900 text-2xl" />
              </div>
              <h3 className="font-extrabold text-xl text-gray-900 mb-2 tracking-tight" style={{ wordBreak: 'keep-all' }}>전국 어디서든, 해외까지 배송</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-lg mb-6 font-medium" style={{ wordBreak: 'keep-all' }}>
                제작 완료 후 평균 2-5일 내 수령. 국내는 물론 전 세계 주요 도시로 배송해드립니다.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 mt-auto flex gap-3 flex-wrap">
              {FEATURES[3].badges?.map((badge) => (
                <div key={badge} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold shadow-sm">
                  {/* @ts-ignore */}
                  <iconify-icon icon="solar:check-circle-bold" class="text-gray-900 text-lg" />
                  <span className="text-gray-600 text-sm">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
