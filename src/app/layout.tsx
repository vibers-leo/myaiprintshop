import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: [
    { path: "../../public/fonts/Geist-Regular.woff2", weight: "400" },
    { path: "../../public/fonts/Geist-Medium.woff2", weight: "500" },
    { path: "../../public/fonts/Geist-SemiBold.woff2", weight: "600" },
    { path: "../../public/fonts/Geist-Bold.woff2", weight: "700" },
  ],
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: [
    { path: "../../public/fonts/GeistMono-Regular.woff2", weight: "400" },
    { path: "../../public/fonts/GeistMono-Medium.woff2", weight: "500" },
  ],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://goodzz.co.kr'),
  title: {
    default: "GOODZZ - 내 브랜드 굿즈, AI로 뚝딱",
    template: "%s | GOODZZ",
  },
  description: "디자이너 없이, 소량으로, 내 브랜드 굿즈를 만드세요. AI가 디자인하고, 굿쯔가 만들어드립니다.",
  keywords: ["AI 디자인", "커스텀 굿즈", "프린트샵", "명함 제작", "스티커 제작", "티셔츠 제작", "에코백", "AI 프린트", "GOODZZ", "굿즈 제작"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "GOODZZ",
    title: "GOODZZ - 내 브랜드 굿즈, AI로 뚝딱",
    description: "디자이너 없이, 소량으로, 내 브랜드 굿즈를 만드세요. AI가 디자인하고, 굿쯔가 만들어드립니다.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GOODZZ - 내 브랜드 굿즈, AI로 뚝딱",
    description: "디자이너 없이, 소량으로, 내 브랜드 굿즈를 만드세요. AI가 디자인하고, 굿쯔가 만들어드립니다.",
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
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard-dynamic-subset.css"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CartSync />
          {children}
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
