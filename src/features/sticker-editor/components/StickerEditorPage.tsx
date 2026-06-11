"use client";

import { useStickerEditor } from "@/stores/stickerEditorStore";
import { useEditorKeyboard } from "../hooks/useEditorHistory";
import { TopToolbar } from "./TopToolbar";
import { EditorCanvas } from "./EditorCanvas";
import { RightSidebar } from "./RightSidebar";
import { CutlineEditor } from "./CutlineEditor";
import { FabricSettingPage } from "./fabric";
import { LayoutPage } from "./layout";

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

  if (step === "fabric") {
    return (
      <div className="flex flex-1 flex-col">
        <FabricSettingPage />
      </div>
    );
  }

  if (step === "layout") {
    return (
      <div className="flex flex-1 flex-col">
        <LayoutPage />
      </div>
    );
  }

  if (step === "order") {
    return (
      <div className="flex flex-1 flex-col">
        <OrderPage />
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
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* 캔버스 영역 */}
        <div className="flex flex-1 items-center justify-center overflow-auto bg-[#f5f5f5] p-4 lg:p-8">
          <EditorCanvas />
        </div>

        {/* 우측 사이드바 (데스크탑: 우측, 모바일: 하단) */}
        <RightSidebar />
      </div>
    </div>
  );
}

/**
 * 주문 페이지
 */
function OrderPage() {
  const { layout, fabric, goToLayout, goToComplete } = useStickerEditor();

  return (
    <div className="flex flex-1 flex-col bg-[#f8f8f8]">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
          {/* 페이지 타이틀 */}
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="text-xl font-bold text-ink sm:text-2xl">주문 확인</h1>
            <p className="mt-1 text-xs text-ink-soft sm:mt-2 sm:text-sm">
              주문 내용을 확인해주세요
            </p>
          </div>

          {/* 주문 정보 카드 */}
          <div className="space-y-3 sm:space-y-4">
            {/* 스티커 미리보기 */}
            <div className="rounded-xl bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
              <h3 className="mb-3 text-xs font-semibold text-ink sm:mb-4 sm:text-sm">스티커 미리보기</h3>
              {layout.stickerImage && (
                <div className="flex justify-center">
                  <img
                    src={layout.stickerImage}
                    alt="스티커"
                    className="max-h-24 rounded-lg border border-line sm:max-h-32"
                  />
                </div>
              )}
            </div>

            {/* 주문 상세 */}
            <div className="rounded-xl bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
              <h3 className="mb-3 text-xs font-semibold text-ink sm:mb-4 sm:text-sm">주문 상세</h3>
              <div className="space-y-2 text-xs sm:space-y-3 sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-soft">용지 타입</span>
                  <span className="font-medium text-ink">
                    {fabric.selectedPaperType === "white" && "백색"}
                    {fabric.selectedPaperType === "transparent" && "투명"}
                    {fabric.selectedPaperType === "fabric" && "의류"}
                    {fabric.selectedPaperType === "transfer" && "판박이"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft">용지 크기</span>
                  <span className="font-medium text-ink">
                    {fabric.selectedSize?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft">스티커 수량</span>
                  <span className="font-medium text-ink">
                    {layout.placedStickers.length}개
                  </span>
                </div>
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="rounded-xl bg-accent/5 p-4 sm:rounded-2xl sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-ink sm:text-lg">총 결제 금액</span>
                <span className="text-xl font-bold text-accent sm:text-2xl">
                  ₩12,000
                </span>
              </div>
              <p className="mt-1 text-[10px] text-ink-soft sm:mt-2 sm:text-xs">
                * 예상 가격입니다. 실제 가격은 다를 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <button
            onClick={goToLayout}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-ink-soft transition-colors hover:bg-gray-100 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            이전
          </button>
          <button
            onClick={goToComplete}
            className="rounded-lg bg-accent px-6 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-deep sm:px-8 sm:py-2.5 sm:text-sm"
          >
            주문하기
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 완료 페이지
 */
function CompletePage() {
  const { reset } = useStickerEditor();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 sm:gap-6 sm:p-8">
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-100 sm:size-20">
          <span className="text-3xl sm:text-4xl">✓</span>
        </div>
        <h1 className="text-xl font-bold text-ink sm:text-2xl">
          주문이 완료되었습니다!
        </h1>
        <p className="text-center text-xs text-ink-soft sm:text-sm">
          주문해 주셔서 감사합니다.<br />
          빠른 시일 내에 배송해 드리겠습니다.
        </p>
      </div>

      <button
        onClick={reset}
        className="mt-2 rounded-lg bg-accent px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-accent-deep sm:mt-4 sm:px-8 sm:py-3 sm:text-sm"
      >
        새 스티커 만들기
      </button>
    </div>
  );
}
