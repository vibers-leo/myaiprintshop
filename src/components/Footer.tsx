'use client';

import Link from 'next/link';
import CoupangBanner from './CoupangBanner';

export default function Footer() {
  const glassStyle = {
    borderTop: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(9,9,11,0.98)',
  };

  return (
    <footer style={glassStyle}>
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand & Contact */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:gift-bold" class="text-zinc-950 text-lg" />
              </div>
              <span className="font-bold text-xl text-white" style={{ fontFamily: "'Outfit',sans-serif" }}>GOODZZ</span>
            </Link>
            <p className="text-zinc-500 mb-6 max-w-md leading-relaxed text-sm" style={{ wordBreak: 'keep-all' }}>
              소상공인과 브랜드를 위한 AI 굿즈 제작 플랫폼.
              디자이너 없이도 고퀄리티 굿즈를 소량으로 제작하세요.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:phone-bold" class="text-amber-500 text-base shrink-0" />
                <span>고객센터: 010-4866-5805</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:clock-circle-bold" class="text-amber-500 text-base shrink-0" />
                <span>평일 09:00 - 18:00 / 점심 12:00 - 13:00</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:letter-bold" class="text-amber-500 text-base shrink-0" />
                <span>support@goodzz.co.kr</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">바로가기</h4>
            <ul className="space-y-3">
              {[
                { name: '상품 목록', href: '/shop' },
                { name: '굿즈 만들기', href: '/create' },
                { name: '마이페이지', href: '/mypage' },
                { name: '장바구니', href: '/cart' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-zinc-500 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">약관 및 정책</h4>
            <ul className="space-y-3">
              {[
                { name: '이용약관', href: '/terms' },
                { name: '개인정보처리방침', href: '/privacy' },
                { name: '환불정책', href: '/refund' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-zinc-500 hover:text-white transition-colors">
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
        className="py-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <CoupangBanner />
          <p className="text-xs text-zinc-600">© 2025 GOODZZ. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
              className="text-zinc-600 hover:text-amber-500 transition-colors">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:instagram-linear" class="text-xl" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
              className="text-zinc-600 hover:text-amber-500 transition-colors">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:youtube-linear" class="text-xl" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
