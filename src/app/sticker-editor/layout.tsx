import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "스티커 편집기 | DIMO",
  description: "AI 캐릭터로 나만의 스티커를 만들어보세요",
};

/**
 * 스티커 편집기 레이아웃
 * - 헤더는 RootLayout에서 표시
 * - 탭바/푸터는 LayoutWrapper에서 숨김
 * - 편집기가 남은 공간을 채움
 */
export default function StickerEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-[#f5f5f5]">
      {children}
    </div>
  );
}
