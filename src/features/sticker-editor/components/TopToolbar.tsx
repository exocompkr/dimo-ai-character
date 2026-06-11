"use client";

import {
  Undo2,
  Redo2,
  Layers,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Group,
  Ungroup,
  FlipHorizontal2,
  FlipVertical2,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useStickerEditor } from "@/stores/stickerEditorStore";
import type { AlignDirection } from "../types/editor.types";

/**
 * 상단 툴바
 * 레퍼런스: image1.png 상단 아이콘 바
 */
export function TopToolbar() {
  const {
    selectedIds,
    elements,
    canUndo,
    canRedo,
    undo,
    redo,
    duplicateElement,
    removeElement,
    bringForward,
    sendBackward,
    groupSelected,
    ungroupSelected,
    flipHorizontal,
    flipVertical,
    align,
    updateElement,
    saveToHistory,
    goToCutline,
  } = useStickerEditor();

  const hasSelection = selectedIds.length > 0;
  const hasMultipleSelection = selectedIds.length > 1;
  const firstSelectedId = selectedIds[0];

  const handleDuplicate = () => {
    if (firstSelectedId) {
      duplicateElement(firstSelectedId);
    }
  };

  const handleDelete = () => {
    selectedIds.forEach((id) => removeElement(id));
  };

  const handleBringForward = () => {
    if (firstSelectedId) {
      bringForward(firstSelectedId);
    }
  };

  const handleSendBackward = () => {
    if (firstSelectedId) {
      sendBackward(firstSelectedId);
    }
  };

  const handleFlipH = () => {
    if (firstSelectedId) {
      flipHorizontal(firstSelectedId);
    }
  };

  const handleFlipV = () => {
    if (firstSelectedId) {
      flipVertical(firstSelectedId);
    }
  };

  const handleAlign = (direction: AlignDirection) => {
    align(direction);
  };

  // 90도 회전
  const handleRotate = () => {
    if (firstSelectedId) {
      const element = elements.find((e) => e.id === firstSelectedId);
      if (element) {
        updateElement(firstSelectedId, {
          rotation: (element.rotation + 90) % 360,
        });
        saveToHistory();
      }
    }
  };

  return (
    <div className="flex flex-col border-b border-line bg-white lg:flex-row lg:h-14 lg:items-center">
      {/* 모바일: 스크롤 가능한 툴바 영역 */}
      <div className="flex h-12 items-center gap-0.5 overflow-x-auto px-2 lg:h-auto lg:flex-1 lg:gap-1 lg:px-4">
        {/* Undo / Redo */}
        <ToolbarButton
          icon={<Undo2 className="size-4 lg:size-5" />}
          label="취소"
          onClick={undo}
          disabled={!canUndo()}
        />
        <ToolbarButton
          icon={<Redo2 className="size-4 lg:size-5" />}
          label="다시"
          onClick={redo}
          disabled={!canRedo()}
        />

        <ToolbarDivider />

        {/* 레이어 (placeholder) */}
        <ToolbarButton
          icon={<Layers className="size-4 lg:size-5" />}
          label="레이어"
          disabled
        />

        {/* 복제 / 삭제 */}
        <ToolbarButton
          icon={<Copy className="size-4 lg:size-5" />}
          label="복제"
          onClick={handleDuplicate}
          disabled={!hasSelection}
        />
        <ToolbarButton
          icon={<Trash2 className="size-4 lg:size-5" />}
          label="삭제"
          onClick={handleDelete}
          disabled={!hasSelection}
        />

        <ToolbarDivider />

        {/* 앞으로 / 뒤로 */}
        <ToolbarButton
          icon={<ArrowUp className="size-4 lg:size-5" />}
          label="앞으로"
          onClick={handleBringForward}
          disabled={!hasSelection}
        />
        <ToolbarButton
          icon={<ArrowDown className="size-4 lg:size-5" />}
          label="뒤로"
          onClick={handleSendBackward}
          disabled={!hasSelection}
        />

        <ToolbarDivider />

        {/* 그룹 / 그룹해제 */}
        <ToolbarButton
          icon={<Group className="size-4 lg:size-5" />}
          label="그룹"
          onClick={groupSelected}
          disabled={!hasMultipleSelection}
        />
        <ToolbarButton
          icon={<Ungroup className="size-4 lg:size-5" />}
          label="해제"
          onClick={ungroupSelected}
          disabled={!hasSelection}
        />

        <ToolbarDivider />

        {/* 좌우반전 / 상하반전 / 회전 */}
        <ToolbarButton
          icon={<FlipHorizontal2 className="size-4 lg:size-5" />}
          label="좌우"
          onClick={handleFlipH}
          disabled={!hasSelection}
        />
        <ToolbarButton
          icon={<FlipVertical2 className="size-4 lg:size-5" />}
          label="상하"
          onClick={handleFlipV}
          disabled={!hasSelection}
        />
        <ToolbarButton
          icon={<RotateCw className="size-4 lg:size-5" />}
          label="회전"
          onClick={handleRotate}
          disabled={!hasSelection}
        />

        <ToolbarDivider />

        {/* 수평 정렬 (좌/중/우) */}
        <ToolbarButton
          icon={<AlignHorizontalJustifyStart className="size-4 lg:size-5" />}
          label="왼쪽"
          onClick={() => handleAlign("left")}
          disabled={!hasSelection}
        />
        <ToolbarButton
          icon={<AlignHorizontalJustifyCenter className="size-4 lg:size-5" />}
          label="가운데"
          onClick={() => handleAlign("center")}
          disabled={!hasSelection}
        />
        <ToolbarButton
          icon={<AlignHorizontalJustifyEnd className="size-4 lg:size-5" />}
          label="오른쪽"
          onClick={() => handleAlign("right")}
          disabled={!hasSelection}
        />
        {/* 수직 정렬 (상/중/하) - 데스크탑에서만 표시 */}
        <div className="hidden lg:contents">
          <ToolbarButton
            icon={<AlignVerticalJustifyStart className="size-4 lg:size-5" />}
            label="위"
            onClick={() => handleAlign("top")}
            disabled={!hasSelection}
          />
          <ToolbarButton
            icon={<AlignVerticalJustifyCenter className="size-4 lg:size-5" />}
            label="중간"
            onClick={() => handleAlign("middle")}
            disabled={!hasSelection}
          />
          <ToolbarButton
            icon={<AlignVerticalJustifyEnd className="size-4 lg:size-5" />}
            label="아래"
            onClick={() => handleAlign("bottom")}
            disabled={!hasSelection}
          />
        </div>

        {/* 스페이서 - 데스크탑 */}
        <div className="hidden flex-1 lg:block" />

        {/* 스티커 만들기 버튼 - 데스크탑 */}
        <button
          onClick={goToCutline}
          className="ml-2 hidden items-center gap-2 rounded-xl bg-accent px-4 py-2 text-white shadow-md transition-all hover:bg-accent-deep hover:shadow-lg active:scale-95 lg:flex"
        >
          <Sparkles className="size-5" />
          <span className="text-sm font-bold">스티커 만들기</span>
        </button>
      </div>

      {/* 모바일: 스티커 만들기 버튼 (하단 고정) */}
      <div className="flex items-center justify-center border-t border-line p-2 lg:hidden">
        <button
          onClick={goToCutline}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-white shadow-md transition-all hover:bg-accent-deep active:scale-95"
        >
          <Sparkles className="size-4" />
          <span className="text-sm font-bold">스티커 만들기</span>
        </button>
      </div>
    </div>
  );
}

/**
 * 툴바 버튼 컴포넌트
 */
function ToolbarButton({
  icon,
  label,
  onClick,
  disabled = false,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-1.5 py-1 transition-colors lg:px-2 lg:py-1.5",
        disabled
          ? "cursor-not-allowed opacity-40"
          : "hover:bg-bg-soft active:bg-peach",
        active && "bg-peach"
      )}
      title={label}
    >
      {icon}
      <span className="whitespace-nowrap text-[9px] text-ink-soft lg:text-[10px]">{label}</span>
    </button>
  );
}

/**
 * 툴바 구분선
 */
function ToolbarDivider() {
  return <div className="mx-0.5 h-6 w-px shrink-0 bg-line lg:mx-1 lg:h-8" />;
}
