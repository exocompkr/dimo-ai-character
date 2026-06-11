"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { ArrowLeft, Plus, Trash2, Grid3X3, ShoppingCart, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStickerEditor } from "@/stores/stickerEditorStore";
import { getSizeOption } from "../../config/paper-options";
import { Artboard } from "./Artboard";
import type { ImageElement } from "../../types/editor.types";

/** mm to px 변환 비율 */
const PX_PER_MM = 3.78;

/** 자동 배치 수량 옵션 */
const QUANTITY_OPTIONS = [4, 6, 9, 12, 16, 20];

/**
 * 스티커 배치 페이지
 * 선택한 용지 크기의 아트보드에 스티커를 배치
 */
export function LayoutPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const hasAutoLayouted = useRef(false);

  const {
    elements,
    cutline,
    fabric,
    layout,
    goToFabric,
    goToOrder,
    setStickerImage,
    addPlacedSticker,
    clearPlacedStickers,
    autoLayoutStickers,
  } = useStickerEditor();

  // 스티커 이미지 생성 (칼선 포함, 고해상도)
  const generateStickerImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 요소들의 바운딩 박스 계산
    const imageElements = elements.filter(
      (el): el is ImageElement => el.type === "image"
    );

    if (imageElements.length === 0) return;

    // 전체 바운딩 박스
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    for (const el of elements) {
      minX = Math.min(minX, el.x - el.width / 2);
      minY = Math.min(minY, el.y - el.height / 2);
      maxX = Math.max(maxX, el.x + el.width / 2);
      maxY = Math.max(maxY, el.y + el.height / 2);
    }

    // 칼선 여백 추가
    const padding = cutline.offset * PX_PER_MM + 10;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const width = maxX - minX;
    const height = maxY - minY;

    // 고해상도 렌더링을 위한 픽셀 비율 (최대 2배)
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    // 캔버스 크기를 픽셀 비율만큼 확대
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;

    // 컨텍스트 스케일 적용
    ctx.scale(pixelRatio, pixelRatio);

    // 고품질 이미지 렌더링 설정
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.clearRect(0, 0, width, height);

    // 이미지 로드 및 렌더링
    const loadPromises = imageElements.map((el) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.save();
          ctx.translate(el.x - minX, el.y - minY);
          ctx.rotate((el.rotation * Math.PI) / 180);
          ctx.scale(el.scaleX, el.scaleY);
          ctx.globalAlpha = el.opacity;
          ctx.drawImage(img, -el.width / 2, -el.height / 2, el.width, el.height);
          ctx.restore();
          resolve();
        };
        img.onerror = () => resolve();
        img.src = el.src;
      });
    });

    Promise.all(loadPromises).then(() => {
      // 칼선 렌더링
      if (cutline.path) {
        ctx.save();
        ctx.translate(-minX, -minY);
        ctx.strokeStyle = cutline.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        try {
          const path = new Path2D(cutline.path);
          ctx.stroke(path);
        } catch (e) {
          console.error("칼선 렌더링 오류:", e);
        }
        ctx.restore();
      }

      // 이미지 저장 (논리적 크기는 원본 유지)
      const dataUrl = canvas.toDataURL("image/png");
      setStickerImage(dataUrl, { width, height });
    });
  }, [elements, cutline, setStickerImage]);

  // 페이지 진입 시 스티커 이미지 생성
  useEffect(() => {
    generateStickerImage();
  }, [generateStickerImage]);

  // 페이지 진입 시 자동 배치 (최초 1회만)
  useEffect(() => {
    // 이미 자동 배치를 했거나, 스티커 이미지가 아직 생성되지 않았으면 스킵
    if (hasAutoLayouted.current || !layout.stickerImage || layout.stickerSize.width <= 0) {
      return;
    }

    // 최대 배치 가능한 수량 계산 (gap=5, padding=20)
    const sizeOpt = fabric.selectedSize ? getSizeOption(fabric.selectedSize) : null;
    if (sizeOpt) {
      const artboardW = sizeOpt.width * PX_PER_MM;
      const artboardH = sizeOpt.height * PX_PER_MM;
      const cols = Math.floor((artboardW - 40 + 5) / (layout.stickerSize.width + 5));
      const rows = Math.floor((artboardH - 40 + 5) / (layout.stickerSize.height + 5));
      const maxPossible = cols * rows;

      // 기본 4개 배치, 최대 배치 가능 수량까지
      const autoCount = Math.min(4, maxPossible);
      if (autoCount > 0) {
        autoLayoutStickers(autoCount);
        hasAutoLayouted.current = true;
      }
    }
  }, [layout.stickerImage, layout.stickerSize, fabric.selectedSize, autoLayoutStickers]);

  // 최대 배치 가능 수량 계산
  const sizeOption = fabric.selectedSize
    ? getSizeOption(fabric.selectedSize)
    : null;

  let maxCount = 20;
  if (sizeOption && layout.stickerSize.width > 0) {
    const artboardW = sizeOption.width * PX_PER_MM;
    const artboardH = sizeOption.height * PX_PER_MM;
    // gap=5 (스티커 크기에 이미 칼선 여백 포함)
    const cols = Math.floor((artboardW - 40 + 5) / (layout.stickerSize.width + 5));
    const rows = Math.floor((artboardH - 40 + 5) / (layout.stickerSize.height + 5));
    maxCount = cols * rows;
  }

  const canProceed = layout.placedStickers.length > 0;

  return (
    <div className="flex flex-1 flex-col bg-[#f5f5f5]">
      {/* 숨겨진 캔버스 (스티커 이미지 생성용) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 메인 영역 - 모바일: 세로 배치, 데스크탑: 가로 배치 */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* 아트보드 영역 */}
        <div className="flex flex-1 items-center justify-center overflow-auto p-4 lg:p-8">
          <Artboard />
        </div>

        {/* 모바일 패널 토글 버튼 */}
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="flex items-center justify-center gap-2 border-t border-line bg-white py-3 lg:hidden"
        >
          {isPanelOpen ? (
            <ChevronDown className="size-5 text-ink-soft" />
          ) : (
            <ChevronUp className="size-5 text-ink-soft" />
          )}
          <span className="text-sm font-medium text-ink">
            {isPanelOpen ? "패널 접기" : `스티커 ${layout.placedStickers.length}개 배치됨`}
          </span>
        </button>

        {/* 우측/하단 패널 */}
        <div
          className={cn(
            "flex flex-col border-t border-line bg-white transition-all duration-300 lg:w-80 lg:border-l lg:border-t-0",
            isPanelOpen ? "max-h-[50vh] lg:max-h-none" : "max-h-0 overflow-hidden lg:max-h-none"
          )}
        >
          {/* 헤더 - 데스크탑만 표시 */}
          <div className="hidden border-b border-line p-4 lg:block">
            <h2 className="text-lg font-bold text-ink">스티커 배치</h2>
            <p className="mt-1 text-sm text-ink-soft">
              스티커를 원하는 위치에 배치하세요
            </p>
          </div>

          {/* 컨트롤 영역 */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4 lg:space-y-6">
            {/* 스티커 추가 + 자동 배치 (모바일에서 가로 배치) */}
            <div className="flex gap-3 lg:flex-col lg:gap-6">
              {/* 스티커 추가 */}
              <div className="flex-1 lg:flex-none">
                <h3 className="mb-2 text-xs font-semibold text-ink lg:mb-3 lg:text-sm">스티커 추가</h3>
                <button
                  onClick={() => addPlacedSticker()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line bg-bg-soft py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:bg-peach/20 hover:text-accent lg:py-3"
                >
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">스티커 </span>추가
                </button>
              </div>

              {/* 자동 배치 */}
              <div className="flex-1 lg:flex-none">
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold text-ink lg:mb-3 lg:text-sm">
                  <Grid3X3 className="size-4" />
                  자동 배치
                </h3>
                <div className="grid grid-cols-3 gap-1.5 lg:gap-2">
                  {QUANTITY_OPTIONS.filter((q) => q <= maxCount).map((count) => (
                    <button
                      key={count}
                      onClick={() => autoLayoutStickers(count)}
                      className="rounded-lg border border-line bg-white py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:bg-accent/5 lg:py-2 lg:text-sm"
                    >
                      {count}개
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 현재 상태 + 초기화 */}
            <div className="space-y-3">
              {/* 배치된 스티커 수 */}
              <div className="rounded-xl bg-bg-soft p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-soft lg:text-sm">배치된 스티커</span>
                  <span className="text-base font-bold text-accent lg:text-lg">
                    {layout.placedStickers.length}개
                  </span>
                </div>
              </div>

              {/* 초기화 버튼 */}
              {layout.placedStickers.length > 0 && (
                <button
                  onClick={clearPlacedStickers}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-100 lg:text-sm"
                >
                  <Trash2 className="size-4" />
                  모두 삭제
                </button>
              )}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex gap-3 border-t border-line p-3 lg:p-4">
            <button
              onClick={goToFabric}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-gray-100 lg:gap-2 lg:px-4 lg:py-2.5"
            >
              <ArrowLeft className="size-4" />
              이전
            </button>
            <button
              onClick={goToOrder}
              disabled={!canProceed}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors lg:py-2.5",
                canProceed
                  ? "bg-accent text-white hover:bg-accent-deep"
                  : "cursor-not-allowed bg-gray-200 text-gray-400"
              )}
            >
              <ShoppingCart className="size-4" />
              주문하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
