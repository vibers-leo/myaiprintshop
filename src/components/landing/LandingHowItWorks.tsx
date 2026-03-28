'use client';
import { useEffect, useRef } from 'react';

const STEPS = [
  {
    num: '01',
    title: '사진을 올려주세요',
    desc: '스마트폰으로 찍은 사진도 충분합니다. AI가 자동으로 배경 제거, 밝기 보정, 해상도 최적화를 처리합니다.',
    img: 'https://images.unsplash.com/photo-1611162618758-2a29a995354b?auto=format&fit=crop&q=80&w=600',
  },
  {
    num: '02',
    title: '원하는 굿즈를 고르세요',
    desc: '명함, 포스터, 에코백 등 원하는 상품을 선택하면 AI가 즉시 맞춤 시안을 제안합니다. 에디터로 직접 수정할 수도 있습니다.',
    img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=600',
  },
  {
    num: '03',
    title: '주문하고 받으면 끝',
    desc: '안전한 결제 후 제작이 시작됩니다. 실시간으로 제작 상태를 확인하고, 빠르게 배송받으세요.',
    img: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=600',
  },
];

export default function LandingHowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const rows = sectionRef.current.querySelectorAll('.step-row');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) (e.target as HTMLElement).style.cssText += 'opacity:1;transform:translateY(0)';
      }),
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    rows.forEach((row) => {
      (row as HTMLElement).style.cssText = 'opacity:0;transform:translateY(2rem);transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1),transform 0.7s cubic-bezier(0.16,1,0.3,1)';
      observer.observe(row);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how" className="py-32 bg-white border-t border-gray-100" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="step-row text-center mb-20">
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-4">이용 방법</p>
          <h2
            className="font-black text-4xl sm:text-5xl text-gray-900 leading-tight"
            style={{ fontFamily: "'Outfit','Pretendard',sans-serif", wordBreak: 'keep-all' }}
          >
            정말 이렇게 쉬운가요?<br />
            <span className="text-gray-400">네, 그렇습니다.</span>
          </h2>
        </div>

        <div className="space-y-24">
          {STEPS.map((step, idx) => {
            const isEven = idx % 2 === 0;
            return (
               <div
                key={step.num}
                className={`step-row grid grid-cols-1 md:grid-cols-2 gap-16 items-center`}
              >
                {/* Image */}
                <div className={`rounded-[2rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-lg ${!isEven ? 'md:order-2' : ''}`}
                  style={{ aspectRatio: '1/1' }}>
                  <img
                    src={step.img}
                    alt={step.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                {/* Text */}
                <div className={!isEven ? 'md:order-1' : ''}>
                  <div className="w-12 h-12 bg-gray-900 shadow-md rounded-2xl flex items-center justify-center mb-6">
                    <span className="font-black text-white text-lg" style={{ fontFamily: "'Outfit',sans-serif" }}>
                      {step.num}
                    </span>
                  </div>
                  <h3
                    className="font-black text-3xl text-gray-900 mb-4 tracking-tight"
                    style={{ wordBreak: 'keep-all' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-lg leading-relaxed font-medium" style={{ wordBreak: 'keep-all' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
