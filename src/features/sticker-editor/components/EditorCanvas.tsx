"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Stage, Layer, Transformer, Image as KonvaImage, Rect, Circle, Star, Text, Group } from "react-konva";
import type Konva from "konva";
import { useStickerEditor } from "@/stores/stickerEditorStore";
import type { EditorElement, ImageElement, ShapeElement, TextElement } from "../types/editor.types";
import { SizeLabel } from "./SizeLabel";

/** 캔버스 크기 (스크롤 없이 화면에 맞춤) */
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 480;

/** 실시간 바운드 정보 */
interface LiveBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Konva 캔버스 에디터
 * - 요소 렌더링, 선택, 드래그, 리사이즈, 회전 처리
 */
export function EditorCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [liveBounds, setLiveBounds] = useState<LiveBounds | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    elements,
    selectedIds,
    canvas,
    setSelectedIds,
    updateElement,
    saveToHistory,
  } = useStickerEditor();

  // 이미지 로드
  useEffect(() => {
    const imageElements = elements.filter((el): el is ImageElement => el.type === "image");

    imageElements.forEach((el) => {
      if (!loadedImages.has(el.id)) {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setLoadedImages((prev) => new Map(prev).set(el.id, img));
        };
        img.src = el.src;
      }
    });
  }, [elements, loadedImages]);

  // Transformer 업데이트
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;

    const selectedNodes = selectedIds
      .map((id) => stage.findOne(`#${id}`))
      .filter((node): node is Konva.Node => node !== undefined);

    transformer.nodes(selectedNodes);
  }, [selectedIds, elements]);

  // 스테이지 클릭 (빈 영역 클릭 시 선택 해제)
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      // 스테이지 자체를 클릭한 경우에만 선택 해제
      if (e.target === stageRef.current) {
        setSelectedIds([]);
      }
    },
    [setSelectedIds]
  );

  // 요소 클릭
  const handleElementClick = useCallback(
    (id: string, e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      e.cancelBubble = true;

      // Shift+클릭 (터치 이벤트는 shiftKey 없음)
      const isShiftKey = "shiftKey" in e.evt && e.evt.shiftKey;
      if (isShiftKey) {
        // Shift+클릭: 다중 선택
        setSelectedIds(
          selectedIds.includes(id)
            ? selectedIds.filter((sid) => sid !== id)
            : [...selectedIds, id]
        );
      } else {
        // 단일 선택
        setSelectedIds([id]);
      }
    },
    [selectedIds, setSelectedIds]
  );

  // 드래그 시작 - 선택 활성화 + 실시간 추적 시작
  const handleDragStart = useCallback(
    (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
      // 드래그 시작 시 해당 요소 선택
      if (!selectedIds.includes(id)) {
        setSelectedIds([id]);
      }
      setIsDragging(true);

      // 초기 바운드 설정
      const node = e.target;
      setLiveBounds({
        x: node.x() - node.width() / 2,
        y: node.y() - node.height() / 2,
        width: node.width() * Math.abs(node.scaleX()),
        height: node.height() * Math.abs(node.scaleY()),
      });
    },
    [selectedIds, setSelectedIds]
  );

  // 드래그 중 - 실시간 바운드 업데이트
  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      setLiveBounds({
        x: node.x() - node.width() / 2,
        y: node.y() - node.height() / 2,
        width: node.width() * Math.abs(node.scaleX()),
        height: node.height() * Math.abs(node.scaleY()),
      });
    },
    []
  );

  // 드래그 종료
  const handleDragEnd = useCallback(
    (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
      setIsDragging(false);
      setLiveBounds(null);
      updateElement(id, {
        x: e.target.x(),
        y: e.target.y(),
      });
      saveToHistory();
    },
    [updateElement, saveToHistory]
  );

  // Transform 종료 (리사이즈/회전)
  const handleTransformEnd = useCallback(
    (id: string, e: Konva.KonvaEventObject<Event>) => {
      const node = e.target;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // scale을 width/height에 반영하고 scale은 1로 리셋
      updateElement(id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation(),
      });

      // scale 리셋
      node.scaleX(1);
      node.scaleY(1);

      saveToHistory();
    },
    [updateElement, saveToHistory]
  );

  // 선택된 요소의 바운딩 박스 계산 (SizeLabel용)
  // 드래그 중이면 liveBounds 사용, 아니면 상태 기반 계산
  const selectedBounds = isDragging && liveBounds
    ? liveBounds
    : selectedIds.length === 1
      ? (() => {
          const el = elements.find((e) => e.id === selectedIds[0]);
          if (!el) return null;
          return {
            x: el.x - el.width / 2,
            y: el.y - el.height / 2,
            width: el.width * Math.abs(el.scaleX),
            height: el.height * Math.abs(el.scaleY),
          };
        })()
      : null;

  return (
    <div className="relative">
      {/* 캔버스 */}
      <div
        className="rounded-lg border-2 border-white bg-white shadow-lg"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      >
        <Stage
          ref={stageRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleStageClick}
          onTap={handleStageClick}
          style={{ backgroundColor: canvas.backgroundColor }}
        >
          <Layer>
            {/* 요소들을 zIndex 순서로 렌더링 */}
            {[...elements]
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((element) => (
                <ElementRenderer
                  key={element.id}
                  element={element}
                  image={
                    element.type === "image"
                      ? loadedImages.get(element.id)
                      : undefined
                  }
                  isSelected={selectedIds.includes(element.id)}
                  onClick={(e) => handleElementClick(element.id, e)}
                  onDragStart={(e) => handleDragStart(element.id, e)}
                  onDragMove={handleDragMove}
                  onDragEnd={(e) => handleDragEnd(element.id, e)}
                  onTransformEnd={(e) => handleTransformEnd(element.id, e)}
                />
              ))}

            {/* Transformer (선택된 요소에 핸들 표시) */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // 최소 크기 제한
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
              anchorSize={12}
              anchorCornerRadius={6}
              anchorFill="#ff8064"
              anchorStroke="#ff8064"
              borderStroke="#ff8064"
              borderStrokeWidth={2}
              rotateAnchorOffset={30}
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
              ]}
            />
          </Layer>
        </Stage>
      </div>

      {/* 크기 라벨 (요소 하단에 표시, 캔버스 내 클램핑) */}
      {selectedBounds && (
        <SizeLabel
          x={selectedBounds.x + selectedBounds.width / 2}
          y={selectedBounds.y + selectedBounds.height + 10}
          width={selectedBounds.width}
          height={selectedBounds.height}
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
        />
      )}
    </div>
  );
}

/**
 * 개별 요소 렌더러
 */
function ElementRenderer({
  element,
  image,
  isSelected,
  onClick,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}: {
  element: EditorElement;
  image?: HTMLImageElement;
  isSelected: boolean;
  onClick: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragStart: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}) {
  const commonProps = {
    id: element.id,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    rotation: element.rotation,
    scaleX: element.scaleX,
    scaleY: element.scaleY,
    opacity: element.opacity,
    draggable: !element.locked,
    onClick,
    onTap: onClick,
    onDragStart,
    onDragMove,
    onDragEnd,
    onTransformEnd,
    // 중심점 기준으로 배치
    offsetX: element.width / 2,
    offsetY: element.height / 2,
  };

  switch (element.type) {
    case "image":
      if (!image) return null;
      return <KonvaImage {...commonProps} image={image} />;

    case "shape":
      return <ShapeRenderer element={element} commonProps={commonProps} />;

    case "text": {
      const textEl = element as TextElement;
      // Konva fontStyle 형식: "bold", "italic", "bold italic"
      // 기본 너비를 텍스트 길이에 맞게 자동 조절하지 않고 고정
      return (
        <Text
          {...commonProps}
          text={textEl.text}
          fontSize={textEl.fontSize}
          fontFamily={textEl.fontFamily}
          fontStyle={textEl.fontStyle}
          fill={textEl.fill}
          align={textEl.align}
          // 텍스트 정렬을 위해 고정 너비 사용
          width={textEl.width}
          // 세로 정렬은 top
          verticalAlign="top"
          // 텍스트 자체의 offset 적용 (중앙 기준)
          offsetX={textEl.width / 2}
          offsetY={textEl.height / 2}
          // 텍스트 래핑
          wrap="word"
        />
      );
    }

    default:
      return null;
  }
}

/**
 * 도형 렌더러
 */
function ShapeRenderer({
  element,
  commonProps,
}: {
  element: ShapeElement;
  commonProps: Record<string, unknown>;
}) {
  const shapeProps = {
    ...commonProps,
    fill: element.fill,
    stroke: element.stroke,
    strokeWidth: element.strokeWidth,
  };

  switch (element.shapeType) {
    case "rect":
      return <Rect {...shapeProps} />;

    case "circle":
      return (
        <Circle
          {...shapeProps}
          radius={Math.min(element.width, element.height) / 2}
          offsetX={0}
          offsetY={0}
        />
      );

    case "star":
      return (
        <Star
          {...shapeProps}
          numPoints={5}
          innerRadius={element.width / 4}
          outerRadius={element.width / 2}
          offsetX={0}
          offsetY={0}
        />
      );

    case "triangle":
      return (
        <Rect
          {...shapeProps}
          // TODO: 삼각형 구현 (Line 또는 Path 사용)
        />
      );

    default:
      return <Rect {...shapeProps} />;
  }
}
