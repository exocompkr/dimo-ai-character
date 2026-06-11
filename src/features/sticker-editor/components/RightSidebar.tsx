"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Shapes, Type, X, ChevronUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStickerEditor } from "@/stores/stickerEditorStore";
import type { ShapeType, NewImageElement, NewShapeElement, NewTextElement } from "../types/editor.types";
import { TextEditPanel } from "./TextEditPanel";

/**
 * 우측 사이드바
 * 레퍼런스: image1.png 우측 도구 모음
 * - 이미지 업로드
 * - 도형 추가
 * - 텍스트 추가
 * - 스티커 만들기 버튼
 */
export function RightSidebar() {
  const { addElement, elements, selectedIds } = useStickerEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showTextPanel, setShowTextPanel] = useState(false);

  // 선택된 요소가 텍스트인지 확인
  const selectedElement = selectedIds.length === 1
    ? elements.find((el) => el.id === selectedIds[0])
    : null;
  const isTextSelected = selectedElement?.type === "text";

  // 이미지 업로드
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;

        // 이미지 크기를 얻기 위해 임시 이미지 로드
        const img = new Image();
        img.onload = () => {
          // 최대 200px 기준으로 비율 유지
          const maxSize = 200;
          const scale = Math.min(maxSize / img.width, maxSize / img.height);
          const width = img.width * scale;
          const height = img.height * scale;

          const newElement: NewImageElement = {
            type: "image",
            src: base64,
            x: 300,
            y: 300,
            width,
            height,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            visible: true,
            locked: false,
          };
          addElement(newElement);
        };
        img.src = base64;
      };
      reader.readAsDataURL(file);

      // input 초기화 (같은 파일 재선택 가능하게)
      e.target.value = "";
    },
    [addElement]
  );

  // 도형 추가
  const handleAddShape = useCallback(
    (shapeType: ShapeType) => {
      const colors: Record<ShapeType, string> = {
        rect: "#ff8064",
        circle: "#ffe3ec",
        star: "#ffd9c6",
        triangle: "#ffe5d8",
      };

      const newElement: NewShapeElement = {
        type: "shape",
        shapeType,
        x: 300,
        y: 300,
        width: 100,
        height: 100,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        visible: true,
        locked: false,
        fill: colors[shapeType],
        stroke: "#3f3a38",
        strokeWidth: 0,
      };
      addElement(newElement);
    },
    [addElement]
  );

  // 텍스트 추가
  const handleAddText = useCallback(() => {
    const newElement: NewTextElement = {
      type: "text",
      text: "텍스트를 입력하세요",
      x: 240, // 캔버스 480x480의 중앙
      y: 240,
      width: 200,
      height: 50,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      locked: false,
      fontSize: 24,
      fontFamily: "Pretendard",
      fontStyle: "normal",
      fill: "#3f3a38",
      align: "center",
    };
    addElement(newElement);
  }, [addElement]);

  // 텍스트 선택 시 편집 패널 표시 (데스크탑)
  if (isTextSelected) {
    return (
      <>
        {/* 데스크탑: 우측 패널 */}
        <div className="hidden w-64 flex-col border-l border-line bg-white lg:flex">
          {/* 헤더 */}
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <Type className="size-5 text-accent" />
            <span className="text-sm font-bold text-ink">텍스트 편집</span>
          </div>
          {/* 편집 패널 */}
          <div className="flex-1 overflow-auto p-4">
            <TextEditPanel />
          </div>
        </div>

        {/* 모바일: 하단 패널 */}
        <div className="flex flex-col border-t border-line bg-white lg:hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <div className="flex items-center gap-2">
              <Type className="size-4 text-accent" />
              <span className="text-xs font-bold text-ink">텍스트 편집</span>
            </div>
          </div>
          {/* 편집 패널 */}
          <div className="max-h-48 overflow-auto p-3">
            <TextEditPanel />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* 데스크탑: 우측 사이드바 */}
      <div className="hidden w-24 flex-col items-center gap-4 border-l border-line bg-white py-6 lg:flex">
        {/* 이미지 업로드 */}
        <SidebarButton
          icon={<ImagePlus className="size-6" />}
          label="이미지 업로드"
          onClick={() => fileInputRef.current?.click()}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* 도형 */}
        <SidebarButton
          icon={<Shapes className="size-6" />}
          label="도형"
          hasDropdown
          dropdownContent={
            <div className="flex flex-col gap-2 p-3">
              <ShapeButton
                label="사각형"
                onClick={() => handleAddShape("rect")}
              >
                <div className="size-8 rounded bg-accent" />
              </ShapeButton>
              <ShapeButton
                label="원형"
                onClick={() => handleAddShape("circle")}
              >
                <div className="size-8 rounded-full bg-pink" />
              </ShapeButton>
              <ShapeButton
                label="별"
                onClick={() => handleAddShape("star")}
              >
                <div className="flex size-8 items-center justify-center text-xl">
                  ⭐
                </div>
              </ShapeButton>
            </div>
          }
        />

        {/* 텍스트 */}
        <SidebarButton
          icon={<Type className="size-6" />}
          label="텍스트"
          onClick={handleAddText}
        />
      </div>

      {/* 모바일: 하단 툴바 */}
      <div className="flex flex-col border-t border-line bg-white lg:hidden">
        {/* 도형 메뉴 (열림 상태일 때) */}
        {showShapeMenu && (
          <div className="animate-in slide-in-from-bottom-2 border-b border-line bg-bg-soft p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink">도형 선택</span>
              <button
                onClick={() => setShowShapeMenu(false)}
                className="rounded-full p-1 hover:bg-gray-200"
              >
                <X className="size-4 text-ink-soft" />
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleAddShape("rect");
                  setShowShapeMenu(false);
                }}
                className="flex flex-col items-center gap-1 rounded-lg p-2 hover:bg-white"
              >
                <div className="size-10 rounded bg-accent" />
                <span className="text-[10px] text-ink-soft">사각형</span>
              </button>
              <button
                onClick={() => {
                  handleAddShape("circle");
                  setShowShapeMenu(false);
                }}
                className="flex flex-col items-center gap-1 rounded-lg p-2 hover:bg-white"
              >
                <div className="size-10 rounded-full bg-pink" />
                <span className="text-[10px] text-ink-soft">원형</span>
              </button>
              <button
                onClick={() => {
                  handleAddShape("star");
                  setShowShapeMenu(false);
                }}
                className="flex flex-col items-center gap-1 rounded-lg p-2 hover:bg-white"
              >
                <div className="flex size-10 items-center justify-center text-2xl">⭐</div>
                <span className="text-[10px] text-ink-soft">별</span>
              </button>
            </div>
          </div>
        )}

        {/* 하단 버튼 영역 */}
        <div className="flex items-center justify-around px-2 py-3">
          {/* 이미지 업로드 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1"
          >
            <div className="flex size-11 items-center justify-center rounded-full border border-line bg-white shadow-sm">
              <ImagePlus className="size-5 text-ink" />
            </div>
            <span className="text-[10px] text-ink-soft">이미지</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />

          {/* 도형 */}
          <button
            onClick={() => setShowShapeMenu(!showShapeMenu)}
            className="flex flex-col items-center gap-1"
          >
            <div
              className={cn(
                "flex size-11 items-center justify-center rounded-full border border-line bg-white shadow-sm transition-colors",
                showShapeMenu && "border-accent bg-accent/10"
              )}
            >
              <Shapes className={cn("size-5", showShapeMenu ? "text-accent" : "text-ink")} />
            </div>
            <span className={cn("text-[10px]", showShapeMenu ? "text-accent" : "text-ink-soft")}>
              도형
            </span>
          </button>

          {/* 텍스트 */}
          <button
            onClick={handleAddText}
            className="flex flex-col items-center gap-1"
          >
            <div className="flex size-11 items-center justify-center rounded-full border border-line bg-white shadow-sm">
              <Type className="size-5 text-ink" />
            </div>
            <span className="text-[10px] text-ink-soft">텍스트</span>
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * 사이드바 버튼 (원형 배경 스타일)
 */
function SidebarButton({
  icon,
  label,
  onClick,
  hasDropdown = false,
  dropdownContent,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  hasDropdown?: boolean;
  dropdownContent?: React.ReactNode;
}) {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-1.5 transition-colors"
        title={label}
      >
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-full border border-line bg-white transition-all",
            "hover:border-accent hover:bg-bg-soft group-hover:shadow-md"
          )}
        >
          {icon}
        </div>
        <span className="text-[11px] text-ink-soft">{label}</span>
      </button>

      {/* 드롭다운 */}
      {hasDropdown && dropdownContent && (
        <div className="invisible absolute right-full top-0 mr-2 rounded-xl border border-line bg-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
          {dropdownContent}
        </div>
      )}
    </div>
  );
}

/**
 * 도형 버튼
 */
function ShapeButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-bg-soft"
      title={label}
    >
      {children}
      <span className="text-sm text-ink">{label}</span>
    </button>
  );
}
