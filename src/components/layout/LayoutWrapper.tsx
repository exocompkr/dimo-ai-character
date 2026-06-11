"use client";

import { usePathname } from "next/navigation";
import { PromoStrip } from "./PromoStrip";
import { AppBar } from "./AppBar";
import { TopTabs } from "./TopTabs";
import { Footer } from "./Footer";

/**
 * 조건부 레이아웃 래퍼
 * - 스티커 편집기 페이지에서는 TopTabs, Footer 숨김
 * - 다른 페이지에서는 전체 레이아웃 표시
 */
export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEditorPage = pathname === "/sticker-editor";

  return (
    <div className="flex min-h-screen flex-col">
      <PromoStrip />
      <AppBar />
      <TopTabs />
      <main className={isEditorPage ? "flex flex-1 flex-col overflow-hidden" : ""}>
        {children}
      </main>
      {!isEditorPage && <Footer />}
    </div>
  );
}
