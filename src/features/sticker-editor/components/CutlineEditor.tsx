"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Minus, Plus, Edit3, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStickerEditor } from "@/stores/stickerEditorStore";
import { useCutlineGeneration } from "../hooks/useCutlineGeneration";
import { formatSizeCompact } from "../utils/unit-conversion";
import type { ImageElement } from "../types/editor.types";

/** 캔버스 표시 크기 (EditorCanvas와 동일하게 유지) */
const CANVAS_SIZE = 480;

/** 고해상도 렌더링을 위한 스케일 팩터 */
const getPixelRatio = () => typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

/**
 * 칼선 편집 화면
 * 레퍼런스: image.png
 */
export function CutlineEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(
    new Map()
  );

  const { elements, cutline, setCutlineOffset, goToEdit, goToComplete } =
    useStickerEditor();

  const { cutlinePath, isGenerating } = useCutlineGeneration();

  // 이미지 로드
  useEffect(() => {
    const imageElements = elements.filter(
      (el): el is ImageElement => el.type === "image"
    );

    imageElements.forEach((el) => {
      if (!loadedImages.has(el.id)) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setLoadedImages((prev) => new Map(prev).set(el.id, img));
        };
        img.src = el.src;
      }
    });
  }, [elements, loadedImages]);

  // 캔버스에 요소와 칼선 렌더링 (고품질)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const pixelRatio = getPixelRatio();

    // 고해상도 캔버스 설정
    canvas.width = CANVAS_SIZE * pixelRatio;
    canvas.height = CANVAS_SIZE * pixelRatio;
    canvas.style.width = `${CANVAS_SIZE}px`;
    canvas.style.height = `${CANVAS_SIZE}px`;

    // 스케일 적용
    ctx.scale(pixelRatio, pixelRatio);

    // 고품질 렌더링 설정
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // 배경 지우기
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 요소 렌더링
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

    for (const element of sortedElements) {
      if (!element.visible) continue;

      ctx.save();
      ctx.globalAlpha = element.opacity;
      ctx.translate(element.x, element.y);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.scale(element.scaleX, element.scaleY);

      if (element.type === "image") {
        const img = loadedImages.get(element.id);
        if (img) {
          ctx.drawImage(
            img,
            -element.width / 2,
            -element.height / 2,
            element.width,
            element.height
          );
        }
      } else if (element.type === "shape") {
        ctx.fillStyle = element.fill;
        if (element.strokeWidth > 0) {
          ctx.strokeStyle = element.stroke;
          ctx.lineWidth = element.strokeWidth;
        }

        const halfW = element.width / 2;
        const halfH = element.height / 2;

        switch (element.shapeType) {
          case "rect":
            ctx.fillRect(-halfW, -halfH, element.width, element.height);
            break;
          case "circle":
            ctx.beginPath();
            ctx.arc(0, 0, Math.min(halfW, halfH), 0, Math.PI * 2);
            ctx.fill();
            break;
          case "star":
            drawStar(ctx, 0, 0, 5, halfW / 2, halfW);
            ctx.fill();
            break;
        }
      } else if (element.type === "text") {
        ctx.fillStyle = element.fill;
        ctx.font = `${element.fontStyle} ${element.fontSize}px ${element.fontFamily}`;
        ctx.textAlign = element.align;
        ctx.textBaseline = "middle";
        ctx.fillText(element.text, 0, 0);
      }

      ctx.restore();
    }

    // 칼선 렌더링 (벡터 기반 path)
    if (cutlinePath && cutlinePath.length > 0) {
      ctx.save();
      ctx.strokeStyle = cutline.color;
      ctx.lineWidth = 1.5; // 얇은 선
      ctx.setLineDash([]); // 실선
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      try {
        const path = new Path2D(cutlinePath);
        ctx.stroke(path);
      } catch (e) {
        console.error("칼선 렌더링 오류:", e);
      }

      ctx.restore();
    }
  }, [elements, loadedImages, cutlinePath, cutline]);

  // 칼선 간격 조절
  const handleOffsetChange = (delta: number) => {
    const newOffset = Math.max(0.5, Math.min(10, cutline.offset + delta));
    setCutlineOffset(newOffset);
  };

  // 전체 요소의 바운딩 박스 계산
  const totalBounds = elements.reduce(
    (acc, el) => ({
      minX: Math.min(acc.minX, el.x - el.width / 2),
      minY: Math.min(acc.minY, el.y - el.height / 2),
      maxX: Math.max(acc.maxX, el.x + el.width / 2),
      maxY: Math.max(acc.maxY, el.y + el.height / 2),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );

  const totalWidth = totalBounds.maxX - totalBounds.minX;
  const totalHeight = totalBounds.maxY - totalBounds.minY;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* 캔버스 영역 */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#f5f5f5] p-8">
        {/* 크기 라벨 */}
        <div className="mb-4 rounded-md bg-[#4a4a4a] px-4 py-1.5 text-[13px] font-medium text-white shadow-md">
          {formatSizeCompact(totalWidth, totalHeight)}
        </div>

        {/* 캔버스 */}
        <div className="relative rounded-lg border-2 border-white bg-white shadow-lg">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="rounded-lg"
          />

          {/* 로딩 오버레이 */}
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80">
              <Loader2 className="size-8 animate-spin text-accent" />
            </div>
          )}
        </div>
      </div>

      {/* 우측 패널 */}
      <div className="flex w-80 flex-col border-l border-line bg-white">
        {/* 헤더 */}
        <div className="flex items-center justify-center border-b border-line p-4">
          <h2 className="text-lg font-bold text-ink">스티커 칼선 편집</h2>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 p-6">
          {/* 안내 문구 */}
          <div className="mb-6 flex items-start gap-2 rounded-xl bg-peach/50 p-4">
            <span className="text-lg">✂️</span>
            <p className="text-sm text-ink">
              스티커를 뗄 수 있도록 칼선 모양을 편집해 주세요.
            </p>
          </div>

          {/* 칼선 간격 조절 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-ink">칼선 간격</h3>

            <div className="flex items-center justify-between rounded-xl border border-line p-2">
              <button
                onClick={() => handleOffsetChange(-0.5)}
                className="flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-bg-soft active:bg-peach"
              >
                <Minus className="size-5" />
              </button>

              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-ink">
                  {cutline.offset}
                </span>
                <span className="text-xs text-ink-soft">mm</span>
              </div>

              <button
                onClick={() => handleOffsetChange(0.5)}
                className="flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-bg-soft active:bg-peach"
              >
                <Plus className="size-5" />
              </button>
            </div>

            {/* 직접 편집 버튼 */}
            <button
              className="btn-outline w-full justify-center gap-2"
              disabled
            >
              <Edit3 className="size-4" />
              직접 편집
            </button>

            <p className="text-center text-xs text-ink-soft">
              직접 편집 기능은 준비 중입니다
            </p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3 border-t border-line p-4">
          <button onClick={goToEdit} className="btn-outline flex-1 justify-center">
            <ArrowLeft className="size-4" />
            이전
          </button>
          <button
            onClick={goToComplete}
            className="btn-primary flex-1 justify-center"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 별 모양 그리기
 */
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  innerRadius: number,
  outerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(
      cx + Math.cos(rot) * outerRadius,
      cy + Math.sin(rot) * outerRadius
    );
    rot += step;
    ctx.lineTo(
      cx + Math.cos(rot) * innerRadius,
      cy + Math.sin(rot) * innerRadius
    );
    rot += step;
  }

  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}
