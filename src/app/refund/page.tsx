import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '환불/교환 정책 | GOODZZ',
  description: 'GOODZZ 환불 및 교환 정책',
};

export default function RefundPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">환불/교환 정책</h1>

      <div className="prose prose-gray max-w-none">
        <section className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-3 text-blue-900">청약철회 (7일 이내)</h2>
          <p className="text-gray-700 mb-2">
            전자상거래 등에서의 소비자보호에 관한 법률에 따라,
            상품 수령 후 7일 이내에 청약철회가 가능합니다.
          </p>
          <p className="text-sm text-gray-600">
            단, 맞춤 제작 상품의 경우 제작 시작 전까지만 가능합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. 환불 가능 조건</h2>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-green-700">✅ 환불 가능한 경우</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>상품 수령 후 7일 이내 (미사용, 미개봉 상태)</li>
              <li>배송된 상품이 주문 내용과 다른 경우</li>
              <li>상품에 파손 또는 불량이 있는 경우</li>
              <li>인쇄물의 색상, 품질이 계약 내용과 현저히 다른 경우</li>
              <li>배송 지연으로 인해 구매 목적을 달성할 수 없는 경우</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-red-700">❌ 환불 불가능한 경우</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>고객 변심에 의한 반품 시, 왕복 배송비는 고객 부담입니다</li>
              <li>맞춤 제작 상품의 경우, 제작 시작 후에는 취소/환불이 불가능합니다</li>
              <li>상품 사용 또는 일부 소비로 상품 가치가 현저히 감소한 경우</li>
              <li>시간 경과에 따라 재판매가 곤란할 정도로 상품 가치가 현저히 감소한 경우</li>
              <li>고객의 요청에 따라 개별 주문 제작된 상품</li>
              <li>디지털 콘텐츠 (다운로드 후 환불 불가)</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. 환불 절차</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">환불 신청</h3>
                <p className="text-gray-700">
                  고객센터(02-1234-5678) 또는 이메일(support@goodzz.co.kr)로
                  환불 요청 접수
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  필요 정보: 주문번호, 환불 사유, 계좌 정보
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">반품 승인 및 상품 회수</h3>
                <p className="text-gray-700">
                  환불 승인 후 택배 수거 일정 안내<br />
                  (상품 하자의 경우 무료 수거)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">검수 및 환불 처리</h3>
                <p className="text-gray-700">
                  상품 확인 후 2~3 영업일 내 환불 처리<br />
                  결제 수단에 따라 환불 소요 기간 상이
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">환불 처리 기간</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 신용카드: 승인 취소 후 카드사 정산 일정에 따라 3~7일</li>
              <li>• 계좌이체: 환불 신청 확인 후 2~3 영업일</li>
              <li>• 가상계좌: 환불 계좌 정보 확인 후 2~3 영업일</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. 교환 정책</h2>

          <p className="text-gray-700 mb-4">
            상품 불량 또는 오배송의 경우 동일 상품으로 교환해 드립니다.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">교환 가능 조건</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>상품 수령 후 7일 이내</li>
                <li>상품에 하자가 있는 경우 (인쇄 불량, 파손 등)</li>
                <li>주문한 상품과 다른 상품이 배송된 경우</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">교환 절차</h3>
              <p className="text-gray-700 mb-2">
                고객센터로 교환 신청 → 상품 회수 → 검수 후 재배송
              </p>
              <p className="text-sm text-gray-600">
                교환 배송비는 당사 부담 (고객 변심의 경우 왕복 배송비 고객 부담)
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. 배송비 정책</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">구분</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">배송비 부담</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">상품 불량/오배송</td>
                  <td className="border border-gray-300 px-4 py-2">회사 부담 (무료 수거)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">고객 변심 (7일 이내)</td>
                  <td className="border border-gray-300 px-4 py-2">고객 부담 (왕복 배송비)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">교환 (상품 하자)</td>
                  <td className="border border-gray-300 px-4 py-2">회사 부담</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">교환 (고객 변심)</td>
                  <td className="border border-gray-300 px-4 py-2">고객 부담</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. 파트너 판매 상품 환불</h2>

          <p className="text-gray-700 mb-4">
            파트너사를 통해 구매한 상품의 경우,
            동일한 환불 정책이 적용됩니다.
          </p>

          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-700">
              <strong>참고:</strong> GOODZZ(굿쯔)은 통신판매업자로서
              모든 주문에 대한 환불 책임을 부담합니다.
              파트너사는 판매 채널 역할만 수행하며,
              환불 문의는 GOODZZ 고객센터로 연락 주시기 바랍니다.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. 맞춤 제작 상품 특별 약관</h2>

          <p className="text-gray-700 mb-4">
            WowPress 등 인쇄 주문 제작 상품의 경우:
          </p>

          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>
              <strong>제작 시작 전</strong>: 전액 환불 가능
            </li>
            <li>
              <strong>제작 시작 후</strong>: 취소/환불 불가
              <ul className="list-circle pl-6 mt-2 text-sm">
                <li>인쇄 작업 시작 후에는 원상복구 불가</li>
                <li>단, 당사 귀책 사유(인쇄 불량 등)의 경우 전액 환불 또는 재제작</li>
              </ul>
            </li>
            <li>
              <strong>디자인 시안 확인</strong>: 고객 확인 후 제작 시작
              <ul className="list-circle pl-6 mt-2 text-sm">
                <li>시안 확인 후 제작 시작 시 고객 책임</li>
                <li>색상 오차 ±10% 이내는 정상 범위</li>
              </ul>
            </li>
          </ul>

          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-sm text-gray-700">
              <strong>중요:</strong> 맞춤 제작 상품은 주문 즉시 인쇄소(WowPress)로 자동 전달되어
              제작에 착수합니다. 취소를 원하시는 경우 즉시 고객센터로 연락 주시기 바랍니다.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. 분쟁 해결</h2>

          <p className="text-gray-700 mb-4">
            환불/교환 관련 분쟁이 발생한 경우:
          </p>

          <div className="space-y-3">
            <div className="p-4 border border-gray-300 rounded-lg">
              <h3 className="font-semibold mb-2">1차: 고객센터 상담</h3>
              <p className="text-sm text-gray-700">
                전화: 02-1234-5678 (평일 9:00~18:00)<br />
                이메일: support@goodzz.co.kr
              </p>
            </div>

            <div className="p-4 border border-gray-300 rounded-lg">
              <h3 className="font-semibold mb-2">2차: 공정거래위원회 소비자분쟁해결기준</h3>
              <p className="text-sm text-gray-700">
                공정거래위원회 고시 제2024-0호에 따른 소비자 피해 보상
              </p>
            </div>

            <div className="p-4 border border-gray-300 rounded-lg">
              <h3 className="font-semibold mb-2">3차: 한국소비자원 분쟁조정</h3>
              <p className="text-sm text-gray-700">
                전화: 1372 (소비자상담센터)<br />
                홈페이지: <a href="https://www.kca.go.kr" target="_blank" rel="noopener" className="text-blue-600 hover:underline">www.kca.go.kr</a>
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">고객센터</h2>
          <div className="text-gray-700 space-y-2">
            <p><strong>운영 시간:</strong> 평일 09:00 ~ 18:00 (주말/공휴일 휴무)</p>
            <p><strong>전화:</strong> 02-1234-5678</p>
            <p><strong>이메일:</strong> support@goodzz.co.kr</p>
            <p><strong>주소:</strong> 서울시 강남구 테헤란로 123 GOODZZ</p>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
          <p>최종 업데이트: 2024년 1월 1일</p>
          <p className="mt-2">
            본 정책은 「전자상거래 등에서의 소비자보호에 관한 법률」,
            「소비자기본법」, 「공정거래위원회 소비자분쟁해결기준」에 따라 제정되었습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
