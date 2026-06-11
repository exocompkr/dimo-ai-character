"use client";

import { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PaperType } from "../../types/editor.types";

interface PaperTypeCardProps {
  paper: PaperType;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * 개별 용지 타입 카드 컴포넌트
 * - 선택 상태에 따른 스타일 변화
 * - 마우스 호버 시 상세 설명 툴팁 표시
 */
export function PaperTypeCard({
  paper,
  isSelected,
  onSelect,
}: PaperTypeCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onSelect}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          "group relative flex w-full flex-col overflow-hidden rounded-xl border-2 bg-white transition-all duration-200 sm:rounded-2xl",
          isSelected
            ? "border-accent shadow-lg shadow-accent/20"
            : "border-transparent shadow-md hover:shadow-lg hover:border-gray-200"
        )}
      >
        {/* 선택 체크마크 */}
        {isSelected && (
          <div className="absolute right-2 top-2 z-10 flex size-5 items-center justify-center rounded-full bg-accent text-white shadow-md sm:right-3 sm:top-3 sm:size-6">
            <Check className="size-3 sm:size-4" strokeWidth={3} />
          </div>
        )}

        {/* 이미지 */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <Image
            src={paper.imageUrl}
            alt={paper.name}
            fill
            className={cn(
              "object-cover transition-transform duration-300",
              "group-hover:scale-105"
            )}
            sizes="(max-width: 768px) 50vw, 25vw"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect fill='%23f5f5f5' width='200' height='150'/%3E%3Ctext x='100' y='75' text-anchor='middle' dominant-baseline='middle' fill='%239a938f' font-size='14'%3E이미지%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>

        {/* 정보 영역 */}
        <div className="flex flex-col items-center p-2.5 sm:p-4">
          <h3
            className={cn(
              "text-sm font-bold sm:text-base",
              isSelected ? "text-accent" : "text-ink"
            )}
          >
            {paper.name}
          </h3>
          <p className="mt-0.5 whitespace-pre-line text-center text-[10px] leading-relaxed text-ink-soft sm:mt-1 sm:text-xs">
            {paper.description}
          </p>
        </div>
      </button>

      {/* 상세 설명 툴팁 (데스크탑만 표시 - 터치 기기에서는 호버 불가) */}
      {showTooltip && paper.detailDescription && (
        <div className="absolute -bottom-2 left-1/2 z-20 hidden w-64 -translate-x-1/2 translate-y-full animate-in fade-in slide-in-from-top-2 duration-200 sm:block">
          <div className="rounded-xl bg-ink p-4 text-sm leading-relaxed text-white shadow-xl">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-ink" />
            {paper.detailDescription}
          </div>
        </div>
      )}
    </div>
  );
}
