import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface PartnerHomeProps {
  params: Promise<{
    partnerId: string;
  }>;
}

/**
 * 파트너 서브도메인 홈페이지
 *
 * URL: partner.goodzz.co.kr → /partner/partner/
 *
 * Vercel rewrites를 통해 서브도메인이 이 라우트로 매핑됩니다.
 */
export async function generateMetadata({ params }: PartnerHomeProps): Promise<Metadata> {
  const { partnerId } = await params;

  // Firestore에서 파트너 정보 조회
  try {
    const partnerDoc = await getDoc(doc(db, 'api_partners', partnerId));

    if (partnerDoc.exists()) {
      const partnerData = partnerDoc.data() as any;
      return {
        title: `${partnerData.name || partnerId} | GOODZZ`,
        description: `${partnerData.name || partnerId}에서 제공하는 AI 기반 인쇄 서비스`,
      };
    }
  } catch (error) {
    console.error('Failed to fetch partner data:', error);
  }

  return {
    title: `${partnerId} | GOODZZ`,
    description: 'AI 기반 인쇄 서비스',
  };
}

export default async function PartnerHomePage({ params }: PartnerHomeProps) {
  const { partnerId } = await params;

  // Firestore에서 파트너 정보 조회
  let partnerData: any = null;

  try {
    const partnerDoc = await getDoc(doc(db, 'api_partners', partnerId));

    if (!partnerDoc.exists()) {
      // 파트너가 존재하지 않으면 메인 사이트로 리다이렉트
      redirect('/');
    }

    partnerData = {
      id: partnerDoc.id,
      ...(partnerDoc.data() as any),
    };

    // 파트너가 비활성 상태면 메인 사이트로 리다이렉트
    if (partnerData.status !== 'active') {
      redirect('/');
    }
  } catch (error) {
    console.error('Failed to fetch partner:', error);
    redirect('/');
  }

  // 파트너 홈 URL이 설정되어 있으면 리다이렉트
  if (partnerData.homeUrl) {
    redirect(partnerData.homeUrl);
  }

  // 기본: 상품 목록 페이지로 리다이렉트
  redirect(`/partner/${partnerId}/products`);
}

export const revalidate = 300; // 5분 ISR
