import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침 | GOODZZ',
  description: 'GOODZZ 개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">개인정보처리방침</h1>

      <div className="prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. 개인정보의 수집 및 이용 목적</h2>
          <p className="text-gray-700 mb-4">
            회사는 다음의 목적을 위하여 개인정보를 처리합니다.
            처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
            이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라
            별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>회원 가입 및 관리: 회원 가입의사 확인, 회원자격 유지·관리, 서비스 부정이용 방지</li>
            <li>상품/서비스 제공: 주문/배송 처리, 대금 결제·정산, 고객 상담</li>
            <li>마케팅 및 광고: 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 정보 제공</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. 수집하는 개인정보 항목</h2>
          <div className="text-gray-700 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">필수 항목</h3>
              <ul className="list-disc pl-6">
                <li>이메일, 비밀번호</li>
                <li>이름, 전화번호, 배송지 주소</li>
                <li>결제정보 (결제대행사를 통해 처리)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">선택 항목</h3>
              <ul className="list-disc pl-6">
                <li>생년월일, 성별</li>
                <li>관심 분야, 선호도</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">자동 수집 항목</h3>
              <ul className="list-disc pl-6">
                <li>접속 IP, 쿠키, 방문 일시, 서비스 이용 기록</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. 개인정보의 보유 및 이용 기간</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>회원 탈퇴 시까지 (단, 관련 법령에 따라 일정 기간 보관)</li>
            <li>전자상거래법에 따른 보관:
              <ul className="list-circle pl-6 mt-2">
                <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
              </ul>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. 개인정보의 제3자 제공</h2>
          <p className="text-gray-700 mb-4">
            회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
            다만, 다음의 경우에는 예외로 합니다:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            <li>통계작성, 학술연구 또는 시장조사를 위하여 필요한 경우로서 특정 개인을 식별할 수 없는 형태로 제공하는 경우</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. 개인정보처리의 위탁</h2>
          <p className="text-gray-700 mb-4">
            회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다:
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">수탁업체</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">위탁업무 내용</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">PortOne</td>
                  <td className="border border-gray-300 px-4 py-2">결제 대행 및 정산</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">WowPress</td>
                  <td className="border border-gray-300 px-4 py-2">인쇄물 제작 및 배송</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Google Cloud / Firebase</td>
                  <td className="border border-gray-300 px-4 py-2">데이터 저장 및 호스팅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. 정보주체의 권리·의무 및 행사방법</h2>
          <p className="text-gray-700 mb-4">
            이용자는 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>개인정보 열람 요구</li>
            <li>개인정보 정정 요구</li>
            <li>개인정보 삭제 요구</li>
            <li>개인정보 처리 정지 요구</li>
          </ul>
          <p className="text-gray-700 mt-4">
            권리 행사는 서면, 전화, 이메일 등을 통하여 하실 수 있으며,
            회사는 이에 대해 지체 없이 조치하겠습니다.
          </p>
        </section>

        <section className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">개인정보 보호책임자</h2>
          <div className="text-gray-700 space-y-2">
            <p><strong>이름:</strong> 홍길동</p>
            <p><strong>직책:</strong> 개인정보보호책임자</p>
            <p><strong>전화:</strong> 02-1234-5678</p>
            <p><strong>이메일:</strong> privacy@goodzz.co.kr</p>
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
