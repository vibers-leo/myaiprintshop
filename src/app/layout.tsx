import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";



export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://goodzz.co.kr'),
  title: {
    default: "GOODZZ - 내 브랜드 굿즈, AI로 뚝딱",
    template: "%s | GOODZZ",
  },
  description: "디자이너 없이, 소량으로, 내 브랜드 굿즈를 만드세요. AI가 디자인하고, GOODZZ가 만들어드립니다.",
  keywords: ["AI 디자인", "커스텀 굿즈", "프린트샵", "명함 제작", "스티커 제작", "티셔츠 제작", "에코백", "AI 프린트", "GOODZZ", "굿즈 제작"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "GOODZZ",
    title: "GOODZZ - 내 브랜드 굿즈, AI로 뚝딱",
    description: "디자이너 없이, 소량으로, 내 브랜드 굿즈를 만드세요. AI가 디자인하고, GOODZZ가 만들어드립니다.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GOODZZ - 내 브랜드 굿즈, AI로 뚝딱",
    description: "디자이너 없이, 소량으로, 내 브랜드 굿즈를 만드세요. AI가 디자인하고, GOODZZ가 만들어드립니다.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { Toaster } from 'sonner';
import { AuthProvider } from "@/context/AuthContext";
import CartSync from "@/components/CartSync";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_two@1.0/NanumSquareRound.woff"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <CartSync />
          {children}
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
