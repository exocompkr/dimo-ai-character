"use client";

import { useCallback } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Type,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useStickerEditor } from "@/stores/stickerEditorStore";
import type { TextElement } from "../types/editor.types";
import {
  AVAILABLE_FONTS,
  FONT_SIZE_PRESETS,
  TEXT_COLORS,
} from "../config/fonts";

/**
 * 텍스트 편집 패널
 * - 선택된 텍스트 요소의 속성 편집
 * - 폰트, 크기, 색상, 정렬, 스타일 조절
 */
export function TextEditPanel() {
  const { elements, selectedIds, updateElement, saveToHistory } =
    useStickerEditor();

  // 선택된 텍스트 요소 찾기
  const selectedText = selectedIds.length === 1
    ? (elements.find(
        (el) => el.id === selectedIds[0] && el.type === "text"
      ) as TextElement | undefined)
    : undefined;

  // 업데이트 핸들러
  const handleUpdate = useCallback(
    (updates: Partial<TextElement>) => {
      if (!selectedText) return;
      updateElement(selectedText.id, updates);
      saveToHistory();
    },
    [selectedText, updateElement, saveToHistory]
  );

  // 텍스트 내용 변경
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      handleUpdate({ text: e.target.value });
    },
    [handleUpdate]
  );

  // 폰트 변경
  const handleFontChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      handleUpdate({ fontFamily: e.target.value });
    },
    [handleUpdate]
  );

  // 폰트 크기 변경
  const handleFontSizeChange = useCallback(
    (delta: number) => {
      if (!selectedText) return;
      const currentIndex = FONT_SIZE_PRESETS.indexOf(selectedText.fontSize);
      let newIndex: number;

      if (currentIndex === -1) {
        // 현재 크기가 프리셋에 없으면 가장 가까운 값 찾기
        newIndex = FONT_SIZE_PRESETS.findIndex(
          (size) => size >= selectedText.fontSize
        );
        if (newIndex === -1) newIndex = FONT_SIZE_PRESETS.length - 1;
      } else {
        newIndex = Math.max(
          0,
          Math.min(FONT_SIZE_PRESETS.length - 1, currentIndex + delta)
        );
      }

      handleUpdate({ fontSize: FONT_SIZE_PRESETS[newIndex] });
    },
    [selectedText, handleUpdate]
  );

  // 직접 크기 입력
  const handleFontSizeInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value > 0 && value <= 200) {
        handleUpdate({ fontSize: value });
      }
    },
    [handleUpdate]
  );

  // 굵게 토글
  const handleBoldToggle = useCallback(() => {
    if (!selectedText) return;
    const isBold =
      selectedText.fontStyle === "bold" ||
      selectedText.fontStyle === "bold italic";
    const isItalic =
      selectedText.fontStyle === "italic" ||
      selectedText.fontStyle === "bold italic";

    let newStyle: TextElement["fontStyle"];
    if (isBold) {
      newStyle = isItalic ? "italic" : "normal";
    } else {
      newStyle = isItalic ? "bold italic" : "bold";
    }
    handleUpdate({ fontStyle: newStyle });
  }, [selectedText, handleUpdate]);

  // 기울임 토글
  const handleItalicToggle = useCallback(() => {
    if (!selectedText) return;
    const isBold =
      selectedText.fontStyle === "bold" ||
      selectedText.fontStyle === "bold italic";
    const isItalic =
      selectedText.fontStyle === "italic" ||
      selectedText.fontStyle === "bold italic";

    let newStyle: TextElement["fontStyle"];
    if (isItalic) {
      newStyle = isBold ? "bold" : "normal";
    } else {
      newStyle = isBold ? "bold italic" : "italic";
    }
    handleUpdate({ fontStyle: newStyle });
  }, [selectedText, handleUpdate]);

  // 정렬 변경
  const handleAlignChange = useCallback(
    (align: TextElement["align"]) => {
      handleUpdate({ align });
    },
    [handleUpdate]
  );

  // 색상 변경
  const handleColorChange = useCallback(
    (color: string) => {
      handleUpdate({ fill: color });
    },
    [handleUpdate]
  );

  if (!selectedText) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <Type className="size-8 text-ink-soft" />
        <p className="text-sm text-ink-soft">
          텍스트를 선택하면
          <br />
          여기서 편집할 수 있어요
        </p>
      </div>
    );
  }

  const isBold =
    selectedText.fontStyle === "bold" ||
    selectedText.fontStyle === "bold italic";
  const isItalic =
    selectedText.fontStyle === "italic" ||
    selectedText.fontStyle === "bold italic";

  return (
    <div className="flex flex-col gap-3 lg:gap-4">
      {/* 텍스트 입력 */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-medium text-ink-soft lg:text-xs">텍스트</label>
        <textarea
          value={selectedText.text}
          onChange={handleTextChange}
          className="min-h-[48px] w-full resize-none rounded-lg border border-line bg-white p-2 text-xs text-ink outline-none focus:border-accent lg:min-h-[60px] lg:text-sm"
          placeholder="텍스트를 입력하세요"
        />
      </div>

      {/* 모바일: 폰트 + 크기를 가로 배치 */}
      <div className="flex gap-2 lg:hidden">
        {/* 폰트 선택 */}
        <select
          value={selectedText.fontFamily}
          onChange={handleFontChange}
          className="flex-1 rounded-lg border border-line bg-white p-1.5 text-xs text-ink outline-none focus:border-accent"
          style={{ fontFamily: selectedText.fontFamily }}
        >
          {AVAILABLE_FONTS.map((font) => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.label}
            </option>
          ))}
        </select>

        {/* 폰트 크기 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleFontSizeChange(-1)}
            className="flex size-7 items-center justify-center rounded-lg border border-line bg-white text-ink transition-colors hover:bg-bg-soft"
          >
            <Minus className="size-3" />
          </button>
          <input
            type="number"
            value={selectedText.fontSize}
            onChange={handleFontSizeInput}
            min={8}
            max={200}
            className="w-12 rounded-lg border border-line bg-white p-1.5 text-center text-xs text-ink outline-none focus:border-accent"
          />
          <button
            onClick={() => handleFontSizeChange(1)}
            className="flex size-7 items-center justify-center rounded-lg border border-line bg-white text-ink transition-colors hover:bg-bg-soft"
          >
            <Plus className="size-3" />
          </button>
        </div>
      </div>

      {/* 데스크탑: 폰트 선택 */}
      <div className="hidden flex-col gap-1.5 lg:flex">
        <label className="text-xs font-medium text-ink-soft">폰트</label>
        <select
          value={selectedText.fontFamily}
          onChange={handleFontChange}
          className="w-full rounded-lg border border-line bg-white p-2 text-sm text-ink outline-none focus:border-accent"
          style={{ fontFamily: selectedText.fontFamily }}
        >
          <optgroup label="산세리프">
            {AVAILABLE_FONTS.filter((f) => f.category === "sans-serif").map(
              (font) => (
                <option
                  key={font.value}
                  value={font.value}
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </option>
              )
            )}
          </optgroup>
          <optgroup label="세리프">
            {AVAILABLE_FONTS.filter((f) => f.category === "serif").map(
              (font) => (
                <option
                  key={font.value}
                  value={font.value}
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </option>
              )
            )}
          </optgroup>
          <optgroup label="손글씨">
            {AVAILABLE_FONTS.filter((f) => f.category === "handwriting").map(
              (font) => (
                <option
                  key={font.value}
                  value={font.value}
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </option>
              )
            )}
          </optgroup>
          <optgroup label="디스플레이">
            {AVAILABLE_FONTS.filter((f) => f.category === "display").map(
              (font) => (
                <option
                  key={font.value}
                  value={font.value}
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </option>
              )
            )}
          </optgroup>
        </select>
      </div>

      {/* 폰트 크기 - 데스크탑만 */}
      <div className="hidden flex-col gap-1.5 lg:flex">
        <label className="text-xs font-medium text-ink-soft">크기</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleFontSizeChange(-1)}
            className="flex size-8 items-center justify-center rounded-lg border border-line bg-white text-ink transition-colors hover:bg-bg-soft"
          >
            <Minus className="size-4" />
          </button>
          <input
            type="number"
            value={selectedText.fontSize}
            onChange={handleFontSizeInput}
            min={8}
            max={200}
            className="w-16 rounded-lg border border-line bg-white p-2 text-center text-sm text-ink outline-none focus:border-accent"
          />
          <button
            onClick={() => handleFontSizeChange(1)}
            className="flex size-8 items-center justify-center rounded-lg border border-line bg-white text-ink transition-colors hover:bg-bg-soft"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {/* 스타일 & 정렬 */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-medium text-ink-soft lg:text-xs">스타일</label>
        <div className="flex gap-1">
          {/* 굵게 */}
          <button
            onClick={handleBoldToggle}
            className={cn(
              "flex size-7 items-center justify-center rounded-lg border transition-colors lg:size-9",
              isBold
                ? "border-accent bg-peach text-accent"
                : "border-line bg-white text-ink hover:bg-bg-soft"
            )}
            title="굵게"
          >
            <Bold className="size-3.5 lg:size-4" />
          </button>
          {/* 기울임 */}
          <button
            onClick={handleItalicToggle}
            className={cn(
              "flex size-7 items-center justify-center rounded-lg border transition-colors lg:size-9",
              isItalic
                ? "border-accent bg-peach text-accent"
                : "border-line bg-white text-ink hover:bg-bg-soft"
            )}
            title="기울임"
          >
            <Italic className="size-3.5 lg:size-4" />
          </button>

          <div className="mx-0.5 w-px bg-line lg:mx-1" />

          {/* 왼쪽 정렬 */}
          <button
            onClick={() => handleAlignChange("left")}
            className={cn(
              "flex size-7 items-center justify-center rounded-lg border transition-colors lg:size-9",
              selectedText.align === "left"
                ? "border-accent bg-peach text-accent"
                : "border-line bg-white text-ink hover:bg-bg-soft"
            )}
            title="왼쪽 정렬"
          >
            <AlignLeft className="size-3.5 lg:size-4" />
          </button>
          {/* 가운데 정렬 */}
          <button
            onClick={() => handleAlignChange("center")}
            className={cn(
              "flex size-7 items-center justify-center rounded-lg border transition-colors lg:size-9",
              selectedText.align === "center"
                ? "border-accent bg-peach text-accent"
                : "border-line bg-white text-ink hover:bg-bg-soft"
            )}
            title="가운데 정렬"
          >
            <AlignCenter className="size-3.5 lg:size-4" />
          </button>
          {/* 오른쪽 정렬 */}
          <button
            onClick={() => handleAlignChange("right")}
            className={cn(
              "flex size-7 items-center justify-center rounded-lg border transition-colors lg:size-9",
              selectedText.align === "right"
                ? "border-accent bg-peach text-accent"
                : "border-line bg-white text-ink hover:bg-bg-soft"
            )}
            title="오른쪽 정렬"
          >
            <AlignRight className="size-3.5 lg:size-4" />
          </button>
        </div>
      </div>

      {/* 색상 */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-medium text-ink-soft lg:text-xs">색상</label>
        <div className="flex flex-wrap gap-1 lg:gap-1.5">
          {TEXT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={cn(
                "size-6 rounded-md border-2 transition-transform hover:scale-110 lg:size-7 lg:rounded-lg",
                selectedText.fill === color
                  ? "border-accent"
                  : "border-transparent"
              )}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        {/* 커스텀 색상 입력 - 데스크탑만 */}
        <div className="hidden items-center gap-2 lg:flex">
          <input
            type="color"
            value={selectedText.fill}
            onChange={(e) => handleColorChange(e.target.value)}
            className="size-7 cursor-pointer rounded border border-line"
          />
          <input
            type="text"
            value={selectedText.fill}
            onChange={(e) => handleColorChange(e.target.value)}
            className="flex-1 rounded-lg border border-line bg-white px-2 py-1 text-xs text-ink outline-none focus:border-accent"
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );
}
