"use client";

import { useEffect, useCallback } from "react";
import { useStickerEditor } from "@/stores/stickerEditorStore";

/**
 * 편집기 키보드 단축키 훅
 *
 * 지원하는 단축키:
 * - Ctrl/Cmd + Z: 실행 취소
 * - Ctrl/Cmd + Shift + Z / Ctrl + Y: 다시 실행
 * - Delete / Backspace: 선택 요소 삭제
 * - Ctrl/Cmd + D: 복제
 * - Ctrl/Cmd + A: 전체 선택
 * - Escape: 선택 해제
 */
export function useEditorKeyboard() {
  const {
    selectedIds,
    undo,
    redo,
    canUndo,
    canRedo,
    removeElement,
    duplicateElement,
    selectAll,
    deselectAll,
  } = useStickerEditor();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // 입력 필드에서는 단축키 무시
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Undo: Ctrl/Cmd + Z
      if (cmdOrCtrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
        return;
      }

      // Redo: Ctrl/Cmd + Shift + Z 또는 Ctrl + Y
      if (
        (cmdOrCtrl && e.key === "z" && e.shiftKey) ||
        (cmdOrCtrl && e.key === "y")
      ) {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
        return;
      }

      // Delete: Delete 또는 Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        selectedIds.forEach((id) => removeElement(id));
        return;
      }

      // Duplicate: Ctrl/Cmd + D
      if (cmdOrCtrl && e.key === "d") {
        e.preventDefault();
        if (selectedIds.length > 0) {
          duplicateElement(selectedIds[0]);
        }
        return;
      }

      // Select All: Ctrl/Cmd + A
      if (cmdOrCtrl && e.key === "a") {
        e.preventDefault();
        selectAll();
        return;
      }

      // Deselect: Escape
      if (e.key === "Escape") {
        e.preventDefault();
        deselectAll();
        return;
      }
    },
    [
      selectedIds,
      undo,
      redo,
      canUndo,
      canRedo,
      removeElement,
      duplicateElement,
      selectAll,
      deselectAll,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}
