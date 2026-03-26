/**
 * GOODZZ Buy Button SDK
 *
 * 파트너 웹사이트에 구매 버튼을 임베드하는 JavaScript SDK
 *
 * 사용 예시:
 * ```html
 * <script src="https://goodzz.co.kr/sdk/buy-button.min.js"></script>
 * <div id="buy-button"></div>
 * <script>
 *   Goodzz.createBuyButton({
 *     apiKey: 'sk_live_xxx',
 *     productId: 'prod_123',
 *     containerId: 'buy-button',
 *     buttonText: '지금 구매',
 *     onPaymentSuccess: (order) => console.log('주문 완료:', order.id),
 *   });
 * </script>
 * ```
 */

interface BuyButtonConfig {
  // 필수 설정
  apiKey: string;            // API 키
  productId: string;         // 상품 ID
  containerId: string;       // 버튼을 렌더링할 HTML 요소 ID

  // 선택 설정
  options?: Record<string, any>;  // 상품 옵션 (사이즈, 색상 등)
  buttonText?: string;            // 버튼 텍스트 (기본값: '지금 구매')
  buttonStyle?: {                 // 버튼 스타일 커스터마이징
    backgroundColor?: string;
    color?: string;
    padding?: string;
    borderRadius?: string;
    fontSize?: string;
    fontWeight?: string;
    border?: string;
    cursor?: string;
  };

  // 콜백 함수
  onPaymentSuccess?: (order: any) => void;  // 결제 성공 시
  onPaymentError?: (error: Error) => void;  // 결제 실패 시
  onSessionError?: (error: Error) => void;  // 세션 생성 실패 시
}

/**
 * Buy Button SDK 클래스
 */
class BuyButtonSDK {
  private config: BuyButtonConfig;
  private popup: Window | null = null;
  private modal: HTMLElement | null = null;

  constructor(config: BuyButtonConfig) {
    // 필수 파라미터 검증
    if (!config.apiKey) {
      throw new Error('GOODZZ SDK: apiKey is required');
    }
    if (!config.productId) {
      throw new Error('GOODZZ SDK: productId is required');
    }
    if (!config.containerId) {
      throw new Error('GOODZZ SDK: containerId is required');
    }

    this.config = config;
    this.render();
    this.setupMessageListener();
  }

  /**
   * 버튼 렌더링
   */
  private render(): void {
    const container = document.getElementById(this.config.containerId);
    if (!container) {
      throw new Error(
        `GOODZZ SDK: Container element #${this.config.containerId} not found`
      );
    }

    // 버튼 생성
    const button = document.createElement('button');
    button.textContent = this.config.buttonText || '지금 구매';
    button.className = 'goodzz-buy-button';

    // 기본 스타일 적용
    button.style.cssText = `
      background-color: #3b82f6;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;
    `;

    // 커스텀 스타일 적용
    if (this.config.buttonStyle) {
      Object.assign(button.style, this.config.buttonStyle);
    }

    // 호버 효과
    button.addEventListener('mouseenter', () => {
      if (!this.config.buttonStyle?.backgroundColor) {
        button.style.backgroundColor = '#2563eb';
      }
    });
    button.addEventListener('mouseleave', () => {
      if (!this.config.buttonStyle?.backgroundColor) {
        button.style.backgroundColor = '#3b82f6';
      }
    });

    // 클릭 이벤트
    button.addEventListener('click', () => this.openPaymentPopup());

    // 컨테이너에 버튼 추가
    container.appendChild(button);
  }

  /**
   * 결제 팝업 열기
   */
  private async openPaymentPopup(): Promise<void> {
    try {
      // 1. 세션 생성
      const sessionData = await this.createSession();

      if (!sessionData.success) {
        throw new Error(sessionData.error || 'Failed to create session');
      }

      const checkoutUrl = this.buildCheckoutUrl(sessionData.checkoutUrl);

      // 2. 팝업 열기 시도
      this.popup = window.open(
        checkoutUrl,
        'goodzz_payment',
        'width=600,height=800,scrollbars=yes,resizable=yes'
      );

      // 3. 팝업 차단 시 iframe 모달 대체
      if (!this.popup || this.popup.closed || typeof this.popup.closed === 'undefined') {
        console.warn('GOODZZ SDK: Popup blocked, falling back to iframe modal');
        this.showIframeModal(checkoutUrl);
      }
    } catch (error) {
      console.error('GOODZZ SDK: Failed to open payment popup:', error);
      if (this.config.onSessionError) {
        this.config.onSessionError(error as Error);
      }
    }
  }

  /**
   * 세션 생성 API 호출
   */
  private async createSession(): Promise<any> {
    const apiUrl = this.getApiUrl('/api/sdk/session/create');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: this.config.apiKey,
        productId: this.config.productId,
        options: this.config.options || {},
      }),
    });

    return response.json();
  }

  /**
   * 체크아웃 URL 생성
   */
  private buildCheckoutUrl(checkoutPath: string): string {
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}${checkoutPath}`;
  }

  /**
   * API URL 생성
   */
  private getApiUrl(path: string): string {
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}${path}`;
  }

  /**
   * 기본 URL 반환 (현재 스크립트 URL 기반)
   */
  private getBaseUrl(): string {
    // 프로덕션: 스크립트 URL에서 도메인 추출
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src;
      if (src && src.includes('buy-button')) {
        const url = new URL(src);
        return `${url.protocol}//${url.host}`;
      }
    }

    // 개발: localhost 또는 현재 페이지 도메인 사용
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:3300';
    }

    return window.location.origin;
  }

  /**
   * iframe 모달 표시 (팝업 차단 시 대체)
   */
  private showIframeModal(url: string): void {
    // 모달 오버레이 생성
    this.modal = document.createElement('div');
    this.modal.className = 'goodzz-modal';
    this.modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;

    // iframe 컨테이너 생성
    const iframeContainer = document.createElement('div');
    iframeContainer.style.cssText = `
      position: relative;
      width: 100%;
      max-width: 600px;
      height: 90%;
      max-height: 800px;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    `;

    // 닫기 버튼 생성
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: white;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 24px;
      cursor: pointer;
      z-index: 1000000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    `;
    closeButton.addEventListener('click', () => this.closeModal());

    // iframe 생성
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `;

    iframeContainer.appendChild(closeButton);
    iframeContainer.appendChild(iframe);
    this.modal.appendChild(iframeContainer);

    // 모달 외부 클릭 시 닫기
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    document.body.appendChild(this.modal);
  }

  /**
   * 모달 닫기
   */
  private closeModal(): void {
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
      this.modal = null;
    }
  }

  /**
   * postMessage 리스너 설정
   * 결제 팝업/iframe에서 메시지 수신
   */
  private setupMessageListener(): void {
    window.addEventListener('message', (event) => {
      // 보안: 오리진 검증
      const trustedOrigins = [
        'https://goodzz.co.kr',
        'https://goodzz.vercel.app',
        'http://localhost:3300',
      ];

      if (!trustedOrigins.some(origin => event.origin.includes(origin))) {
        return;
      }

      // 메시지 타입 검증
      if (!event.data || typeof event.data.type !== 'string') {
        return;
      }

      // 결제 성공
      if (event.data.type === 'payment.success') {
        if (this.popup) this.popup.close();
        this.closeModal();

        if (this.config.onPaymentSuccess) {
          this.config.onPaymentSuccess(event.data.order);
        }
      }

      // 결제 실패
      else if (event.data.type === 'payment.error') {
        if (this.popup) this.popup.close();
        this.closeModal();

        if (this.config.onPaymentError) {
          this.config.onPaymentError(new Error(event.data.error));
        }
      }

      // 결제 취소
      else if (event.data.type === 'payment.cancel') {
        if (this.popup) this.popup.close();
        this.closeModal();
      }
    });
  }
}

/**
 * 전역 API 노출
 */
declare global {
  interface Window {
    Goodzz: {
      createBuyButton: (config: BuyButtonConfig) => BuyButtonSDK;
    };
  }
}

// 전역 객체에 SDK API 추가
if (typeof window !== 'undefined') {
  (window as any).Goodzz = {
    createBuyButton: (config: BuyButtonConfig) => new BuyButtonSDK(config),
  };

  console.log('✅ GOODZZ Buy Button SDK loaded');
}

export { BuyButtonSDK };
export type { BuyButtonConfig };
