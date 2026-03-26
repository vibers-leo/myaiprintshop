import type { Metadata } from 'next';

/**
 * Embed Layout
 *
 * iframe에 최적화된 미니멀 레이아웃
 *
 * 특징:
 * - 헤더/푸터 없음
 * - 최소한의 여백
 * - postMessage 브릿지 포함 (부모 창과 통신)
 */

export const metadata: Metadata = {
  title: 'GOODZZ',
  description: 'AI 기반 프린트샵 서비스',
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="embed-mode bg-white antialiased">
        {/* Main Content */}
        <main className="min-h-screen p-4 pb-24">
          {children}
        </main>

        {/* 법적 필수 정보 푸터 (전자상거래법 제13조) */}
        <footer className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 px-4 py-3 text-xs text-gray-600 z-50">
          <div className="max-w-2xl mx-auto">
            <div className="font-medium mb-1">
              통신판매업자: GOODZZ(굿쯔) | 대표: 홍길동 | 사업자등록번호: 123-45-67890
            </div>
            <div className="flex flex-wrap gap-3 text-gray-500">
              <a href="/terms" target="_blank" className="hover:underline">이용약관</a>
              <span>|</span>
              <a href="/privacy" target="_blank" className="hover:underline">개인정보처리방침</a>
              <span>|</span>
              <a href="/refund" target="_blank" className="hover:underline">환불정책</a>
              <span>|</span>
              <span>고객센터: 02-1234-5678</span>
            </div>
          </div>
        </footer>

        {/* postMessage 브릿지 스크립트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 부모 창으로 메시지 전송 헬퍼 함수
              window.sendToParent = function(type, data) {
                if (window.parent !== window) {
                  window.parent.postMessage({ type: type, data: data }, '*');
                }
              };

              // 페이지 로드 완료 알림
              window.addEventListener('DOMContentLoaded', function() {
                window.sendToParent('embed.loaded', {
                  path: window.location.pathname,
                  timestamp: new Date().toISOString()
                });
              });

              // 높이 변경 시 부모에 알림 (iframe 자동 리사이징용)
              if (window.ResizeObserver) {
                const resizeObserver = new ResizeObserver(function(entries) {
                  const height = document.documentElement.scrollHeight;
                  window.sendToParent('embed.heightChanged', { height: height });
                });
                resizeObserver.observe(document.body);
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
