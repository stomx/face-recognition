import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "얼굴 인식 출입 통제 시스템",
  description: "Face Recognition Access Control System - 얼굴 인식 기반 사용자 등록 및 출입 통제 프로토타입",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
