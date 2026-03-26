/**
 * WowPress API 클라이언트
 *
 * WowPress 인쇄소 API와 통신하는 HTTP 클라이언트
 *
 * API 문서: https://wowpress.co.kr/api/document
 * Base URL: https://api.wowpress.co.kr/api/v1/std
 *
 * 주요 기능:
 * 1. 상품 정보 조회 (prod_info)
 * 2. 주문 전송 (order_submit)
 * 3. 주문 상태 조회 (order_status)
 */

const WOWPRESS_API_BASE = 'https://api.wowpress.co.kr/api/v1/std';
const WOWPRESS_API_KEY = process.env.WOWPRESS_API_KEY;

/**
 * WowPress 상품 응답 타입
 */
export interface WowPressProductResponse {
  prodno: string;           // 상품 번호
  prodname: string;         // 상품명
  category: string;         // 카테고리
  basePrice: number;        // 기본 가격
  spec: any;                // 상품 스펙 (9-section)
  thumbnail?: string;       // 썸네일 이미지 URL
}

/**
 * WowPress 주문 제출 응답
 */
export interface WowPressOrderSubmitResponse {
  orderno: string;          // WowPress 주문 번호
  status: string;           // 주문 상태
  message?: string;         // 메시지
}

/**
 * WowPress 주문 상태 응답
 */
export interface WowPressOrderStatusResponse {
  orderno: string;          // 주문 번호
  status: 'pending' | 'confirmed' | 'printing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;  // 송장 번호
  carrier?: string;         // 택배사
  updatedAt: string;        // 마지막 업데이트 시간
}

/**
 * WowPress API 클라이언트
 */
export class WowPressClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    if (!WOWPRESS_API_KEY) {
      console.warn('⚠️  WOWPRESS_API_KEY가 설정되지 않았습니다');
    }

    this.apiKey = WOWPRESS_API_KEY || '';
    this.baseUrl = WOWPRESS_API_BASE;
  }

  /**
   * 상품 정보 조회
   *
   * GET /api/v1/std/prod_info/{prodno}
   *
   * @param prodno - WowPress 상품 번호
   * @returns 상품 정보
   */
  async getProduct(prodno: string): Promise<WowPressProductResponse> {
    const url = `${this.baseUrl}/prod_info/${prodno}`;

    console.log(`🔍 Fetching WowPress product: ${prodno}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        // 캐시 설정 (1시간)
        next: {
          revalidate: 3600,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `WowPress API error (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();

      console.log(`✅ Product fetched: ${data.prodname}`);

      return data;
    } catch (error) {
      console.error(`❌ Failed to fetch WowPress product ${prodno}:`, error);
      throw error;
    }
  }

  /**
   * 주문 제출
   *
   * POST /api/v1/std/order_submit
   *
   * @param orderData - WowPress 주문 데이터 (9-section spec)
   * @returns 주문 번호
   */
  async submitOrder(orderData: any): Promise<WowPressOrderSubmitResponse> {
    const url = `${this.baseUrl}/order_submit`;

    console.log('📤 Submitting order to WowPress...');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;

        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        throw new Error(
          `WowPress order submission failed (${response.status}): ${
            errorData.message || errorText
          }`
        );
      }

      const data = await response.json();

      console.log(`✅ Order submitted: ${data.orderno}`);

      return data;
    } catch (error) {
      console.error('❌ Failed to submit order to WowPress:', error);
      throw error;
    }
  }

  /**
   * 주문 상태 조회
   *
   * GET /api/v1/std/order_status/{orderno}
   *
   * @param orderno - WowPress 주문 번호
   * @returns 주문 상태
   */
  async getOrderStatus(orderno: string): Promise<WowPressOrderStatusResponse> {
    const url = `${this.baseUrl}/order_status/${orderno}`;

    console.log(`🔍 Checking WowPress order status: ${orderno}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch order status (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();

      console.log(`✅ Order status: ${data.status}`);

      return data;
    } catch (error) {
      console.error(`❌ Failed to check order status ${orderno}:`, error);
      throw error;
    }
  }

  /**
   * 상품 목록 조회 (배치)
   *
   * 여러 상품을 한 번에 조회
   *
   * @param prodnos - 상품 번호 배열
   * @returns 상품 정보 배열
   */
  async getProducts(prodnos: string[]): Promise<WowPressProductResponse[]> {
    console.log(`🔍 Fetching ${prodnos.length} WowPress products in batch...`);

    // 병렬로 조회 (최대 5개씩)
    const batchSize = 5;
    const results: WowPressProductResponse[] = [];

    for (let i = 0; i < prodnos.length; i += batchSize) {
      const batch = prodnos.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((prodno) => this.getProduct(prodno))
      );
      results.push(...batchResults);
    }

    console.log(`✅ Batch fetch completed: ${results.length} products`);

    return results;
  }

  /**
   * API 연결 테스트
   *
   * @returns API 연결 성공 여부
   */
  async testConnection(): Promise<boolean> {
    try {
      // 테스트용 상품 번호로 API 연결 확인
      // 실제 상품 번호는 WowPress에서 제공받아야 함
      await this.getProduct('TEST_001');
      return true;
    } catch (error) {
      console.error('WowPress API connection test failed:', error);
      return false;
    }
  }
}

/**
 * 싱글톤 인스턴스
 */
let wowPressClient: WowPressClient | null = null;

/**
 * WowPress 클라이언트 인스턴스 가져오기
 */
export function getWowPressClient(): WowPressClient {
  if (!wowPressClient) {
    wowPressClient = new WowPressClient();
  }
  return wowPressClient;
}
