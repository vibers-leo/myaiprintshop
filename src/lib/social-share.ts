/**
 * 소셜 공유 유틸리티
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://goodzz.co.kr';

export interface ShareData {
  title: string;
  description: string;
  imageUrl?: string;
  url: string;
}

// 카카오톡 공유
export function shareToKakao(data: ShareData) {
  const Kakao = (window as any).Kakao;
  if (!Kakao) {
    // Kakao SDK 미로드 시 URL 공유 폴백
    shareViaClipboard(data.url);
    return;
  }

  if (!Kakao.isInitialized()) {
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (kakaoKey) {
      Kakao.init(kakaoKey);
    } else {
      shareViaClipboard(data.url);
      return;
    }
  }

  Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl || `${SITE_URL}/og-image.png`,
      link: {
        mobileWebUrl: data.url,
        webUrl: data.url,
      },
    },
    buttons: [
      {
        title: '상품 보기',
        link: {
          mobileWebUrl: data.url,
          webUrl: data.url,
        },
      },
    ],
  });
}

// 트위터(X) 공유
export function shareToTwitter(data: ShareData) {
  const text = `${data.title} - ${data.description}`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(data.url)}`;
  window.open(url, '_blank', 'width=550,height=420');
}

// 페이스북 공유
export function shareToFacebook(data: ShareData) {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`;
  window.open(url, '_blank', 'width=550,height=420');
}

// URL 클립보드 복사
export async function shareViaClipboard(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
}

// Web Share API (모바일)
export async function shareViaWebAPI(data: ShareData) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: data.title,
        text: data.description,
        url: data.url,
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
