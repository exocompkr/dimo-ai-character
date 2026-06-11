import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

export const metadata: Metadata = {
  title: "디모 — AI 캐릭터 네임스티커",
  description:
    "내 아이만의 캐릭터로 세상에 하나뿐인 네임스티커를 만들어보세요. AI가 사진을 캐릭터로 변환해 드립니다.",
  keywords: ["네임스티커", "유아동", "이름표", "디모", "AI 캐릭터"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard (기본 UI 폰트) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        {/* 스티커 편집용 폰트들 (Google Fonts) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&family=Nanum+Myeongjo:wght@400;700;800&family=Nanum+Pen+Script&family=Gamja+Flower&family=Jua&family=Black+Han+Sans&family=Do+Hyeon&family=Gaegu:wght@400;700&family=Hi+Melody&family=Dokdo&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
