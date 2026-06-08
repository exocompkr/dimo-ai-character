"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { MOCKUP_ASSETS } from "@/assets/mockup";
import { cn } from "@/lib/cn";

/**
 * Hero 섹션. 목업 v2 .hero-main 구조.
 * - (상) .gen-banner : ONLY 뱃지 + 카피 + faces + 큰 캐릭터
 * - (하) .cta-banner : AI 칩 + 카피 + 바로 만들기 + 드롭존
 */
export function HeroSection() {
  return (
    <section className="pt-[22px]">
      <div className="flex flex-col gap-[14px]">
        <GeneralBanner />
        <UploadCta />
      </div>
    </section>
  );
}

function GeneralBanner() {
  return (
    <Link
      href="/ai-character"
      className="relative flex aspect-[1180/400] flex-col justify-center overflow-hidden rounded-card px-[38px] py-[34px] shadow-[var(--shadow-card-sm)] max-[520px]:aspect-auto max-[520px]:min-h-0 max-[520px]:px-[22px] max-[520px]:pb-[150px] max-[520px]:pt-[26px]"
      style={{
        background:
          "linear-gradient(135deg,#ffd9c6 0%,#ffe5d8 55%,#fff1ea 100%)",
        minHeight: 330,
      }}
    >
      <span className="mb-[14px] inline-block w-fit rounded-[14px] bg-white px-[11px] py-1 text-[10px] font-bold text-accent-deep shadow-[var(--shadow-card-sm)]">
        ONLY
      </span>
      <h2 className="text-[30px] font-bold leading-[1.32] tracking-[-0.5px] text-[#4a3a33] max-[520px]:text-[23px]">
        사진 한 장으로,
        <br />
        우리 아이만의 캐릭터
      </h2>
      <p className="mt-[14px] max-w-[300px] text-[14px] leading-[1.6] text-[#8c736a] max-[520px]:text-[13px]">
        AI가 우리 아이를 귀엽게 변신!
        <br />
        바로 네임스티커로 만들어 보세요.
      </p>

      <div className="mt-[20px] flex items-center gap-[9px]">
        <span className="flex" aria-hidden>
          {MOCKUP_ASSETS.heroFaces.map((src, i) => (
            <span
              key={i}
              className="-ml-2 block size-[26px] overflow-hidden rounded-full border-2 border-white bg-white first:ml-0"
            >
              <Image
                src={src}
                alt=""
                width={26}
                height={26}
                className="size-full object-cover"
              />
            </span>
          ))}
        </span>
        <small className="text-[12.5px] text-[#8c736a]">
          <b className="font-bold text-accent-deep">3,245명</b>의 아이들이
          만들었어요!
        </small>
      </div>

      <span className="absolute right-[40px] top-[30px] z-[3] rounded-[13px] bg-white px-3 py-[5px] text-[12px] font-bold text-[#6b5750] shadow-[var(--shadow-card-sm)] max-[520px]:right-[18px] max-[520px]:top-[22px] max-[520px]:text-[11px]">
        우리 아이
      </span>

      <Image
        src={MOCKUP_ASSETS.heroCharacter}
        alt="디모 캐릭터"
        width={215}
        height={215}
        className="pointer-events-none absolute bottom-0 right-[26px] z-[2] h-auto w-[215px] max-[520px]:right-[10px] max-[520px]:w-[150px]"
      />
    </Link>
  );
}

function UploadCta() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const onPick = useCallback((f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      // eslint-disable-next-line no-alert
      alert("JPG, PNG 파일만 업로드할 수 있어요.");
      return;
    }
    setFile(f);
  }, []);

  const onSubmit = useCallback(() => {
    if (!file) {
      inputRef.current?.click();
      return;
    }
    // eslint-disable-next-line no-alert
    alert(`AI 캐릭터 생성 페이지로 이동 (파일: ${file.name})`);
  }, [file]);

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-[18px] rounded-card border border-line bg-white p-5 shadow-[var(--shadow-card-sm)] max-[520px]:grid-cols-1">
      <div>
        <h3 className="flex items-center gap-[7px] text-[17px] font-bold text-[#4a3a33]">
          <span className="ai-chip">AI 기능</span>
          AI 캐릭터 만들기
        </h3>
        <p className="mt-[5px] text-[12.5px] leading-[1.5] text-ink-soft">
          사진을 업로드하면 우리 아이 캐릭터가 자동으로 완성돼요!
        </p>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="btn-primary self-stretch whitespace-nowrap max-[520px]:justify-center"
      >
        ✦ 바로 만들기
      </button>

      <div
        role="button"
        tabIndex={0}
        className={cn(
          "col-span-full flex cursor-pointer flex-col items-center gap-1.5 rounded-[13px] border-2 border-dashed bg-bg-soft px-[14px] py-[22px] text-center transition-colors",
          isDragOver
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
          onPick(e.dataTransfer.files[0] ?? null);
        }}
      >
        <UploadCloud className="size-[34px] text-accent" aria-hidden />
        <span className="text-[13.5px] font-bold text-[#6b5750]">
          {file ? file.name : "사진을 드래그하거나 클릭하세요"}
        </span>
        <span className="text-[11px] text-ink-soft">JPG, PNG 지원</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}
