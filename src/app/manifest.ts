import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GOODZZ — 사진 한 장으로 나만의 굿즈를',
    short_name: 'GOODZZ',
    description: 'AI가 내 사진을 굿즈로 만들어드립니다. 명함, 스티커, 포스터, 에코백까지.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#8b5cf6',
    icons: [
      { src: '/favicon.png', sizes: '192x192', type: 'image/png' },
      { src: '/favicon.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
