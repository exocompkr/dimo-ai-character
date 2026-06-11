"use client";

import { useStickerEditor } from "@/stores/stickerEditorStore";
import { useEditorKeyboard } from "../hooks/useEditorHistory";
import { TopToolbar } from "./TopToolbar";
import { EditorCanvas } from "./EditorCanvas";
import { RightSidebar } from "./RightSidebar";
import { CutlineEditor } from "./CutlineEditor";

/**
 * 스티커 편집기 메인 컨테이너
 * - 편집 단계(edit)와 칼선 단계(cutline)를 구분하여 렌더링
 */
export function StickerEditorPage() {
  const step = useStickerEditor((state) => state.step);

  // 키보드 단축키 활성화
  useEditorKeyboard();

  if (step === "cutline") {
    return (
      <div className="flex flex-1 flex-col">
        <CutlineEditor />
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="flex flex-1 flex-col">
        <CompletePage />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* 상단 툴바 */}
      <TopToolbar />

      {/* 메인 영역: 캔버스 + 사이드바 */}
      <div className="flex flex-1 overflow-auto">
        {/* 캔버스 영역 */}
        <div className="flex flex-1 items-center justify-center overflow-auto bg-[#f5f5f5] p-8">
          <EditorCanvas />
        </div>

        {/* 우측 사이드바 */}
        <RightSidebar />
      </div>
    </div>
  );
}

/**
 * 완료 페이지 (빈 페이지)
 */
function CompletePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="flex items-center gap-3 rounded-full bg-gradient-to-r from-peach to-pink px-8 py-4">
        <span className="text-2xl">🎉</span>
        <h1 className="text-xl font-bold text-ink">
          스티커가 완성되었습니다!
        </h1>
      </div>
      <p className="text-ink-soft">
        주문 기능은 준비 중입니다.
      </p>
    </div>
  );
}
