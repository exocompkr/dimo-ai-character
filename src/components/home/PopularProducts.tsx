"use client";

import { ProductCard } from "@/features/product/ProductCard";
import { useProductList } from "@/features/product/hooks";
import { MOCKUP_ASSETS } from "@/assets/mockup";
import { SectionHead } from "./SectionHead";

/**
 * 인기 상품 6개 그리드. 목업 v2 .popular-sec / .pp-grid 구조.
 *
 * 백엔드 `/api/products?size=6` 의 응답에서 GENERAL 타입만 추려서 노출.
 * (BEST/순위 알고리즘은 향후 백엔드 view 또는 분석 데이터로 교체)
 */
export function PopularProducts() {
  const { data, isLoading, isError } = useProductList({ size: 12 });

  // GENERAL 타입만 (entry 상품 제외) — 6개까지
  const items = (data?.content ?? [])
    .filter((p) => p.type === "GENERAL")
    .slice(0, 6);

  return (
    <section className="mt-[46px]">
      <SectionHead
        mascotSrc={MOCKUP_ASSETS.popularMascot}
        title="지금 많이 찾는 네임스티커"
        moreHref="/category"
      />

      {isLoading && <SkeletonGrid />}
      {isError && (
        <p className="rounded-card border border-line bg-bg-soft p-6 text-center text-sm text-ink-soft">
          인기상품을 불러오지 못했어요.
        </p>
      )}
      {!isLoading && !isError && items.length === 0 && (
        <p className="rounded-card border border-line bg-bg-soft p-6 text-center text-sm text-ink-soft">
          노출 가능한 상품이 없어요.
        </p>
      )}
      {items.length > 0 && (
        <div className="grid grid-cols-6 gap-3 max-[920px]:grid-cols-3 max-[520px]:grid-cols-2">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} rank={i + 1} />
          ))}
        </div>
      )}
    </section>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-6 gap-3 max-[920px]:grid-cols-3 max-[520px]:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[12px] border border-line bg-white"
        >
          <div className="aspect-square animate-pulse bg-bg-soft" />
          <div className="space-y-2 px-2.5 pb-3 pt-2.5">
            <div className="h-3 animate-pulse rounded bg-bg-soft" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-bg-soft" />
          </div>
        </div>
      ))}
    </div>
  );
}
