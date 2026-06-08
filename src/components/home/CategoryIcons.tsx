import Link from "next/link";
import type { IconCategory } from "@/mocks/data";

interface CategoryIconsProps {
  categories: IconCategory[];
}

/**
 * 아이콘 메뉴 9개. 목업 v2 .iconmenu 구조 그대로.
 * - 이모지를 컬러 배경 원에 배치
 * - 데스크탑 9열 / 태블릿 5열 / 모바일 3열
 */
export function CategoryIcons({ categories }: CategoryIconsProps) {
  return (
    <nav
      aria-label="카테고리"
      className="mt-[26px] grid grid-cols-9 gap-x-2 gap-y-[14px] py-2 max-[920px]:grid-cols-5 max-[920px]:gap-y-5 max-[520px]:grid-cols-3 max-[520px]:gap-y-[22px]"
    >
      {categories.map((c) => (
        <Link
          key={c.id}
          href={c.linkUrl}
          className="group flex min-w-0 flex-col items-center gap-[9px]"
        >
          <span
            className="grid size-[74px] flex-shrink-0 place-items-center rounded-full text-[32px] leading-none transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-card-sm)] max-[680px]:size-[62px] max-[680px]:text-[27px]"
            style={{ background: c.bgColor }}
            aria-hidden
          >
            {c.emoji}
          </span>
          <span className="break-keep text-center text-[12.5px] font-medium leading-[1.3] text-ink">
            {c.name}
            {c.sub && (
              <small className="block text-[10px] font-normal text-ink-soft">
                {c.sub}
              </small>
            )}
          </span>
        </Link>
      ))}
    </nav>
  );
}
