"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/**
 * 상단 sticky 탭 네비게이션. 목업 v2 .tabs 와 동일하게 7개.
 * "AI 캐릭터 네임스티커"가 기본 active 상태.
 */
const TABS = [
  { href: "/", label: "추천" },
  { href: "/ai-character", label: "AI 캐릭터 네임스티커" },
  { href: "/custom-sticker", label: "🌈 커스텀 네임스티커" },
  { href: "/uv-dtf-sticker", label: "👑 UV DTF 네임스티커" },
  { href: "/design-sticker", label: "🎀 디자인 네임스티커" },
  { href: "/simple-sticker", label: "✏️ 심플 네임스티커" },
  { href: "/clothes-sticker", label: "👕 의류 네임스티커" },
] as const;

export function TopTabs() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-[60] border-b border-line bg-white/95 backdrop-blur-md">
      <div className="app-wrap">
        <nav
          aria-label="주요 카테고리"
          className="no-scrollbar flex h-[50px] items-center justify-center gap-1 overflow-x-auto max-[920px]:justify-start max-[920px]:pl-1"
        >
          {TABS.map((tab) => {
            const active =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "inline-flex flex-shrink-0 items-center gap-[5px] whitespace-nowrap rounded-[18px] px-4 py-2 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-ink font-bold text-white"
                    : "text-ink-soft hover:bg-[#144898]/8 hover:text-[#144898] hover:shadow-[0_4px_12px_-4px_rgba(20,72,152,0.35)]"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
