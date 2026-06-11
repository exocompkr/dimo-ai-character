"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAiCharacter } from "@/stores/aiCharacterStore";
import { useStickerEditor } from "@/stores/stickerEditorStore";
import { StickerEditorPage } from "@/features/sticker-editor/components/StickerEditorPage";

/** 테스트용 샘플 이미지 (스타일 프리뷰 이미지 사용) */
const TEST_IMAGE = "/images/styles/cute-sd.png";

/**
 * 스티커 편집기 페이지 (Suspense 래퍼)
 */
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      }
    >
      <StickerEditorContent />
    </Suspense>
  );
}

/**
 * 스티커 편집기 컨텐츠
 * - AI 캐릭터 스토어에서 생성된 이미지를 가져와 편집기 초기화
 * - ?test=1 파라미터가 있으면 테스트 이미지 사용
 * - 이미지가 없으면 테스트 이미지로 시작
 */
function StickerEditorContent() {
  const searchParams = useSearchParams();
  const { generatedImage } = useAiCharacter();
  const { initialize, initialImage, elements, goToEdit } = useStickerEditor();
  const [mounted, setMounted] = useState(false);
  const hasInitialized = useRef(false);

  const isTestMode = searchParams.get("test") === "1";

  useEffect(() => {
    setMounted(true);
  }, []);

  // 초기화 로직 (페이지 진입 시 1회만 실행)
  useEffect(() => {
    if (!mounted || hasInitialized.current) return;

    // 새로운 AI 이미지가 있으면 편집기 초기화
    if (generatedImage && generatedImage !== initialImage) {
      initialize(generatedImage);
      hasInitialized.current = true;
      return;
    }

    // 이미 요소가 있으면 step을 edit으로 리셋 (완료 후 재진입 시)
    if (elements.length > 0) {
      const currentStep = useStickerEditor.getState().step;
      if (currentStep === "complete") {
        goToEdit();
      }
      hasInitialized.current = true;
      return;
    }

    // 테스트 모드이거나 이미지가 없으면 테스트 이미지 사용
    if (isTestMode || (!generatedImage && !initialImage)) {
      initialize(TEST_IMAGE);
      hasInitialized.current = true;
    }
  }, [mounted, generatedImage, initialImage, initialize, isTestMode, elements.length, goToEdit]);

  // 로딩 중
  if (!mounted || elements.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    );
  }

  return <StickerEditorPage />;
}
