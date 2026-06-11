"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { getAvailableSizes } from "../../config/paper-options";
import type { PaperTypeId, SizeOptionId } from "../../types/editor.types";

interface SizeSelectorProps {
  paperTypeId: PaperTypeId | null;
  selectedSize: SizeOptionId | null;
  onSelect: (size: SizeOptionId) => void;
}

/**
 * 크기 선택 컴포넌트
 * 선택된 용지 타입에 따라 사용 가능한 크기만 표시
 */
export function SizeSelector({
  paperTypeId,
  selectedSize,
  onSelect,
}: SizeSelectorProps) {
  const availableSizes = paperTypeId ? getAvailableSizes(paperTypeId) : [];

  return (
    <section>
      <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full text-xs font-bold sm:size-7 sm:text-sm",
            paperTypeId
              ? "bg-accent text-white"
              : "bg-gray-200 text-gray-400"
          )}
        >
          2
        </span>
        <h2
          className={cn(
            "text-base font-bold sm:text-lg",
            paperTypeId ? "text-ink" : "text-gray-400"
          )}
        >
          크기 선택
        </h2>
      </div>

      {!paperTypeId ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center sm:rounded-2xl sm:p-8">
          <p className="text-xs text-gray-400 sm:text-sm">
            먼저 용지를 선택해주세요
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {availableSizes.map((size) => {
            const isSelected = selectedSize === size.id;
            return (
              <button
                key={size.id}
                onClick={() => onSelect(size.id)}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 transition-all duration-200 sm:gap-3 sm:rounded-xl sm:px-5 sm:py-4",
                  isSelected
                    ? "border-accent bg-accent/5 shadow-md"
                    : "border-gray-200 bg-white hover:border-accent/50 hover:shadow-md"
                )}
              >
                {/* 선택 체크마크 */}
                {isSelected && (
                  <div className="flex size-4 items-center justify-center rounded-full bg-accent text-white sm:size-5">
                    <Check className="size-2.5 sm:size-3" strokeWidth={3} />
                  </div>
                )}

                <div className="text-left">
                  <span
                    className={cn(
                      "block text-xs font-bold sm:text-sm",
                      isSelected ? "text-accent" : "text-ink"
                    )}
                  >
                    {size.name}
                  </span>
                  <span className="text-[10px] text-ink-soft sm:text-xs">
                    {size.width} × {size.height}mm
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
