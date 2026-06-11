"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  RefreshCw,
  Check,
  ImageIcon,
  UploadCloud,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  useAiCharacter,
  CHARACTER_STYLES,
  type CharacterStyle,
} from "@/stores/aiCharacterStore";

/**
 * AI 캐릭터 생성 페이지
 * - 좌측: 업로드한 원본 이미지 (없으면 업로드 영역)
 * - 우측: 스타일 선택 Grid + 생성 버튼
 * - 생성 완료 시: 결과 이미지 표시
 */
export default function AiCharacterPage() {
  const router = useRouter();
  const {
    uploadedImage,
    selectedStyleId,
    generatedImage,
    error,
    setUploadedImage,
    clearUploadedImage,
    setSelectedStyle,
    setGeneratedImage,
    setError,
    resetGeneration,
    reset,
  } = useAiCharacter();

  const [mounted, setMounted] = useState(false);
  // 로컬 state로 관리하여 즉시 UI 반영 (Zustand persist 지연 문제 해결)
  const [isGenerating, setIsGenerating] = useState(false);

  // Hydration 이슈 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    );
  }

  const selectedStyle = CHARACTER_STYLES.find((s) => s.id === selectedStyleId);

  const handleGenerate = async () => {
    if (!selectedStyleId || !uploadedImage || !selectedStyle) return;

    console.log("[AI Character] Starting generation...");
    setIsGenerating(true);
    setError(null);

    try {
      // 스타일 참조 이미지를 base64로 변환
      let styleImage: string | undefined;
      if (selectedStyle.previewImage) {
        try {
          const styleResponse = await fetch(selectedStyle.previewImage);
          if (styleResponse.ok) {
            const blob = await styleResponse.blob();
            styleImage = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
        } catch (e) {
          // 스타일 이미지 로드 실패 시 무시 (프롬프트만으로 생성)
          console.warn("스타일 참조 이미지 로드 실패:", e);
        }
      }

      const response = await fetch("/api/ai-character/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadedImage,
          styleId: selectedStyleId,
          styleImage, // 스타일 참조 이미지 추가
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "이미지 생성에 실패했습니다.");
      }

      console.log("[AI Character] Generation complete!");
      setGeneratedImage(data.image);
    } catch (err) {
      console.error("[AI Character] Generation error:", err);
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGoHome = () => {
    reset();
    router.push("/");
  };

  const handleClearImage = () => {
    clearUploadedImage();
  };

  return (
    <div className="app-wrap py-8">
      {/* AI 생성 중 오버레이 */}
      {isGenerating && (
        <GeneratingOverlay
          uploadedImage={uploadedImage}
          styleName={selectedStyle?.name || ""}
        />
      )}

      {/* 헤더 */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/"
          className="flex size-10 items-center justify-center rounded-full border border-line bg-white transition-colors hover:bg-bg-soft"
          aria-label="홈으로"
        >
          <ArrowLeft className="size-5 text-ink" />
        </Link>
        <div>
          <h1 className="flex items-center gap-2 text-[22px] font-bold text-ink">
            <span className="ai-chip">AI</span>
            캐릭터 만들기
          </h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            사진을 업로드하고 스타일을 선택해서 캐릭터를 만들어보세요
          </p>
        </div>
      </div>

      {/* 결과 화면 */}
      {generatedImage && uploadedImage ? (
        <ResultView
          generatedImage={generatedImage}
          uploadedImage={uploadedImage}
          styleName={selectedStyle?.name || ""}
          onRegenerate={() => {
            resetGeneration();
          }}
        />
      ) : (
        /* 스타일 선택 화면 */
        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          {/* 좌측: 이미지 업로드/미리보기 */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[15px] font-bold text-ink">
              {uploadedImage ? "업로드한 사진" : "사진 업로드"}
            </h2>

            {uploadedImage ? (
              /* 이미지가 있을 때: 미리보기 */
              <div className="relative">
                <div className="relative aspect-square overflow-hidden rounded-card border border-line bg-bg-soft shadow-card">
                  <Image
                    src={uploadedImage}
                    alt="업로드한 사진"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* 이미지 제거 버튼 */}
                <button
                  onClick={handleClearImage}
                  className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full border border-line bg-white shadow-md transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label="이미지 제거"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              /* 이미지가 없을 때: 업로드 드롭존 */
              <ImageUploadZone onImageSelect={setUploadedImage} />
            )}

            {uploadedImage && (
              <button
                onClick={handleClearImage}
                className="btn-outline w-full justify-center text-[13px]"
              >
                다른 사진 선택
              </button>
            )}
          </div>

          {/* 우측: 스타일 선택 */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[15px] font-bold text-ink">스타일 선택</h2>

            {/* 스타일 Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {CHARACTER_STYLES.map((style) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  isSelected={selectedStyleId === style.id}
                  onSelect={() => setSelectedStyle(style.id)}
                />
              ))}
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="rounded-[12px] border border-red-200 bg-red-50 p-4 text-[13px] text-red-600">
                {error}
              </div>
            )}

            {/* 생성 버튼 */}
            <button
              onClick={handleGenerate}
              disabled={!selectedStyleId || !uploadedImage || isGenerating}
              className="btn-primary mt-4 w-full justify-center gap-2 py-4 text-[15px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  캐릭터 생성 중... (약 30초 소요)
                </>
              ) : (
                <>
                  <Sparkles className="size-5" />
                  캐릭터 생성하기
                </>
              )}
            </button>

            {/* 안내 메시지 */}
            {!uploadedImage && !selectedStyleId && (
              <p className="text-center text-[12px] text-ink-soft">
                사진을 업로드하고 스타일을 선택해주세요
              </p>
            )}
            {!uploadedImage && selectedStyleId && (
              <p className="text-center text-[12px] text-ink-soft">
                사진을 업로드해주세요
              </p>
            )}
            {uploadedImage && !selectedStyleId && (
              <p className="text-center text-[12px] text-ink-soft">
                스타일을 선택해주세요
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 이미지 업로드 드롭존 컴포넌트
 */
function ImageUploadZone({
  onImageSelect,
}: {
  onImageSelect: (base64: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const processFile = useCallback(
    (file: File | null) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        // eslint-disable-next-line no-alert
        alert("JPG, PNG 파일만 업로드할 수 있어요.");
        return;
      }

      setIsLoading(true);

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onImageSelect(base64);
        setIsLoading(false);
      };
      reader.onerror = () => {
        setIsLoading(false);
        // eslint-disable-next-line no-alert
        alert("이미지를 읽는 중 오류가 발생했어요. 다시 시도해주세요.");
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed bg-bg-soft transition-colors",
        isLoading
          ? "pointer-events-none opacity-60"
          : isDragOver
            ? "border-accent bg-[#fff4ef]"
            : "border-peach-2 hover:border-accent hover:bg-[#fff4ef]"
      )}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        processFile(e.dataTransfer.files[0] ?? null);
      }}
    >
      {isLoading ? (
        <Loader2 className="size-12 animate-spin text-accent" />
      ) : (
        <UploadCloud className="size-12 text-accent" />
      )}
      <div className="text-center">
        <p className="text-[14px] font-semibold text-ink">
          {isLoading ? "업로드 중..." : "사진을 드래그하거나 클릭하세요"}
        </p>
        <p className="mt-1 text-[12px] text-ink-soft">JPG, PNG 지원</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => processFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

/**
 * 스타일 카드 컴포넌트
 */
function StyleCard({
  style,
  isSelected,
  onSelect,
}: {
  style: CharacterStyle;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border-2 bg-white transition-all",
        isSelected
          ? "border-accent shadow-[0_0_0_2px_rgba(255,128,100,0.2)]"
          : "border-line hover:border-peach-2 hover:shadow-card"
      )}
    >
      {/* 선택 체크마크 */}
      {isSelected && (
        <div className="absolute right-2 top-2 z-10 flex size-6 items-center justify-center rounded-full bg-accent text-white">
          <Check className="size-4" />
        </div>
      )}

      {/* 스타일 이미지 */}
      <div className="relative aspect-square bg-bg-soft">
        {imgError ? (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-ink-soft">
            <ImageIcon className="size-8" />
            <span className="text-[11px]">{style.name}</span>
          </div>
        ) : (
          <Image
            src={style.previewImage}
            alt={style.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* 스타일명 */}
      <div className="p-3 text-center">
        <span
          className={cn(
            "text-[14px] font-semibold",
            isSelected ? "text-accent-deep" : "text-ink"
          )}
        >
          {style.name}
        </span>
      </div>
    </button>
  );
}

/**
 * 결과 화면 컴포넌트
 */
function ResultView({
  generatedImage,
  uploadedImage,
  styleName,
  onRegenerate,
}: {
  generatedImage: string;
  uploadedImage: string;
  styleName: string;
  onRegenerate: () => void;
}) {
  const router = useRouter();

  const handleMakeSticker = () => {
    router.push("/sticker-editor");
  };

  // 이미지 보호: 우클릭, 드래그 방지
  const preventCopy = (e: React.MouseEvent | React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  // 키보드 캡쳐 방지 (PrintScreen 등)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen 키 차단
      if (e.key === "PrintScreen") {
        e.preventDefault();
      }
      // Ctrl+P (인쇄) 차단
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
      }
      // Ctrl+S (저장) 차단
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
      }
      // Ctrl+Shift+S 차단
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 성공 메시지 */}
      <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-peach to-pink px-5 py-2">
        <Sparkles className="size-5 text-accent-deep" />
        <span className="font-bold text-ink">캐릭터가 완성되었어요!</span>
      </div>

      {/* 이미지 비교 영역 - 보호 적용 */}
      <div
        className="flex w-full max-w-2xl select-none flex-col items-center justify-center gap-4 px-4 sm:flex-row sm:gap-6"
        onContextMenu={preventCopy}
        onDragStart={preventCopy}
      >
        {/* 원본 이미지 */}
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-ink-soft sm:text-[12px]">
            원본 사진
          </span>
          <div
            className="relative aspect-square w-36 overflow-hidden rounded-2xl border-2 border-line bg-bg-soft shadow-lg sm:w-48 md:w-56"
            onContextMenu={preventCopy}
          >
            <Image
              src={uploadedImage}
              alt="원본 사진"
              fill
              className="pointer-events-none object-cover"
              draggable={false}
            />
          </div>
        </div>

        {/* 화살표 - 모바일에서 세로, 데스크탑에서 가로 */}
        <div className="flex items-center justify-center">
          <span className="text-xl text-accent sm:text-2xl">
            <span className="hidden sm:inline">→</span>
            <span className="sm:hidden">↓</span>
          </span>
        </div>

        {/* 생성된 캐릭터 */}
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-bold text-white sm:text-[12px]">
            {styleName}
          </span>
          <div
            className="relative aspect-square w-36 overflow-hidden rounded-2xl border-2 border-accent shadow-xl sm:w-48 md:w-56"
            style={{
              background:
                "repeating-conic-gradient(#f5f5f5 0% 25%, #fff 0% 50%) 50% / 16px 16px",
            }}
            onContextMenu={preventCopy}
          >
            <Image
              src={generatedImage}
              alt="생성된 캐릭터"
              fill
              className="pointer-events-none object-contain p-2 sm:p-3"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* 메인 CTA: 스티커 만들기 */}
      <div className="mt-4 flex w-full max-w-md flex-col gap-3">
        <button
          onClick={handleMakeSticker}
          className="btn-primary w-full justify-center gap-2 py-4 text-[16px] shadow-lg transition-transform hover:scale-[1.02]"
        >
          <Sparkles className="size-5" />
          이 캐릭터로 스티커 만들기
        </button>

        <button
          onClick={onRegenerate}
          className="btn-outline w-full justify-center gap-2 py-3 text-[14px]"
        >
          <RefreshCw className="size-4" />
          다시 생성하기
        </button>
      </div>

      {/* 안내 문구 */}
      <p className="mt-2 text-center text-[12px] text-ink-soft">
        마음에 드는 캐릭터가 나올 때까지 다시 생성할 수 있어요
      </p>
    </div>
  );
}

/**
 * AI 생성 중 오버레이 컴포넌트
 */
/**
 * 파티클 위치를 SSR-safe하게 생성 (hydration mismatch 방지)
 */
const PARTICLE_POSITIONS = [
  { left: 5, top: 10 },
  { left: 15, top: 85 },
  { left: 25, top: 30 },
  { left: 35, top: 60 },
  { left: 45, top: 15 },
  { left: 55, top: 75 },
  { left: 65, top: 40 },
  { left: 75, top: 90 },
  { left: 85, top: 20 },
  { left: 95, top: 55 },
  { left: 10, top: 45 },
  { left: 20, top: 70 },
  { left: 30, top: 5 },
  { left: 40, top: 50 },
  { left: 50, top: 95 },
  { left: 60, top: 25 },
  { left: 70, top: 65 },
  { left: 80, top: 35 },
  { left: 90, top: 80 },
  { left: 98, top: 8 },
];

function GeneratingOverlay({
  uploadedImage,
  styleName,
}: {
  uploadedImage: string | null;
  styleName: string;
}) {
  const [step, setStep] = useState(0);
  const [dots, setDots] = useState("");

  const steps = [
    { text: "사진을 분석하고 있어요", icon: "🔍" },
    { text: "아이의 특징을 파악하고 있어요", icon: "👀" },
    { text: "캐릭터를 그리고 있어요", icon: "🎨" },
    { text: "마무리 작업 중이에요", icon: "✨" },
  ];

  // 디버그: 오버레이 마운트 확인
  useEffect(() => {
    console.log("[GeneratingOverlay] 🎬 Overlay mounted! Animations should be visible.");
    return () => {
      console.log("[GeneratingOverlay] 🔚 Overlay unmounted.");
    };
  }, []);

  // 단계 진행 애니메이션
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 8000);

    return () => clearInterval(stepInterval);
  }, [steps.length]);

  // 점 애니메이션
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md">
      {/* 배경 파티클 효과 - SSR-safe한 고정 위치 사용 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {PARTICLE_POSITIONS.map((pos, i) => (
          <div
            key={i}
            className="animate-float-particle absolute size-2 rounded-full bg-accent/30"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              animationDelay: `${(i % 5) * 0.4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl">
        {/* 상단 애니메이션 그라데이션 바 */}
        <div
          className="animate-gradient-move h-2"
          style={{
            background:
              "linear-gradient(90deg, #ff8064, #ffe3ec, #ffd9c6, #ff8064)",
            backgroundSize: "300% 100%",
          }}
        />

        <div className="p-8">
          {/* AI 아이콘 - 펄스 + 회전 애니메이션 */}
          <div className="relative mx-auto mb-6 size-24">
            {/* 외부 링 애니메이션 */}
            <div className="animate-ping-ring absolute inset-0 rounded-full border-4 border-accent/30" />
            <div
              className="animate-ping-ring absolute inset-2 rounded-full border-4 border-pink/30"
              style={{ animationDelay: "0.5s" }}
            />
            {/* 메인 아이콘 */}
            <div className="animate-scale-pulse absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-peach via-pink to-accent">
              <Sparkles className="animate-slow-spin size-12 text-white drop-shadow-lg" />
            </div>
          </div>

          {/* 제목 */}
          <h2 className="mb-2 text-center text-[22px] font-bold text-ink">
            AI가 캐릭터를 만들고 있어요
          </h2>
          <p className="mb-6 text-center text-[14px] text-ink-soft">
            <span className="font-medium text-accent">{styleName}</span> 스타일로
            변환 중{dots}
          </p>

          {/* 이미지 변환 애니메이션 */}
          {uploadedImage && (
            <div className="relative mx-auto mb-6 flex items-center justify-center gap-4">
              {/* 원본 이미지 */}
              <div className="relative size-24 overflow-hidden rounded-[14px] border-2 border-line shadow-lg">
                <Image
                  src={uploadedImage}
                  alt="원본 사진"
                  fill
                  className="object-cover"
                />
              </div>

              {/* 화살표 애니메이션 */}
              <div className="flex flex-col items-center gap-1">
                <span className="animate-bounce-right text-xl text-accent">→</span>
                <span className="text-[10px] text-ink-soft">변환 중</span>
              </div>

              {/* 결과 플레이스홀더 */}
              <div className="animate-scale-pulse relative flex size-24 items-center justify-center overflow-hidden rounded-[14px] border-2 border-dashed border-accent bg-gradient-to-br from-peach/50 to-pink/50">
                <Sparkles className="size-8 text-accent" />
              </div>
            </div>
          )}

          {/* 진행 단계 */}
          <div className="space-y-2">
            {steps.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 rounded-[10px] px-4 py-2.5 transition-all duration-500",
                  i < step
                    ? "bg-green-50 text-green-600"
                    : i === step
                      ? "bg-gradient-to-r from-peach to-pink/50 text-ink shadow-sm"
                      : "bg-bg-soft/50 text-ink-soft"
                )}
              >
                <span className="text-base">
                  {i < step ? "✓" : i === step ? s.icon : "○"}
                </span>
                <span
                  className={cn(
                    "flex-1 text-[13px]",
                    i === step ? "font-semibold" : "font-medium"
                  )}
                >
                  {s.text}
                </span>
                {i === step && (
                  <Loader2 className="size-4 animate-spin text-accent" />
                )}
              </div>
            ))}
          </div>

          {/* 프로그레스 바 */}
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-bg-soft">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-pink transition-[width] duration-500 ease-out"
              style={{
                width: `${((step + 1) / steps.length) * 100}%`,
              }}
            />
          </div>

          {/* 예상 시간 */}
          <p className="mt-4 text-center text-[12px] text-ink-soft">
            약 20~40초 정도 소요됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
