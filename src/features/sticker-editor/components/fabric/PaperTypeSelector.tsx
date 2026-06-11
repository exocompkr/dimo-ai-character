"use client";

import { PAPER_TYPES } from "../../config/paper-options";
import { PaperTypeCard } from "./PaperTypeCard";
import type { PaperTypeId } from "../../types/editor.types";

interface PaperTypeSelectorProps {
  selectedPaperType: PaperTypeId | null;
  onSelect: (paperType: PaperTypeId) => void;
}

/**
 * 용지 타입 선택 그룹
 * 4개의 용지 카드를 그리드로 배치
 */
export function PaperTypeSelector({
  selectedPaperType,
  onSelect,
}: PaperTypeSelectorProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
        <span className="flex size-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white sm:size-7 sm:text-sm">
          1
        </span>
        <h2 className="text-base font-bold text-ink sm:text-lg">용지 선택</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {PAPER_TYPES.map((paper) => (
          <PaperTypeCard
            key={paper.id}
            paper={paper}
            isSelected={selectedPaperType === paper.id}
            onSelect={() => onSelect(paper.id)}
          />
        ))}
      </div>
    </section>
  );
}
