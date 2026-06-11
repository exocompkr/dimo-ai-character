"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PlacedSticker } from "../../types/editor.types";

interface PlacedStickerItemProps {
  sticker: PlacedSticker;
  stickerImage: string;
  stickerSize: { width: number; height: number };
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<PlacedSticker>) => void;
  onRemove: () => void;
}

/**
 * 배치된 스티커 아이템
 * - 드래그로 위치 이동
 * - 코너 핸들로 비율 유지 크기 조절
 * - 선택 시 삭제 버튼 표시
 */
export function PlacedStickerItem({
  sticker,
  stickerImage,
  stickerSize,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
}: PlacedStickerItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, stickerX: 0, stickerY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, scale: 1 });

  const width = stickerSize.width * sticker.scale;
  const height = stickerSize.height * sticker.scale;

  // 드래그 핸들러
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).dataset.resize) return;
      e.preventDefault();
      e.stopPropagation();
      onSelect();
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        stickerX: sticker.x,
        stickerY: sticker.y,
      };
    },
    [onSelect, sticker.x, sticker.y]
  );

  // 리사이즈 핸들러
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect();
      setIsResizing(true);
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        scale: sticker.scale,
      };
    },
    [onSelect, sticker.scale]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        onUpdate({
          x: dragStart.current.stickerX + dx,
          y: dragStart.current.stickerY + dy,
        });
      }

      if (isResizing) {
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;
        // 대각선 이동량으로 스케일 계산
        const delta = (dx + dy) / 2;
        const newScale = Math.max(0.3, Math.min(3, resizeStart.current.scale + delta / 100));
        onUpdate({ scale: newScale });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, onUpdate]);

  return (
    <div
      ref={itemRef}
      className={cn(
        "absolute cursor-move select-none",
        isSelected && "z-10"
      )}
      style={{
        left: sticker.x - width / 2,
        top: sticker.y - height / 2,
        width,
        height,
        transform: `rotate(${sticker.rotation}deg)`,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 스티커 이미지 */}
      <img
        src={stickerImage}
        alt="sticker"
        className="pointer-events-none h-full w-full object-contain"
        draggable={false}
      />

      {/* 선택 시 컨트롤만 표시 (테두리 숨김) */}
      {isSelected && (
        <>
          {/* 삭제 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-transform hover:scale-110"
          >
            <X className="size-3" />
          </button>

          {/* 리사이즈 핸들 (우하단) */}
          <div
            data-resize="true"
            className="absolute -bottom-2 -right-2 size-5 cursor-se-resize rounded-full border-2 border-accent bg-white shadow-md"
            onMouseDown={handleResizeMouseDown}
          />
        </>
      )}
    </div>
  );
}
