"use client";

import { formatSizeCompact } from "../utils/unit-conversion";

interface SizeLabelProps {
  /** 라벨 X 위치 (중앙 기준) */
  x: number;
  /** 라벨 Y 위치 */
  y: number;
  /** 요소 너비 (px) */
  width: number;
  /** 요소 높이 (px) */
  height: number;
  /** 캔버스 너비 (클램핑용) */
  canvasWidth?: number;
  /** 캔버스 높이 (클램핑용) */
  canvasHeight?: number;
}

/** 라벨 크기 상수 */
const LABEL_WIDTH = 100; // 예상 라벨 너비
const LABEL_HEIGHT = 30; // 예상 라벨 높이
const PADDING = 8; // 여백

/**
 * 선택된 요소의 크기를 mm 단위로 표시하는 라벨
 * - 요소가 캔버스 밖으로 나가도 라벨은 캔버스 내에 표시
 * 레퍼런스: image1.png의 "44 x 53 mm" 스타일
 */
export function SizeLabel({ x, y, width, height, canvasWidth = 480, canvasHeight = 480 }: SizeLabelProps) {
  const sizeText = formatSizeCompact(width, height);

  // X 위치 클램핑: 라벨이 캔버스 밖으로 나가지 않도록
  const clampedX = Math.max(
    LABEL_WIDTH / 2 + PADDING,
    Math.min(canvasWidth - LABEL_WIDTH / 2 - PADDING, x)
  );

  // Y 위치 클램핑: 캔버스 상단/하단을 벗어나지 않도록
  const clampedY = Math.max(
    PADDING,
    Math.min(canvasHeight - LABEL_HEIGHT - PADDING, y)
  );

  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{
        left: clampedX,
        top: clampedY,
        transform: "translate(-50%, 0)",
      }}
    >
      <div className="whitespace-nowrap rounded-md bg-[#4a4a4a] px-4 py-1.5 text-[13px] font-medium text-white shadow-md">
        {sizeText}
      </div>
    </div>
  );
}
