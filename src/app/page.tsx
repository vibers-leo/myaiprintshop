import LandingNavbar from '@/components/landing/LandingNavbar';
import LandingHero from '@/components/landing/LandingHero';
import LandingTrustStrip from '@/components/landing/LandingTrustStrip';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks';
import LandingTestimonials from '@/components/landing/LandingTestimonials';
import LandingProducts from '@/components/landing/LandingProducts';
import LandingBrands from '@/components/landing/LandingBrands';
import LandingCTA from '@/components/landing/LandingCTA';
import LandingFooter from '@/components/landing/LandingFooter';
import VibersBanner from '@/components/VibersBanner';

export const metadata = {
  title: 'GOODZZ | 사진 한 장으로 나만의 굿즈를',
  description: 'AI가 내 사진을 굿즈로 만들어드립니다. 명함, 스티커, 포스터, 에코백까지. 주문부터 배송까지 3분이면 충분합니다.',
};

export default function Home() {
  return (
    <main
      className="min-h-[100dvh]"
      style={{
        backgroundColor: '#09090b',
        fontFamily: "'Pretendard', 'Outfit', system-ui, sans-serif",
      }}
    >
      {/* Grain texture overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          pointerEvents: 'none',
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <LandingNavbar />
      <LandingHero />
      <LandingTrustStrip />
      <LandingFeatures />
      <LandingProducts />
      <LandingHowItWorks />
      <LandingTestimonials />
      <LandingBrands />
      <LandingCTA />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
        <VibersBanner size="leaderboard" currentProject="goodzz" />
      </div>
      <LandingFooter />
    </main>
  );
}
