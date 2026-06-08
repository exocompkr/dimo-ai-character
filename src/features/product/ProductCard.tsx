"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { ProductSummary } from "./api";
import { formatKrw } from "@/lib/format";
import { useWishlist } from "@/stores/wishlistStore";
import { cn } from "@/lib/cn";

interface ProductCardProps {
  product: ProductSummary;
  /** 인기/순위 카드용. 좌상단 랭킹 배지 노출. */
  rank?: number;
}

const TYPE_BADGE: Record<
  NonNullable<ProductSummary["type"]>,
  { label: string; className: string } | null
> = {
  GENERAL: null,
  AI_ENTRY: { label: "AI", className: "bg-accent" },
  CUSTOM_ENTRY: { label: "CUSTOM", className: "bg-ink" },
};

export function ProductCard({ product, rank }: ProductCardProps) {
  const isWished = useWishlist((s) => (product.id != null ? s.has(String(product.id)) : false));
  const toggleWish = useWishlist((s) => s.toggle);
  const wishId = product.id != null ? String(product.id) : "";

  const badge = product.type ? TYPE_BADGE[product.type] : null;
  const href = resolveHref(product);

  return (
    <article className="overflow-hidden rounded-[12px] border border-line bg-white transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[var(--shadow-card)]">
      <Link href={href} className="block">
        <div className="relative aspect-square overflow-hidden bg-bg-soft">
          {product.thumbnailUrl && (
            <Image
              src={product.thumbnailUrl}
              alt={product.name ?? ""}
              fill
              sizes="(max-width: 520px) 50vw, (max-width: 920px) 33vw, 200px"
              className="object-cover transition-transform duration-300 hover:scale-105"
              unoptimized={product.thumbnailUrl.startsWith("/")}
            />
          )}

          {typeof rank === "number" && (
            <span className="absolute left-[7px] top-[7px] z-10 grid size-[23px] place-items-center rounded-[7px] bg-[rgba(63,58,56,0.82)] text-[12px] font-bold text-white">
              {rank}
            </span>
          )}

          {badge && (
            <span
              className={cn(
                "absolute z-10 rounded-[6px] px-1.5 py-0.5 text-[10px] font-bold text-white",
                typeof rank === "number" ? "left-[36px] top-[7px]" : "left-[7px] top-[7px]",
                badge.className
              )}
            >
              {badge.label}
            </span>
          )}

          {wishId && (
            <button
              type="button"
              aria-label={isWished ? "찜 해제" : "찜하기"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWish(wishId);
              }}
              className="absolute right-1.5 top-1.5 z-10 grid size-[26px] place-items-center rounded-full bg-white/80 text-accent hover:bg-white"
            >
              <Heart size={13} fill={isWished ? "currentColor" : "none"} aria-hidden />
            </button>
          )}
        </div>

        <p className="px-2.5 pb-0.5 pt-2.5 text-[12.5px] font-semibold leading-[1.35]">
          {product.name}
        </p>
        <p className="px-2.5 pb-3 text-[14px] font-bold">
          {formatKrw(product.basePrice ?? 0)}
          {product.type === "GENERAL" && (
            <span className="ml-1 text-[10px] font-normal text-ink-soft">부터</span>
          )}
        </p>
      </Link>
    </article>
  );
}

function resolveHref(product: ProductSummary): string {
  if (product.type === "AI_ENTRY") return "/ai-character";
  if (product.type === "CUSTOM_ENTRY") return "/custom-sticker";
  return `/product/${product.id}`;
}
