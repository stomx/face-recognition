import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "사용자 등록",
  description: "얼굴 인식 출입 통제 시스템에 새로운 사용자를 등록하세요. 카메라로 얼굴을 촬영하여 빠르게 등록할 수 있습니다.",
  openGraph: {
    title: "사용자 등록 | 얼굴 인식 출입 통제",
    description: "얼굴 인식 출입 통제 시스템에 새로운 사용자를 등록하세요.",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
