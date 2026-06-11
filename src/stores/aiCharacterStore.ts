"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CharacterStyle } from "@/types/character-style";
import characterStylesData from "@/data/character-styles.json";

// JSON에서 스타일 데이터 로드
export const CHARACTER_STYLES: CharacterStyle[] = characterStylesData.styles;

// 타입 re-export (기존 import 호환성 유지)
export type { CharacterStyle } from "@/types/character-style";

interface AiCharacterState {
  /** 업로드한 원본 이미지 (base64) */
  uploadedImage: string | null;
  /** 선택한 스타일 ID */
  selectedStyleId: string | null;
  /** 생성된 캐릭터 이미지 (base64, 투명 배경 PNG) */
  generatedImage: string | null;
  /** 생성 중 상태 */
  isGenerating: boolean;
  /** 에러 메시지 */
  error: string | null;

  /** 이미지 업로드 */
  setUploadedImage: (base64: string) => void;
  /** 업로드한 이미지 초기화 */
  clearUploadedImage: () => void;
  /** 스타일 선택 */
  setSelectedStyle: (styleId: string) => void;
  /** 생성된 이미지 설정 */
  setGeneratedImage: (base64: string) => void;
  /** 생성 상태 설정 */
  setIsGenerating: (isGenerating: boolean) => void;
  /** 에러 설정 */
  setError: (error: string | null) => void;
  /** 선택한 스타일 가져오기 */
  getSelectedStyle: () => CharacterStyle | undefined;
  /** 전체 초기화 */
  reset: () => void;
  /** 생성 결과만 초기화 (다시 생성용) */
  resetGeneration: () => void;
}

const initialState = {
  uploadedImage: null,
  selectedStyleId: null,
  generatedImage: null,
  isGenerating: false,
  error: null,
};

/**
 * AI 캐릭터 생성 상태 관리 Store.
 * localStorage에 persist하여 페이지 이동/새로고침에도 상태 유지.
 */
export const useAiCharacter = create<AiCharacterState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUploadedImage: (base64) =>
        set({
          uploadedImage: base64,
          // 새 이미지 업로드 시 이전 생성 결과 초기화
          generatedImage: null,
          error: null,
        }),

      clearUploadedImage: () =>
        set({
          uploadedImage: null,
          generatedImage: null,
          error: null,
        }),

      setSelectedStyle: (styleId) =>
        set({
          selectedStyleId: styleId,
          // 스타일 변경 시 이전 생성 결과 초기화
          generatedImage: null,
          error: null,
        }),

      setGeneratedImage: (base64) =>
        set({
          generatedImage: base64,
          isGenerating: false,
          error: null,
        }),

      setIsGenerating: (isGenerating) => set({ isGenerating }),

      setError: (error) =>
        set({
          error,
          isGenerating: false,
        }),

      getSelectedStyle: () => {
        const { selectedStyleId } = get();
        return CHARACTER_STYLES.find((s) => s.id === selectedStyleId);
      },

      reset: () => set(initialState),

      resetGeneration: () =>
        set({
          generatedImage: null,
          isGenerating: false,
          error: null,
        }),
    }),
    {
      name: "dimo-ai-character",
    }
  )
);
