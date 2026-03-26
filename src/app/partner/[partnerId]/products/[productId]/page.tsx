import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import PartnerProductDetail from '@/components/partner/PartnerProductDetail';

interface PartnerProductDetailPageProps {
  params: Promise<{
    partnerId: string;
    productId: string;
  }>;
}

export async function generateMetadata({
  params,
}: PartnerProductDetailPageProps): Promise<Metadata> {
  const { partnerId, productId } = await params;

  try {
    const [partnerDoc, productDoc] = await Promise.all([
      getDoc(doc(db, 'api_partners', partnerId)),
      getDoc(doc(db, 'products', productId)),
    ]);

    const partnerName = partnerDoc.exists() ? (partnerDoc.data() as any).name : partnerId;
    const productName = productDoc.exists() ? (productDoc.data() as any).name : '상품';

    return {
      title: `${productName} | ${partnerName}`,
      description: productDoc.exists()
        ? (productDoc.data() as any).description
        : '상품 상세 정보',
    };
  } catch (error) {
    return {
      title: `상품 상세 | ${partnerId}`,
      description: '상품 상세 정보',
    };
  }
}

export default async function PartnerProductDetailPage({
  params,
}: PartnerProductDetailPageProps) {
  const { partnerId, productId } = await params;

  // 파트너 정보 조회
  const partnerDoc = await getDoc(doc(db, 'api_partners', partnerId));

  if (!partnerDoc.exists() || (partnerDoc.data() as any).status !== 'active') {
    redirect('/');
  }

  const partnerData = {
    id: partnerDoc.id,
    ...(partnerDoc.data() as any),
  };

  // 상품 정보 조회
  const productDoc = await getDoc(doc(db, 'products', productId));

  if (!productDoc.exists() || !(productDoc.data() as any).isActive) {
    redirect(`/partner/${partnerId}/products`);
  }

  const product = {
    id: productDoc.id,
    ...(productDoc.data() as any),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 파트너 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a
              href={`/partner/${partnerId}/products`}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← {partnerData.name || partnerId} 상품 목록
            </a>

            <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
              GOODZZ 메인
            </a>
          </div>
        </div>
      </header>

      {/* 상품 상세 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <PartnerProductDetail
          product={product}
          partnerId={partnerId}
          partnerName={partnerData.name || partnerId}
        />
      </main>

      {/* 법적 필수 정보 푸터 */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-xs text-gray-600 space-y-2">
            <div className="font-medium">
              통신판매업자: GOODZZ(굿쯔) | 대표: 홍길동 | 사업자등록번호:
              123-45-67890
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
          </div>
        </div>
      </footer>
    </div>
  );
}

export const revalidate = 300; // 5분 ISR
