/**
 * MyAIPrintShop Enhanced Product Card Widget
 * Version: 2.0.0
 *
 * 기존 product-showcase.js의 향상된 버전
 * - 구매 버튼 추가
 * - 장바구니 연동 지원
 * - 직접 결제 지원
 *
 * Usage:
 * <div id="product-card"></div>
 * <script src="https://myaiprintshop.com/widgets/product-card.js"></script>
 * <script>
 *   MyAIPrintShop.createProductCard({
 *     apiKey: 'sk_live_xxx',
 *     productId: 'prod_123',
 *     containerId: 'product-card',
 *
 *     // 옵션 1: 장바구니 콜백 (파트너의 장바구니 시스템 사용)
 *     enableBuyButton: true,
 *     onAddToCart: (product, options) => {
 *       myCart.add(product, options);
 *     },
 *
 *     // 옵션 2: 직접 결제 (MyAIPrintShop 결제 시스템 사용)
 *     enableDirectCheckout: true,
 *     onCheckoutComplete: (order) => {
 *       console.log('Order completed:', order.id);
 *     },
 *   });
 * </script>
 */

(function () {
  'use strict';

  const ProductCardWidget = {
    /**
     * 상품 카드 생성
     */
    createProductCard: function (config) {
      // 필수 파라미터 검증
      if (!config.apiKey) {
        throw new Error('MyAIPrintShop Widget: API key is required');
      }
      if (!config.productId) {
        throw new Error('MyAIPrintShop Widget: productId is required');
      }
      if (!config.containerId) {
        throw new Error('MyAIPrintShop Widget: containerId is required');
      }

      const container = document.getElementById(config.containerId);
      if (!container) {
        throw new Error(`MyAIPrintShop Widget: Container #${config.containerId} not found`);
      }

      // 스타일 주입
      this.injectStyles();

      // 상품 로드
      this.loadProduct(config, container);
    },

    /**
     * CSS 스타일 주입
     */
    injectStyles: function () {
      if (document.getElementById('myaiprintshop-card-styles')) {
        return;
      }

      const style = document.createElement('style');
      style.id = 'myaiprintshop-card-styles';
      style.textContent = `
        .myaiprintshop-card {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
          max-width: 400px;
        }
        .myaiprintshop-card-image {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
        }
        .myaiprintshop-card-content {
          padding: 20px;
        }
        .myaiprintshop-card-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #1f2937;
        }
        .myaiprintshop-card-description {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 16px 0;
          line-height: 1.5;
        }
        .myaiprintshop-card-price {
          font-size: 24px;
          font-weight: 700;
          color: #3b82f6;
          margin: 0 0 16px 0;
        }
        .myaiprintshop-card-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        .myaiprintshop-card-stars {
          color: #fbbf24;
          font-size: 14px;
        }
        .myaiprintshop-card-reviews {
          font-size: 14px;
          color: #6b7280;
        }
        .myaiprintshop-card-button {
          width: 100%;
          padding: 14px 24px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .myaiprintshop-card-button:hover {
          background: #2563eb;
        }
        .myaiprintshop-card-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .myaiprintshop-card-loading {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }
        .myaiprintshop-card-error {
          text-align: center;
          padding: 40px;
          color: #ef4444;
        }
      `;
      document.head.appendChild(style);
    },

    /**
     * 상품 데이터 로드
     */
    loadProduct: async function (config, container) {
      // 로딩 표시
      container.innerHTML = '<div class="myaiprintshop-card-loading">로딩 중...</div>';

      try {
        // API 호출
        const baseUrl = this.getApiBaseUrl();
        const response = await fetch(
          `${baseUrl}/api/public/v1/products/${config.productId}`,
          {
            headers: {
              'x-api-key': config.apiKey,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success || !data.product) {
          throw new Error('Product not found');
        }

        // 상품 카드 렌더링
        this.renderProductCard(data.product, config, container);
      } catch (error) {
        console.error('Failed to load product:', error);
        container.innerHTML = `
          <div class="myaiprintshop-card-error">
            ❌ 상품을 불러올 수 없습니다<br>
            <small>${error.message}</small>
          </div>
        `;
      }
    },

    /**
     * 상품 카드 렌더링
     */
    renderProductCard: function (product, config, container) {
      // 별점 HTML 생성
      const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
          stars.push(i < Math.floor(rating) ? '★' : '☆');
        }
        return stars.join('');
      };

      // 카드 HTML
      const cardHTML = `
        <div class="myaiprintshop-card">
          ${product.thumbnail ? `
            <img
              src="${product.thumbnail}"
              alt="${product.name}"
              class="myaiprintshop-card-image"
            />
          ` : ''}

          <div class="myaiprintshop-card-content">
            <h3 class="myaiprintshop-card-title">${product.name}</h3>

            ${product.description ? `
              <p class="myaiprintshop-card-description">
                ${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}
              </p>
            ` : ''}

            <div class="myaiprintshop-card-price">
              ${product.price.toLocaleString()}원
            </div>

            ${product.rating > 0 ? `
              <div class="myaiprintshop-card-rating">
                <span class="myaiprintshop-card-stars">${renderStars(product.rating)}</span>
                <span class="myaiprintshop-card-reviews">
                  ${product.rating.toFixed(1)} (${product.reviewCount || 0}개 리뷰)
                </span>
              </div>
            ` : ''}

            ${config.enableBuyButton || config.enableDirectCheckout ? `
              <button
                id="myaiprintshop-buy-button-${product.id}"
                class="myaiprintshop-card-button"
              >
                ${config.buyButtonText || '지금 구매'}
              </button>
            ` : ''}
          </div>
        </div>
      `;

      container.innerHTML = cardHTML;

      // 구매 버튼 이벤트 리스너 등록
      if (config.enableBuyButton || config.enableDirectCheckout) {
        const button = document.getElementById(`myaiprintshop-buy-button-${product.id}`);
        if (button) {
          button.addEventListener('click', () => {
            this.handleBuyClick(product, config);
          });
        }
      }
    },

    /**
     * 구매 버튼 클릭 처리
     */
    handleBuyClick: async function (product, config) {
      const button = document.getElementById(`myaiprintshop-buy-button-${product.id}`);
      if (button) {
        button.disabled = true;
        button.textContent = '처리 중...';
      }

      try {
        // 옵션 1: 장바구니 콜백 (파트너의 시스템)
        if (config.onAddToCart) {
          const options = config.options || { quantity: 1 };
          config.onAddToCart(product, options);

          if (button) {
            button.textContent = '장바구니에 추가됨!';
            setTimeout(() => {
              button.disabled = false;
              button.textContent = config.buyButtonText || '지금 구매';
            }, 2000);
          }
          return;
        }

        // 옵션 2: 직접 결제 (MyAIPrintShop 시스템)
        if (config.enableDirectCheckout) {
          // 세션 생성
          const baseUrl = this.getApiBaseUrl();
          const response = await fetch(`${baseUrl}/api/sdk/session/create`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              apiKey: config.apiKey,
              productId: product.id,
              options: config.options || { quantity: 1 },
            }),
          });

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || '세션 생성 실패');
          }

          // 결제 페이지로 이동
          window.location.href = `${baseUrl}${data.checkoutUrl}`;
        }
      } catch (error) {
        console.error('Purchase failed:', error);
        alert('구매 중 오류가 발생했습니다. 다시 시도해주세요.');

        if (button) {
          button.disabled = false;
          button.textContent = config.buyButtonText || '지금 구매';
        }
      }
    },

    /**
     * API Base URL 가져오기
     */
    getApiBaseUrl: function () {
      // 스크립트 URL에서 도메인 추출
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].src;
        if (src && src.includes('product-card.js')) {
          const url = new URL(src);
          return `${url.protocol}//${url.host}`;
        }
      }

      // 개발 환경
      if (window.location.hostname === 'localhost') {
        return 'http://localhost:3300';
      }

      return 'https://myaiprintshop.com';
    },
  };

  // 전역 API 노출
  window.MyAIPrintShop = window.MyAIPrintShop || {};
  window.MyAIPrintShop.createProductCard = ProductCardWidget.createProductCard.bind(ProductCardWidget);

  console.log('✅ MyAIPrintShop Product Card Widget loaded');
})();
