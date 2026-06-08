import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { PromoStrip } from "@/components/layout/PromoStrip";
import { AppBar } from "@/components/layout/AppBar";
import { TopTabs } from "@/components/layout/TopTabs";
import { Footer } from "@/components/layout/Footer";

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
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>
        <Providers>
          <PromoStrip />
          <AppBar />
          <TopTabs />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
