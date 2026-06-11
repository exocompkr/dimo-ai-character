"use client";

import { create } from "zustand";
import type {
  StickerEditorStore,
  EditorElement,
  NewEditorElement,
  EditorStep,
  AlignDirection,
  HistorySnapshot,
  PaperTypeId,
  SizeOptionId,
  PlacedSticker,
} from "@/features/sticker-editor/types/editor.types";
import { PAPER_TYPES, getSizeOption } from "@/features/sticker-editor/config/paper-options";

/** 고유 ID 생성 */
function generateId(): string {
  return `el_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** 초기 상태 */
const initialState = {
  canvas: {
    width: 600,
    height: 600,
    zoom: 1,
    dpi: 72,
    backgroundColor: "#ffffff",
  },
  elements: [] as EditorElement[],
  selectedIds: [] as string[],
  groups: [],
  history: [] as HistorySnapshot[],
  historyIndex: -1,
  maxHistorySize: 50,
  cutline: {
    offset: 2, // 2mm
    color: "#ff8fa3", // 진한 핑크 (더 잘 보임)
    strokeWidth: 2,
    path: null,
  },
  fabric: {
    selectedPaperType: null as PaperTypeId | null,
    selectedSize: null as SizeOptionId | null,
    quantity: 1,
  },
  layout: {
    placedStickers: [] as PlacedSticker[],
    selectedStickerId: null as string | null,
    stickerImage: null as string | null,
    stickerSize: { width: 100, height: 100 },
  },
  step: "edit" as EditorStep,
  initialImage: null as string | null,
};

/**
 * 스티커 편집기 Zustand Store
 * NOTE: persist 제거 - base64 이미지가 localStorage 용량을 초과함
 */
export const useStickerEditor = create<StickerEditorStore>()((set, get) => ({
      ...initialState,

      // ─────────────────────────────────────────────
      // 초기화
      // ─────────────────────────────────────────────

      initialize: (image: string) => {
        const id = generateId();
        const initialElement: EditorElement = {
          id,
          type: "image",
          src: image,
          x: 300, // 캔버스 중앙
          y: 300,
          width: 200,
          height: 200,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          zIndex: 0,
          visible: true,
          locked: false,
          name: "AI 캐릭터",
        };

        set({
          ...initialState,
          initialImage: image,
          elements: [initialElement],
          selectedIds: [id],
          history: [
            {
              elements: [initialElement],
              selectedIds: [id],
              timestamp: Date.now(),
            },
          ],
          historyIndex: 0,
        });
      },

      reset: () => set(initialState),

      // ─────────────────────────────────────────────
      // 요소 관리
      // ─────────────────────────────────────────────

      addElement: (elementData) => {
        const id = generateId();
        const { elements } = get();
        const maxZIndex = elements.length > 0
          ? Math.max(...elements.map((e) => e.zIndex))
          : -1;

        const newElement: EditorElement = {
          ...elementData,
          id,
          zIndex: maxZIndex + 1,
        } as EditorElement;

        set((state) => ({
          elements: [...state.elements, newElement],
          selectedIds: [id],
        }));

        get().saveToHistory();
        return id;
      },

      updateElement: (id, updates) => {
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? ({ ...el, ...updates } as EditorElement) : el
          ),
        }));
      },

      removeElement: (id) => {
        set((state) => ({
          elements: state.elements.filter((el) => el.id !== id),
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
        }));
        get().saveToHistory();
      },

      duplicateElement: (id) => {
        const { elements } = get();
        const element = elements.find((el) => el.id === id);
        if (!element) return null;

        const newId = generateId();
        const maxZIndex = Math.max(...elements.map((e) => e.zIndex));

        const duplicated: EditorElement = {
          ...element,
          id: newId,
          x: element.x + 20,
          y: element.y + 20,
          zIndex: maxZIndex + 1,
          name: element.name ? `${element.name} (복사)` : undefined,
        };

        set((state) => ({
          elements: [...state.elements, duplicated],
          selectedIds: [newId],
        }));

        get().saveToHistory();
        return newId;
      },

      // ─────────────────────────────────────────────
      // 선택
      // ─────────────────────────────────────────────

      setSelectedIds: (ids) => set({ selectedIds: ids }),

      selectAll: () =>
        set((state) => ({
          selectedIds: state.elements
            .filter((el) => !el.locked)
            .map((el) => el.id),
        })),

      deselectAll: () => set({ selectedIds: [] }),

      // ─────────────────────────────────────────────
      // Z-Index
      // ─────────────────────────────────────────────

      bringForward: (id) => {
        const { elements } = get();
        const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
        const index = sorted.findIndex((el) => el.id === id);

        if (index < sorted.length - 1) {
          // 다음 요소와 zIndex 교환
          const current = sorted[index];
          const next = sorted[index + 1];

          set((state) => ({
            elements: state.elements.map((el) => {
              if (el.id === current.id) return { ...el, zIndex: next.zIndex };
              if (el.id === next.id) return { ...el, zIndex: current.zIndex };
              return el;
            }),
          }));
          get().saveToHistory();
        }
      },

      sendBackward: (id) => {
        const { elements } = get();
        const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
        const index = sorted.findIndex((el) => el.id === id);

        if (index > 0) {
          const current = sorted[index];
          const prev = sorted[index - 1];

          set((state) => ({
            elements: state.elements.map((el) => {
              if (el.id === current.id) return { ...el, zIndex: prev.zIndex };
              if (el.id === prev.id) return { ...el, zIndex: current.zIndex };
              return el;
            }),
          }));
          get().saveToHistory();
        }
      },

      bringToFront: (id) => {
        const { elements } = get();
        const maxZIndex = Math.max(...elements.map((e) => e.zIndex));

        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, zIndex: maxZIndex + 1 } : el
          ),
        }));
        get().saveToHistory();
      },

      sendToBack: (id) => {
        const { elements } = get();
        const minZIndex = Math.min(...elements.map((e) => e.zIndex));

        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, zIndex: minZIndex - 1 } : el
          ),
        }));
        get().saveToHistory();
      },

      // ─────────────────────────────────────────────
      // 변형
      // ─────────────────────────────────────────────

      flipHorizontal: (id) => {
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, scaleX: el.scaleX * -1 } : el
          ),
        }));
        get().saveToHistory();
      },

      flipVertical: (id) => {
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, scaleY: el.scaleY * -1 } : el
          ),
        }));
        get().saveToHistory();
      },

      align: (direction: AlignDirection) => {
        const { elements, selectedIds, canvas } = get();
        if (selectedIds.length === 0) return;

        const selectedElements = elements.filter((el) =>
          selectedIds.includes(el.id)
        );

        let updates: { id: string; x?: number; y?: number }[] = [];

        switch (direction) {
          case "left":
            updates = selectedElements.map((el) => ({
              id: el.id,
              x: el.width / 2,
            }));
            break;
          case "center":
            updates = selectedElements.map((el) => ({
              id: el.id,
              x: canvas.width / 2,
            }));
            break;
          case "right":
            updates = selectedElements.map((el) => ({
              id: el.id,
              x: canvas.width - el.width / 2,
            }));
            break;
          case "top":
            updates = selectedElements.map((el) => ({
              id: el.id,
              y: el.height / 2,
            }));
            break;
          case "middle":
            updates = selectedElements.map((el) => ({
              id: el.id,
              y: canvas.height / 2,
            }));
            break;
          case "bottom":
            updates = selectedElements.map((el) => ({
              id: el.id,
              y: canvas.height - el.height / 2,
            }));
            break;
        }

        set((state) => ({
          elements: state.elements.map((el) => {
            const update = updates.find((u) => u.id === el.id);
            if (update) {
              return {
                ...el,
                ...(update.x !== undefined && { x: update.x }),
                ...(update.y !== undefined && { y: update.y }),
              };
            }
            return el;
          }),
        }));
        get().saveToHistory();
      },

      // ─────────────────────────────────────────────
      // 그룹
      // ─────────────────────────────────────────────

      groupSelected: () => {
        const { selectedIds, groups } = get();
        if (selectedIds.length < 2) return;

        const groupId = `group_${Date.now()}`;
        set({
          groups: [...groups, { id: groupId, elementIds: [...selectedIds] }],
        });
        get().saveToHistory();
      },

      ungroupSelected: () => {
        const { selectedIds, groups } = get();

        set({
          groups: groups.filter(
            (g) => !selectedIds.some((id) => g.elementIds.includes(id))
          ),
        });
        get().saveToHistory();
      },

      // ─────────────────────────────────────────────
      // 히스토리
      // ─────────────────────────────────────────────

      saveToHistory: () => {
        const { elements, selectedIds, history, historyIndex, maxHistorySize } =
          get();

        const snapshot: HistorySnapshot = {
          elements: JSON.parse(JSON.stringify(elements)),
          selectedIds: [...selectedIds],
          timestamp: Date.now(),
        };

        // 현재 인덱스 이후의 히스토리 제거 (새 분기)
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(snapshot);

        // 최대 크기 초과 시 오래된 항목 제거
        if (newHistory.length > maxHistorySize) {
          newHistory.shift();
        }

        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex <= 0) return;

        const newIndex = historyIndex - 1;
        const snapshot = history[newIndex];

        set({
          elements: JSON.parse(JSON.stringify(snapshot.elements)),
          selectedIds: [...snapshot.selectedIds],
          historyIndex: newIndex,
        });
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return;

        const newIndex = historyIndex + 1;
        const snapshot = history[newIndex];

        set({
          elements: JSON.parse(JSON.stringify(snapshot.elements)),
          selectedIds: [...snapshot.selectedIds],
          historyIndex: newIndex,
        });
      },

      canUndo: () => get().historyIndex > 0,

      canRedo: () => get().historyIndex < get().history.length - 1,

      // ─────────────────────────────────────────────
      // 칼선
      // ─────────────────────────────────────────────

      setCutlineOffset: (offset) =>
        set((state) => ({
          cutline: { ...state.cutline, offset },
        })),

      setCutlinePath: (path) =>
        set((state) => ({
          cutline: { ...state.cutline, path },
        })),

      // ─────────────────────────────────────────────
      // 단계 전환
      // ─────────────────────────────────────────────

      setStep: (step) => set({ step }),

      goToEdit: () => set({ step: "edit" }),

      goToCutline: () => {
        get().saveToHistory();
        set({ step: "cutline" });
      },

      goToFabric: () => set({ step: "fabric" }),

      goToLayout: () => set({ step: "layout" }),

      goToOrder: () => set({ step: "order" }),

      goToComplete: () => set({ step: "complete" }),

      // ─────────────────────────────────────────────
      // 원단 설정
      // ─────────────────────────────────────────────

      setPaperType: (paperType: PaperTypeId) => {
        const paper = PAPER_TYPES.find((p) => p.id === paperType);
        const currentSize = get().fabric.selectedSize;

        // 선택된 용지에서 현재 크기가 사용 불가능하면 첫 번째 가능한 크기로 변경
        const isCurrentSizeAvailable =
          currentSize && paper?.availableSizes.includes(currentSize);

        set((state) => ({
          fabric: {
            ...state.fabric,
            selectedPaperType: paperType,
            selectedSize: isCurrentSizeAvailable
              ? currentSize
              : paper?.availableSizes[0] ?? null,
          },
        }));
      },

      setSize: (size: SizeOptionId) =>
        set((state) => ({
          fabric: { ...state.fabric, selectedSize: size },
        })),

      setQuantity: (quantity: number) =>
        set((state) => ({
          fabric: { ...state.fabric, quantity: Math.max(1, quantity) },
        })),

      // ─────────────────────────────────────────────
      // 스티커 배치
      // ─────────────────────────────────────────────

      setStickerImage: (image, size) =>
        set((state) => ({
          layout: { ...state.layout, stickerImage: image, stickerSize: size },
        })),

      addPlacedSticker: (sticker) => {
        const id = generateId();
        const newSticker: PlacedSticker = {
          id,
          x: sticker?.x ?? 100,
          y: sticker?.y ?? 100,
          scale: sticker?.scale ?? 1,
          rotation: sticker?.rotation ?? 0,
        };

        set((state) => ({
          layout: {
            ...state.layout,
            placedStickers: [...state.layout.placedStickers, newSticker],
            selectedStickerId: id,
          },
        }));

        return id;
      },

      removePlacedSticker: (id) =>
        set((state) => ({
          layout: {
            ...state.layout,
            placedStickers: state.layout.placedStickers.filter((s) => s.id !== id),
            selectedStickerId:
              state.layout.selectedStickerId === id
                ? null
                : state.layout.selectedStickerId,
          },
        })),

      updatePlacedSticker: (id, updates) =>
        set((state) => ({
          layout: {
            ...state.layout,
            placedStickers: state.layout.placedStickers.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
          },
        })),

      selectPlacedSticker: (id) =>
        set((state) => ({
          layout: { ...state.layout, selectedStickerId: id },
        })),

      autoLayoutStickers: (count) => {
        const { fabric, layout } = get();
        const sizeOption = fabric.selectedSize
          ? getSizeOption(fabric.selectedSize)
          : null;

        if (!sizeOption) return;

        // mm to px 변환 (1mm = 3.78px at 96dpi)
        const PX_PER_MM = 3.78;
        const artboardWidth = sizeOption.width * PX_PER_MM;
        const artboardHeight = sizeOption.height * PX_PER_MM;

        // 스티커 크기 (칼선 포함)
        const stickerW = layout.stickerSize.width;
        const stickerH = layout.stickerSize.height;

        // 아트보드 가장자리 여백
        const padding = 20;
        // 스티커 간 간격 (칼선이 겹치지 않도록 최소 간격)
        const gap = 5;

        // 배치 가능한 열/행 수 계산
        const cols = Math.floor(
          (artboardWidth - padding * 2 + gap) / (stickerW + gap)
        );
        const rows = Math.floor(
          (artboardHeight - padding * 2 + gap) / (stickerH + gap)
        );

        const maxCount = cols * rows;
        const actualCount = Math.min(count, maxCount);

        const stickers: PlacedSticker[] = [];

        for (let i = 0; i < actualCount; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);

          stickers.push({
            id: generateId(),
            x: padding + col * (stickerW + gap) + stickerW / 2,
            y: padding + row * (stickerH + gap) + stickerH / 2,
            scale: 1,
            rotation: 0,
          });
        }

        set((state) => ({
          layout: {
            ...state.layout,
            placedStickers: stickers,
            selectedStickerId: null,
          },
        }));
      },

      clearPlacedStickers: () =>
        set((state) => ({
          layout: {
            ...state.layout,
            placedStickers: [],
            selectedStickerId: null,
          },
        })),

      // ─────────────────────────────────────────────
      // 캔버스
      // ─────────────────────────────────────────────

      setZoom: (zoom) =>
        set((state) => ({
          canvas: { ...state.canvas, zoom: Math.max(0.1, Math.min(3, zoom)) },
        })),
}));
