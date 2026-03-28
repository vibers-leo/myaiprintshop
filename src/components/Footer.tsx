'use client';

import Link from 'next/link';
import CoupangBanner from './CoupangBanner';

export default function Footer() {
  const containerStyle = {
    borderTop: '1px solid rgba(0,0,0,0.06)',
    background: '#FAFAFA',
  };

  return (
    <footer style={containerStyle}>
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand & Contact */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:gift-bold" class="text-white text-lg" />
              </div>
              <span className="font-black text-xl text-gray-900 tracking-tight" style={{ fontFamily: "'Outfit',sans-serif" }}>GOODZZ</span>
            </Link>
            <p className="text-gray-500 mb-8 max-w-sm leading-relaxed text-sm" style={{ wordBreak: 'keep-all' }}>
              소상공인과 브랜드를 위한 AI 굿즈 제작 플랫폼.<br />
              디자이너 없이도 고퀄리티 굿즈를 쉽게 만드세요.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {/* @ts-ignore */}
                  <iconify-icon icon="solar:phone-bold" class="text-gray-700 text-sm shrink-0" />
                </div>
                <span>010-4866-5805</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {/* @ts-ignore */}
                  <iconify-icon icon="solar:clock-circle-bold" class="text-gray-700 text-sm shrink-0" />
                </div>
                <span>평일 09:00 - 18:00 (점심 12:00 - 13:00)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {/* @ts-ignore */}
                  <iconify-icon icon="solar:letter-bold" class="text-gray-700 text-sm shrink-0" />
                </div>
                <span>support@goodzz.co.kr</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-900 font-bold mb-6 text-sm uppercase tracking-wider">바로가기</h4>
            <ul className="space-y-4">
              {[
                { name: '상품 목록', href: '/shop' },
                { name: '굿즈 만들기', href: '/create' },
                { name: '마이페이지', href: '/mypage' },
                { name: '장바구니', href: '/cart' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-gray-900 font-bold mb-6 text-sm uppercase tracking-wider">약관 및 정책</h4>
            <ul className="space-y-4">
              {[
                { name: '이용약관', href: '/terms' },
                { name: '개인정보처리방침', href: '/privacy' },
                { name: '환불정책', href: '/refund' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="py-8"
        style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#F4F4F5' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <CoupangBanner />
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-xs font-medium text-gray-500">© 2026 GOODZZ. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <a href="https://instagram.com/goodzz_official" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 transition-colors">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:instagram-linear" class="text-xl" />
              </a>
              <a href="https://youtube.com/@goodzz_official" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 transition-colors">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:youtube-linear" class="text-xl" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
