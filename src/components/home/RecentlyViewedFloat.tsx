"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRecentlyViewed } from "@/stores/recentlyViewedStore";
import { formatKrw } from "@/lib/format";
import type { Product } from "@/types/domain";

interface RecentlyViewedFloatProps {
  /** SSR 초기값 (클라이언트가 zustand로 덮어쓰기 전 placeholder) */
  initialItems?: Product[];
}

/**
 * 본문 우측 외부에 fixed로 떠있는 "최근 본 상품" 플로팅 패널.
 * 목업 v2 .recent-float 구조 + JS 스크롤 클램프 동작.
 *
 * - 1320px 미만에서는 숨김
 * - 스크롤 시 푸터 위에서 멈춤 (clamp)
 * - 접기 가능, 접으면 우측 가장자리에 vertical-rl 재오픈 버튼
 */
export function RecentlyViewedFloat({
  initialItems = [],
}: RecentlyViewedFloatProps) {
  const storeItems = useRecentlyViewed((s) => s.items);
  const items = storeItems.length > 0 ? storeItems : initialItems;
  const [collapsed, setCollapsed] = useState(false);
  const panelRef = useRef<HTMLElement>(null);

  // 스크롤 시 푸터 위에서 멈춤 (목업 v2의 clamp 동작 이식)
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || collapsed) return;

    const BASE = 188;
    const GAP = 16;

    const clamp = () => {
      const footer = document.querySelector("footer");
      if (!footer) {
        panel.style.top = `${BASE}px`;
        return;
      }
      const maxTop =
        footer.getBoundingClientRect().top - panel.offsetHeight - GAP;
      panel.style.top = `${Math.max(8, Math.min(BASE, maxTop))}px`;
    };

    clamp();
    window.addEventListener("scroll", clamp, { passive: true });
    window.addEventListener("resize", clamp);
    return () => {
      window.removeEventListener("scroll", clamp);
      window.removeEventListener("resize", clamp);
    };
  }, [collapsed, items.length]);

  if (items.length === 0) return null;

  const preview = items.slice(0, 3);

  return (
    <>
      <aside
        ref={panelRef}
        aria-label="최근 본 상품"
        className="recent-float-panel fixed z-50 hidden w-[162px] rounded-2xl border border-line bg-white p-[14px_12px] shadow-[var(--shadow-card)] transition-transform duration-200 xl:block"
        style={{
          top: 188,
          right: "max(14px, calc((100vw - 1180px) / 2 - 174px))",
          transform: collapsed ? "translateX(calc(100% + 28px))" : "none",
        }}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="whitespace-nowrap text-[13px] font-bold leading-tight text-ink">
            최근 본 상품
          </span>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="최근 본 상품 접기"
            className="grid size-[22px] flex-shrink-0 place-items-center rounded-[7px] border border-line bg-white text-[12px] text-ink-soft hover:bg-bg-soft"
          >
            ›
          </button>
        </div>

        <ul className="flex flex-col">
          {preview.map((p) => (
            <li key={p.id}>
              <Link
                href={`/product/${p.id}`}
                className="flex flex-col gap-1.5 rounded-[10px] p-[8px_6px] transition-colors hover:bg-bg-soft"
              >
                <span className="relative block aspect-square w-full overflow-hidden rounded-[9px] border border-line bg-white">
                  <Image
                    src={p.imageUrl}
                    alt=""
                    fill
                    sizes="140px"
                    className="object-cover"
                  />
                </span>
                <span className="line-clamp-2 text-[10.5px] leading-[1.3]">
                  {p.name}
                </span>
                <span className="text-[12px] font-bold text-accent-deep">
                  {formatKrw(p.price)}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/mypage/recent"
          className="mt-2 block border-t border-line pt-[9px] text-center text-[11px] text-ink-soft hover:text-accent"
        >
          더보기 ›
        </Link>
      </aside>

      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="최근 본 상품 열기"
          className="fixed right-0 top-[188px] z-50 hidden cursor-pointer border-none bg-accent px-[7px] py-[14px] text-[12px] font-bold text-white shadow-[var(--shadow-card-sm)] xl:block"
          style={{
            writingMode: "vertical-rl",
            borderRadius: "10px 0 0 10px",
          }}
        >
          최근 본 상품
        </button>
      )}
    </>
  );
}
