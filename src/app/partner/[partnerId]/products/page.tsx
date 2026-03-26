import { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import PartnerProductList from '@/components/partner/PartnerProductList';

interface PartnerProductsPageProps {
  params: Promise<{
    partnerId: string;
  }>;
}

export async function generateMetadata({ params }: PartnerProductsPageProps): Promise<Metadata> {
  const { partnerId } = await params;

  try {
    const partnerDoc = await getDoc(doc(db, 'api_partners', partnerId));

    if (partnerDoc.exists()) {
      const partnerData = partnerDoc.data() as any;
      return {
        title: `상품 목록 | ${partnerData.name || partnerId}`,
        description: `${partnerData.name || partnerId}에서 제공하는 AI 기반 인쇄 상품`,
      };
    }
  } catch (error) {
    console.error('Failed to fetch partner data:', error);
  }

  return {
    title: `상품 목록 | ${partnerId}`,
    description: 'AI 기반 인쇄 상품',
  };
}

export default async function PartnerProductsPage({ params }: PartnerProductsPageProps) {
  const { partnerId } = await params;

  // 파트너 정보 조회
  const partnerDoc = await getDoc(doc(db, 'api_partners', partnerId));

  if (!partnerDoc.exists() || (partnerDoc.data() as any).status !== 'active') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">파트너를 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-6">
            요청하신 파트너가 존재하지 않거나 비활성 상태입니다.
          </p>
          <a href="/" className="text-blue-600 hover:underline">
            메인 사이트로 이동
          </a>
        </div>
      </div>
    );
  }

  const partnerData = {
    id: partnerDoc.id,
    ...(partnerDoc.data() as any),
  };

  // 파트너 상품 조회 (파트너가 판매 허가된 상품)
  // TODO: 실제로는 api_partners 문서에 allowedProducts 배열이 있어야 함
  // 현재는 모든 활성 상품을 보여줌
  const productsQuery = query(
    collection(db, 'products'),
    where('isActive', '==', true)
  );

  const productsSnapshot = await getDocs(productsQuery);
  const products = productsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as any),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 파트너 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{partnerData.name || partnerId}</h1>
              <p className="text-gray-600 mt-1">
                {partnerData.description || 'AI 기반 프린트샵 서비스'}
              </p>
            </div>

            <a
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              GOODZZ 메인
            </a>
          </div>
        </div>
      </header>

      {/* 상품 목록 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <PartnerProductList
          products={products}
          partnerId={partnerId}
          partnerName={partnerData.name || partnerId}
        />
      </main>

      {/* 법적 필수 정보 푸터 (전자상거래법 제13조) */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-xs text-gray-600 space-y-2">
            <div className="font-medium">
              통신판매업자: GOODZZ(굿쯔) | 대표: 홍길동 | 사업자등록번호: 123-45-67890
            </div>
            <div className="font-medium">
              통신판매업신고: 제2024-서울강남-0001호 | 고객센터: 02-1234-5678
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              <a href="/terms" target="_blank" className="hover:underline">
                이용약관
              </a>
              <span>|</span>
              <a href="/privacy" target="_blank" className="hover:underline">
                개인정보처리방침
              </a>
              <span>|</span>
              <a href="/refund" target="_blank" className="hover:underline">
                환불정책
              </a>
            </div>
            <div className="text-gray-500 mt-2">
              본 상품은 GOODZZ(굿쯔)가 통신판매업자로서 판매합니다.
              {partnerData.name && ` ${partnerData.name}은(는) 판매 채널 역할을 수행합니다.`}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const revalidate = 300; // 5분 ISR
