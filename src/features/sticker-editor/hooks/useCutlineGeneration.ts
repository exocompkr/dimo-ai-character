"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStickerEditor } from "@/stores/stickerEditorStore";
import { generateCutlinePath } from "../utils/cutline-algorithm";
import type { ImageElement } from "../types/editor.types";

/**
 * 칼선 생성 훅
 *
 * 요소들을 캔버스에 렌더링하고 칼선 경로를 생성합니다.
 */
export function useCutlineGeneration() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cutlinePath, setCutlinePath] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(
    new Map()
  );
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const { elements, cutline, setCutlinePath: storeCutlinePath } =
    useStickerEditor();

  // 폰트 로드 대기
  useEffect(() => {
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    } else {
      setFontsLoaded(true);
    }
  }, []);

  // 이미지 로드
  useEffect(() => {
    const imageElements = elements.filter(
      (el): el is ImageElement => el.type === "image"
    );

    const loadPromises = imageElements
      .filter((el) => !loadedImages.has(el.id))
      .map(
        (el) =>
          new Promise<{ id: string; img: HTMLImageElement }>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve({ id: el.id, img });
            img.onerror = reject;
            img.src = el.src;
          })
      );

    if (loadPromises.length > 0) {
      Promise.all(loadPromises)
        .then((results) => {
          const newMap = new Map(loadedImages);
          results.forEach(({ id, img }) => newMap.set(id, img));
          setLoadedImages(newMap);
        })
        .catch(console.error);
    }
  }, [elements, loadedImages]);

  // 칼선 생성
  const generateCutline = useCallback(async () => {
    setIsGenerating(true);

    // 텍스트 요소가 있으면 해당 폰트 로드 대기
    const textElements = elements.filter((el) => el.type === "text");
    if (textElements.length > 0 && typeof document !== "undefined" && document.fonts) {
      const fontPromises = textElements.map((el) => {
        if (el.type !== "text") return Promise.resolve();
        const fontStyle = el.fontStyle === "normal" ? "" : el.fontStyle;
        const fontSpec = `${fontStyle} ${el.fontSize}px ${el.fontFamily}`.trim();
        return document.fonts.load(fontSpec).catch(() => {
          console.warn(`폰트 로드 실패: ${fontSpec}`);
        });
      });
      await Promise.all(fontPromises);
    }

    // 오프스크린 캔버스 생성 (칼선 추출용 - 1x 스케일 유지)
    const CANVAS_SIZE = 480;

    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    canvasRef.current = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    // 고품질 렌더링 설정
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // 배경 투명하게 시작
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 모든 요소를 캔버스에 렌더링 (칼선 추출용: 불투명 검정색으로)
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

    // 칼선 추출용 고정 색상 (불투명 검정)
    const SOLID_BLACK = "#000000";

    console.log("[칼선] 요소 렌더링 시작:", sortedElements.length, "개");

    for (const element of sortedElements) {
      if (!element.visible) continue;

      ctx.save();
      ctx.globalAlpha = 1; // 항상 불투명하게 렌더링
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
        // 칼선용: 무조건 불투명 검정색
        ctx.fillStyle = SOLID_BLACK;
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
          case "triangle":
            ctx.beginPath();
            ctx.moveTo(0, -halfH);
            ctx.lineTo(halfW, halfH);
            ctx.lineTo(-halfW, halfH);
            ctx.closePath();
            ctx.fill();
            break;
        }
        console.log("[칼선] 도형 렌더링:", element.shapeType, "위치:", element.x, element.y);
      } else if (element.type === "text") {
        // 칼선용: 무조건 불투명 검정색
        ctx.fillStyle = SOLID_BLACK;

        // fontStyle 처리 ("normal"은 생략)
        const fontStyle = element.fontStyle === "normal" ? "" : element.fontStyle;
        const fontSpec = `${fontStyle} ${element.fontSize}px "${element.fontFamily}"`.trim();
        ctx.font = fontSpec;
        ctx.textAlign = element.align;
        ctx.textBaseline = "middle";

        // 텍스트 렌더링
        ctx.fillText(element.text, 0, 0);

        // 텍스트 바운딩 박스로 대체 렌더링 (폰트 로드 실패 대비)
        const metrics = ctx.measureText(element.text);
        const textWidth = metrics.width;
        const textHeight = element.fontSize;

        console.log("[칼선] 텍스트 렌더링:", element.text, "폰트:", fontSpec, "크기:", textWidth, "x", textHeight);

        // 텍스트 영역을 사각형으로도 채움 (백업)
        if (textWidth > 0) {
          const offsetX = element.align === "center" ? -textWidth / 2 :
                          element.align === "right" ? -textWidth : 0;
          ctx.fillRect(offsetX, -textHeight / 2, textWidth, textHeight);
        }
      }

      ctx.restore();
    }

    // 칼선 생성 (약간의 딜레이)
    setTimeout(() => {
      const path = generateCutlinePath(canvas, cutline.offset);
      setCutlinePath(path);
      storeCutlinePath(path);
      setIsGenerating(false);
      console.log("[칼선] 생성 완료, path 길이:", path.length);
    }, 100);
  }, [elements, loadedImages, cutline.offset, storeCutlinePath]);

  // offset 변경 또는 폰트 로드 완료 시 재생성
  useEffect(() => {
    if (elements.length > 0 && fontsLoaded) {
      generateCutline();
    }
  }, [cutline.offset, elements.length, fontsLoaded, generateCutline]);

  return {
    cutlinePath,
    isGenerating,
    regenerate: generateCutline,
  };
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
