"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProductList } from "@/features/product/hooks";
import { useProductCategories } from "@/features/category/hooks";
import { ProductCard } from "@/features/product/ProductCard";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 12;

/**
 * 상품 목록 (`/category`).
 * - 좌측 필터: "전체" + 활성 product_category 목록
 * - 6열 그리드 (모바일 2열)
 * - 페이지네이션 (백엔드 0-based)
 */
export default function CategoryPage() {
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(0);

  const categoriesQuery = useProductCategories();
  const productsQuery = useProductList({ categoryId, page, size: PAGE_SIZE });

  const totalPages = productsQuery.data?.totalPages ?? 1;
  const totalElements = productsQuery.data?.totalElements ?? 0;
  const items = productsQuery.data?.content ?? [];

  return (
    <div className="app-wrap pb-12 pt-6">
      <header className="mb-5">
        <h1 className="text-[22px] font-bold tracking-tight">전체 상품</h1>
        <p className="mt-1 text-[12.5px] text-ink-soft">
          {totalElements > 0 ? `${totalElements.toLocaleString()}개 상품` : ""}
        </p>
      </header>

      <CategoryFilter
        activeId={categoryId}
        onChange={(id) => {
          setCategoryId(id);
          setPage(0);
        }}
        categories={categoriesQuery.data ?? []}
      />

      {productsQuery.isLoading && <SkeletonGrid />}

      {productsQuery.isError && (
        <ErrorBox onRetry={() => productsQuery.refetch()} />
      )}

      {productsQuery.isSuccess && items.length === 0 && <EmptyBox />}

      {productsQuery.isSuccess && items.length > 0 && (
        <>
          <div className="grid grid-cols-6 gap-3 max-[920px]:grid-cols-3 max-[520px]:grid-cols-2">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}

// ---- 서브 컴포넌트 ----

function CategoryFilter({
  activeId,
  onChange,
  categories,
}: {
  activeId: number | undefined;
  onChange: (id: number | undefined) => void;
  categories: { id?: number; name?: string }[];
}) {
  return (
    <nav
      aria-label="카테고리 필터"
      className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1"
    >
      <FilterChip active={activeId === undefined} onClick={() => onChange(undefined)}>
        전체
      </FilterChip>
      {categories.map((c) => (
        <FilterChip
          key={c.id}
          active={activeId === c.id}
          onClick={() => onChange(c.id)}
        >
          {c.name}
        </FilterChip>
      ))}
    </nav>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-shrink-0 whitespace-nowrap rounded-[18px] px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-ink font-bold text-white"
          : "border border-line text-ink-soft hover:bg-bg-soft hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-6 gap-3 max-[920px]:grid-cols-3 max-[520px]:grid-cols-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-[12px] border border-line bg-white">
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

function ErrorBox({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-[12px] border border-line bg-white p-10 text-center">
      <p className="text-sm text-ink-soft">상품을 불러오지 못했어요.</p>
      <button type="button" onClick={onRetry} className="btn-outline mt-3">
        다시 시도
      </button>
    </div>
  );
}

function EmptyBox() {
  return (
    <div className="rounded-[12px] border border-line bg-white p-10 text-center">
      <p className="text-sm text-ink-soft">해당 카테고리에 상품이 없어요.</p>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i);
  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="페이지">
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        className="grid size-9 place-items-center rounded-md border border-line text-ink-soft disabled:opacity-40 hover:bg-bg-soft"
        aria-label="이전"
      >
        <ChevronLeft size={16} aria-hidden />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={cn(
            "grid size-9 place-items-center rounded-md text-sm",
            p === page
              ? "bg-ink font-bold text-white"
              : "text-ink-soft hover:bg-bg-soft"
          )}
        >
          {p + 1}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        className="grid size-9 place-items-center rounded-md border border-line text-ink-soft disabled:opacity-40 hover:bg-bg-soft"
        aria-label="다음"
      >
        <ChevronRight size={16} aria-hidden />
      </button>
    </nav>
  );
}
