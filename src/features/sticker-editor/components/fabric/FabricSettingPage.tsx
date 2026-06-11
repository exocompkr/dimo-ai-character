"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStickerEditor } from "@/stores/stickerEditorStore";
import { PaperTypeSelector } from "./PaperTypeSelector";
import { SizeSelector } from "./SizeSelector";

/**
 * 원단 설정 페이지
 * 스티커 칼선 편집 완료 후 용지 타입과 크기를 선택하는 화면
 */
export function FabricSettingPage() {
  const {
    fabric,
    setPaperType,
    setSize,
    goToCutline,
    goToLayout,
  } = useStickerEditor();

  const canProceed = fabric.selectedPaperType && fabric.selectedSize;

  return (
    <div className="flex flex-1 flex-col bg-[#f8f8f8]">
      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          {/* 페이지 타이틀 */}
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="text-xl font-bold text-ink sm:text-2xl">원단을 선택해주세요</h1>
            <p className="mt-1 text-xs text-ink-soft sm:mt-2 sm:text-sm">
              스티커를 인쇄할 용지 종류와 크기를 선택합니다
            </p>
          </div>

          <div className="space-y-6 sm:space-y-10">
            {/* 용지 선택 */}
            <PaperTypeSelector
              selectedPaperType={fabric.selectedPaperType}
              onSelect={setPaperType}
            />

            {/* 크기 선택 */}
            <SizeSelector
              paperTypeId={fabric.selectedPaperType}
              selectedSize={fabric.selectedSize}
              onSelect={setSize}
            />
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <button
            onClick={goToCutline}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-ink-soft transition-colors hover:bg-gray-100 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            <ArrowLeft className="size-4" />
            이전
          </button>

          <button
            onClick={goToLayout}
            disabled={!canProceed}
            className={cn(
              "flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors sm:gap-2 sm:px-6 sm:py-2.5 sm:text-sm",
              canProceed
                ? "bg-accent text-white hover:bg-accent-deep"
                : "cursor-not-allowed bg-gray-200 text-gray-400"
            )}
          >
            다음
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
