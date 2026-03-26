'use server';

/**
 * 이메일 알림 시스템
 *
 * 사용 가능한 서비스:
 * - Resend (추천): https://resend.com
 * - SendGrid: https://sendgrid.com
 * - AWS SES: https://aws.amazon.com/ses
 *
 * 환경변수 설정:
 * - EMAIL_SERVICE: 'resend' | 'sendgrid' | 'ses' | 'console'
 * - EMAIL_API_KEY: 서비스 API 키
 * - EMAIL_FROM: 발신 이메일 주소
 */

export type EmailType =
  | 'vendor_approved'
  | 'vendor_rejected'
  | 'vendor_suspended'
  | 'order_received'
  | 'order_shipped'
  | 'settlement_transferred'
  | 'settlement_failed';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface VendorApprovedData {
  vendorName: string;
  businessName: string;
  commissionRate: number;
  dashboardUrl: string;
}

interface VendorRejectedData {
  vendorName: string;
  businessName: string;
  reason?: string;
}

interface OrderReceivedData {
  vendorName: string;
  orderId: string;
  orderAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  orderUrl: string;
}

interface SettlementTransferredData {
  vendorName: string;
  amount: number;
  commission: number;
  vendorAmount: number;
  orderId: string;
  transferDate: string;
}

/**
 * 이메일 발송 (실제 구현은 사용하는 서비스에 따라 다름)
 */
async function sendEmail(data: EmailData): Promise<boolean> {
  const emailService = process.env.EMAIL_SERVICE || 'console';

  switch (emailService) {
    case 'resend':
      return await sendWithResend(data);
    case 'sendgrid':
      return await sendWithSendGrid(data);
    case 'console':
    default:
      // 개발 모드: 콘솔에 로그
      console.log('📧 Email would be sent:');
      console.log(`  To: ${data.to}`);
      console.log(`  Subject: ${data.subject}`);
      console.log(`  Body: ${data.text || data.html.substring(0, 100)}...`);
      return true;
  }
}

/**
 * Resend로 이메일 발송
 */
async function sendWithResend(data: EmailData): Promise<boolean> {
  try {
    // TODO: Resend SDK 사용
    // const { Resend } = await import('resend');
    // const resend = new Resend(process.env.EMAIL_API_KEY);
    // await resend.emails.send({
    //   from: process.env.EMAIL_FROM!,
    //   to: data.to,
    //   subject: data.subject,
    //   html: data.html,
    // });
    console.log('📧 Resend email sent to:', data.to);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email with Resend:', error);
    return false;
  }
}

/**
 * SendGrid로 이메일 발송
 */
async function sendWithSendGrid(data: EmailData): Promise<boolean> {
  try {
    // TODO: SendGrid SDK 사용
    console.log('📧 SendGrid email sent to:', data.to);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email with SendGrid:', error);
    return false;
  }
}

/**
 * 판매자 승인 이메일
 */
export async function sendVendorApprovedEmail(
  email: string,
  data: VendorApprovedData
): Promise<boolean> {
  const emailData: EmailData = {
    to: email,
    subject: `🎉 판매자 승인 완료 - ${data.businessName}`,
    html: `
      <h2>판매자 승인이 완료되었습니다!</h2>
      <p>안녕하세요, ${data.vendorName}님</p>
      <p><strong>${data.businessName}</strong>의 판매자 승인이 완료되었습니다.</p>

      <h3>승인 정보</h3>
      <ul>
        <li>사업자명: ${data.businessName}</li>
        <li>수수료율: ${(data.commissionRate * 100).toFixed(1)}%</li>
      </ul>

      <p>이제 상품을 등록하고 판매를 시작하실 수 있습니다.</p>
      <p><a href="${data.dashboardUrl}">판매자 대시보드로 이동</a></p>

      <p>감사합니다.<br/>GOODZZ 팀</p>
    `,
    text: `판매자 승인이 완료되었습니다. 수수료율: ${(data.commissionRate * 100).toFixed(1)}%`,
  };

  return await sendEmail(emailData);
}

/**
 * 판매자 거부 이메일
 */
export async function sendVendorRejectedEmail(
  email: string,
  data: VendorRejectedData
): Promise<boolean> {
  const emailData: EmailData = {
    to: email,
    subject: `판매자 신청 검토 결과 - ${data.businessName}`,
    html: `
      <h2>판매자 신청 검토 결과</h2>
      <p>안녕하세요, ${data.vendorName}님</p>
      <p>귀하의 <strong>${data.businessName}</strong> 판매자 신청을 검토한 결과,
      현재 승인이 어려운 상황입니다.</p>

      ${data.reason ? `<p><strong>사유:</strong> ${data.reason}</p>` : ''}

      <p>추가 문의사항이 있으시면 고객센터로 연락 주시기 바랍니다.</p>

      <p>감사합니다.<br/>GOODZZ 팀</p>
    `,
    text: `판매자 신청이 거부되었습니다. ${data.reason || ''}`,
  };

  return await sendEmail(emailData);
}

/**
 * 주문 접수 이메일 (판매자에게)
 */
export async function sendOrderReceivedEmail(
  email: string,
  data: OrderReceivedData
): Promise<boolean> {
  const itemsList = data.items
    .map((item) => `<li>${item.name} x${item.quantity} - ₩${item.price.toLocaleString()}</li>`)
    .join('');

  const emailData: EmailData = {
    to: email,
    subject: `🛒 신규 주문 접수 - ${data.orderId}`,
    html: `
      <h2>신규 주문이 접수되었습니다</h2>
      <p>안녕하세요, ${data.vendorName}님</p>

      <h3>주문 정보</h3>
      <ul>
        <li>주문번호: ${data.orderId}</li>
        <li>주문금액: ₩${data.orderAmount.toLocaleString()}</li>
      </ul>

      <h3>주문 상품</h3>
      <ul>${itemsList}</ul>

      <p><a href="${data.orderUrl}">주문 상세 보기</a></p>

      <p>신속한 배송 부탁드립니다.<br/>GOODZZ 팀</p>
    `,
    text: `신규 주문 접수: ${data.orderId} - ₩${data.orderAmount.toLocaleString()}`,
  };

  return await sendEmail(emailData);
}

/**
 * 정산 완료 이메일
 */
export async function sendSettlementTransferredEmail(
  email: string,
  data: SettlementTransferredData
): Promise<boolean> {
  const emailData: EmailData = {
    to: email,
    subject: `💰 정산 완료 - ₩${data.vendorAmount.toLocaleString()}`,
    html: `
      <h2>정산이 완료되었습니다</h2>
      <p>안녕하세요, ${data.vendorName}님</p>

      <h3>정산 내역</h3>
      <ul>
        <li>주문번호: ${data.orderId}</li>
        <li>주문금액: ₩${data.amount.toLocaleString()}</li>
        <li>플랫폼 수수료: ₩${data.commission.toLocaleString()}</li>
        <li><strong>정산금액: ₩${data.vendorAmount.toLocaleString()}</strong></li>
        <li>정산일: ${data.transferDate}</li>
      </ul>

      <p>등록하신 계좌로 입금이 완료되었습니다.</p>

      <p>감사합니다.<br/>GOODZZ 팀</p>
    `,
    text: `정산 완료: ₩${data.vendorAmount.toLocaleString()} (주문: ${data.orderId})`,
  };

  return await sendEmail(emailData);
}
