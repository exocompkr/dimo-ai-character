"use client";

import { useRef, useState, useEffect } from "react";
import { useStickerEditor } from "@/stores/stickerEditorStore";
import { getSizeOption } from "../../config/paper-options";
import { PlacedStickerItem } from "./PlacedStickerItem";

/** mm to px 변환 비율 (96dpi 기준) */
const PX_PER_MM = 3.78;

/**
 * 아트보드 컴포넌트
 * 선택한 용지 크기에 맞는 캔버스를 표시하고,
 * 그 위에 스티커들을 배치할 수 있도록 함
 */
export function Artboard() {
  const artboardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxDisplaySize, setMaxDisplaySize] = useState(600);

  const {
    fabric,
    layout,
    updatePlacedSticker,
    removePlacedSticker,
    selectPlacedSticker,
    addPlacedSticker,
  } = useStickerEditor();

  // 화면 크기에 따라 최대 표시 크기 조정
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 32; // padding 고려
        const containerHeight = containerRef.current.clientHeight - 80; // 라벨 높이 고려
        setMaxDisplaySize(Math.min(containerWidth, containerHeight, 600));
      } else {
        // 모바일/데스크탑 기본값
        const isMobile = window.innerWidth < 768;
        setMaxDisplaySize(isMobile ? Math.min(window.innerWidth - 48, 400) : 600);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const sizeOption = fabric.selectedSize
    ? getSizeOption(fabric.selectedSize)
    : null;

  if (!sizeOption) {
    return (
      <div className="flex items-center justify-center p-8 text-ink-soft">
        용지 크기가 선택되지 않았습니다.
      </div>
    );
  }

  // 실제 아트보드 크기 (px)
  const artboardWidth = sizeOption.width * PX_PER_MM;
  const artboardHeight = sizeOption.height * PX_PER_MM;

  // 화면에 맞게 스케일 조정
  const scale = Math.min(
    maxDisplaySize / artboardWidth,
    maxDisplaySize / artboardHeight,
    1
  );

  const displayWidth = artboardWidth * scale;
  const displayHeight = artboardHeight * scale;

  // 아트보드 클릭 시 선택 해제
  const handleArtboardClick = (e: React.MouseEvent) => {
    if (e.target === artboardRef.current) {
      selectPlacedSticker(null);
    }
  };

  // 더블 클릭 시 스티커 추가
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (e.target !== artboardRef.current) return;

    const rect = artboardRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    addPlacedSticker({ x, y });
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-3 lg:gap-4">
      {/* 크기 라벨 */}
      <div className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white lg:px-4 lg:py-2 lg:text-sm">
        {sizeOption.name} ({sizeOption.width} × {sizeOption.height}mm)
      </div>

      {/* 아트보드 */}
      <div
        ref={artboardRef}
        className="relative rounded-lg bg-white shadow-xl"
        style={{
          width: displayWidth,
          height: displayHeight,
          backgroundImage:
            "linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        }}
        onClick={handleArtboardClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* 스케일 변환 컨테이너 */}
        <div
          className="absolute inset-0 origin-top-left"
          style={{ transform: `scale(${scale})` }}
        >
          {/* 배치된 스티커들 */}
          {layout.placedStickers.map((sticker) => (
            <PlacedStickerItem
              key={sticker.id}
              sticker={sticker}
              stickerImage={layout.stickerImage || ""}
              stickerSize={layout.stickerSize}
              isSelected={layout.selectedStickerId === sticker.id}
              onSelect={() => selectPlacedSticker(sticker.id)}
              onUpdate={(updates) => updatePlacedSticker(sticker.id, updates)}
              onRemove={() => removePlacedSticker(sticker.id)}
            />
          ))}
        </div>

        {/* 빈 상태 안내 */}
        {layout.placedStickers.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-ink-soft">
            <p className="text-xs lg:text-sm">더블 클릭하여 스티커 추가</p>
            <p className="text-[10px] lg:text-xs">또는 자동 배치 버튼 사용</p>
          </div>
        )}
      </div>
    </div>
  );
}
