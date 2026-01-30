import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const siteUrl = "https://face-recognition.pages.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "얼굴 인식 출입 통제 시스템",
    template: "%s | 얼굴 인식 출입 통제",
  },
  description: "AI 기반 얼굴 인식으로 안전하고 빠른 출입 통제를 경험하세요. 실시간 얼굴 감지, 사용자 등록, 출입 기록 관리 기능을 제공합니다.",
  keywords: ["얼굴 인식", "출입 통제", "Face Recognition", "Access Control", "AI", "보안 시스템"],
  authors: [{ name: "stomx" }],
  creator: "stomx",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "얼굴 인식 출입 통제 시스템",
    title: "얼굴 인식 출입 통제 시스템",
    description: "AI 기반 얼굴 인식으로 안전하고 빠른 출입 통제를 경험하세요.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "얼굴 인식 출입 통제 시스템",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "얼굴 인식 출입 통제 시스템",
    description: "AI 기반 얼굴 인식으로 안전하고 빠른 출입 통제를 경험하세요.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console 등록 시 추가
    // google: "verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} ${outfit.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
