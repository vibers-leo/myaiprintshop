import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관 | GOODZZ',
  description: 'GOODZZ 서비스 이용약관',
};

/**
 * 이용약관 페이지
 *
 * 전자상거래법 제13조에 따른 필수 표시사항
 */
export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">이용약관</h1>

      <div className="prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제1조 (목적)</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            본 약관은 GOODZZ(이하 "회사")이 제공하는
            AI 기반 프린트샵 서비스(이하 "서비스")의 이용과 관련하여
            회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제2조 (정의)</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <strong>"서비스"</strong>란 회사가 제공하는 AI 이미지 생성,
              명함 제작, 인쇄물 주문 등의 온라인 서비스를 의미합니다.
            </li>
            <li>
              <strong>"이용자"</strong>란 본 약관에 따라 회사가 제공하는
              서비스를 이용하는 회원 및 비회원을 말합니다.
            </li>
            <li>
              <strong>"회원"</strong>이란 회사에 개인정보를 제공하여
              회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며
              회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.
            </li>
            <li>
              <strong>"파트너"</strong>란 회사와 API 계약을 체결하고
              회사의 SDK/Widget을 통해 상품을 판매하는 제3자를 말합니다.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제3조 (약관의 게시와 개정)</h2>
          <ol className="list-decimal pl-6 text-gray-700 space-y-2">
            <li>
              회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록
              서비스 초기 화면에 게시합니다.
            </li>
            <li>
              회사는 「전자상거래 등에서의 소비자보호에 관한 법률」,
              「약관의 규제에 관한 법률」, 「전자문서 및 전자거래기본법」,
              「전자금융거래법」, 「전자서명법」, 「정보통신망 이용촉진 및
              정보보호 등에 관한 법률」, 「소비자기본법」 등 관련법을
              위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
            </li>
            <li>
              회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여
              현행약관과 함께 그 적용일자 7일 전부터 적용일자 전일까지
              공지합니다. 다만, 이용자에게 불리한 약관의 개정의 경우에는
              최소한 30일 전부터 공지합니다.
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제4조 (서비스의 제공 및 변경)</h2>
          <ol className="list-decimal pl-6 text-gray-700 space-y-2">
            <li>
              회사는 다음과 같은 서비스를 제공합니다:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>AI 이미지 생성 서비스</li>
                <li>명함, 전단지 등 인쇄물 디자인 편집 서비스</li>
                <li>인쇄물 주문 및 배송 서비스</li>
                <li>파트너 API/SDK 서비스</li>
                <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 제공하는 서비스</li>
              </ul>
            </li>
            <li>
              회사는 상품 또는 용역의 품절 또는 기술적 사양의 변경 등의
              경우에는 장차 체결되는 계약에 의해 제공할 상품 또는 용역의
              내용을 변경할 수 있습니다. 이 경우에는 변경된 상품 또는
              용역의 내용 및 제공일자를 명시하여 현재의 상품 또는 용역의
              내용을 게시한 곳에 즉시 공지합니다.
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제5조 (청약철회 및 환불)</h2>
          <ol className="list-decimal pl-6 text-gray-700 space-y-2">
            <li>
              회사와 재화 등의 구매에 관한 계약을 체결한 이용자는
              「전자상거래 등에서의 소비자보호에 관한 법률」 제13조 제2항에
              따른 계약내용에 관한 서면을 받은 날(그 서면을 받은 때보다
              재화 등의 공급이 늦게 이루어진 경우에는 재화 등을 공급받거나
              재화 등의 공급이 시작된 날을 말합니다)부터 7일 이내에는
              청약의 철회를 할 수 있습니다.
            </li>
            <li>
              다음 각 호의 경우에는 회사는 이용자의 청약철회를 제한할 수 있습니다:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>이용자에게 책임 있는 사유로 재화 등이 멸실 또는 훼손된 경우</li>
                <li>이용자의 사용 또는 일부 소비에 의하여 재화 등의 가치가 현저히 감소한 경우</li>
                <li>시간의 경과에 의하여 재판매가 곤란할 정도로 재화 등의 가치가 현저히 감소한 경우</li>
                <li>맞춤형 인쇄물 등 주문제작 상품의 경우</li>
              </ul>
            </li>
            <li>
              환불은 청약철회 요청일로부터 3영업일 이내에 처리됩니다.
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제6조 (개인정보보호)</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            회사는 이용자의 개인정보 수집 시 서비스 제공을 위하여 필요한
            범위에서 최소한의 개인정보를 수집합니다. 자세한 내용은
            <a href="/privacy" className="text-blue-600 hover:underline mx-1">
              개인정보처리방침
            </a>
            을 참조하시기 바랍니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제7조 (파트너 서비스 이용)</h2>
          <ol className="list-decimal pl-6 text-gray-700 space-y-2">
            <li>
              파트너 웹사이트를 통해 회사의 상품을 구매하는 경우에도
              본 약관이 적용됩니다.
            </li>
            <li>
              통신판매업자는 GOODZZ이며, 파트너는 단순 판매 중개 역할을 수행합니다.
            </li>
            <li>
              구매, 환불, AS 등 모든 거래 관련 사항은 회사가 책임집니다.
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">제8조 (면책조항)</h2>
          <ol className="list-decimal pl-6 text-gray-700 space-y-2">
            <li>
              회사는 천재지변 또는 이에 준하는 불가항력으로 인하여
              서비스를 제공할 수 없는 경우에는 서비스 제공에 관한
              책임이 면제됩니다.
            </li>
            <li>
              회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여
              책임을 지지 않습니다.
            </li>
            <li>
              회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에
              대하여 책임을 지지 않으며, 그 밖에 서비스를 통하여 얻은
              자료로 인한 손해 등에 대하여도 책임을 지지 않습니다.
            </li>
          </ol>
        </section>

        <section className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">사업자 정보</h2>
          <div className="text-gray-700 space-y-2">
            <p><strong>상호:</strong> GOODZZ(굿쯔)</p>
            <p><strong>대표자:</strong> 홍길동</p>
            <p><strong>사업자등록번호:</strong> 123-45-67890</p>
            <p><strong>통신판매업신고:</strong> 제2024-서울강남-0001호</p>
            <p><strong>주소:</strong> 서울시 강남구 테헤란로 123</p>
            <p><strong>전화:</strong> 02-1234-5678</p>
            <p><strong>이메일:</strong> support@goodzz.co.kr</p>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
          <p>공고일자: 2024년 1월 1일</p>
          <p>시행일자: 2024년 1월 1일</p>
        </div>
      </div>
    </div>
  );
}
