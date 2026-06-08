"use client";

import { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { useProductDetail } from "@/features/product/hooks";
import type { PaperOption } from "@/features/product/api";
import { ProductTabs } from "@/features/product/ProductTabs";
import { useCart } from "@/stores/cartStore";
import { useWishlist } from "@/stores/wishlistStore";
import { useRecentlyViewed } from "@/stores/recentlyViewedStore";
import { formatKrw } from "@/lib/format";
import { cn } from "@/lib/cn";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * 상품 상세 페이지 (`/product/[id]`).
 *
 * GENERAL 상품:
 *   - 용지×크기 옵션 매트릭스로 단가 실시간 계산 (ORD-001)
 *   - 수량 조절 + 장바구니/바로 구매
 *
 * AI_ENTRY/CUSTOM_ENTRY 상품:
 *   - 별도 편집기 라우트로 안내 (옵션 매트릭스 없음)
 */
export default function ProductDetailPage({ params }: PageProps) {
  const { id: idStr } = use(params);
  const id = Number(idStr);
  const query = useProductDetail(id);

  if (query.isLoading) return <DetailSkeleton />;
  if (query.isError) {
    return (
      <div className="app-wrap py-16 text-center">
        <p className="text-sm text-ink-soft">상품을 불러오지 못했어요.</p>
        <button className="btn-outline mt-4" onClick={() => query.refetch()}>
          다시 시도
        </button>
      </div>
    );
  }
  const product = query.data;
  if (!product) {
    return (
      <div className="app-wrap py-16 text-center">
        <p className="text-sm text-ink-soft">상품을 찾을 수 없어요.</p>
        <Link href="/category" className="btn-outline mt-4 inline-flex">
          전체 상품 보기
        </Link>
      </div>
    );
  }

  return <DetailBody productId={id} product={product} />;
}

interface DetailBodyProps {
  productId: number;
  product: NonNullable<ReturnType<typeof useProductDetail>["data"]>;
}

function DetailBody({ productId, product }: DetailBodyProps) {
  const isEntry = product.type === "AI_ENTRY" || product.type === "CUSTOM_ENTRY";
  const options: PaperOption[] = product.paperOptions ?? [];

  // 용지 → 크기 그룹화
  const grouped = useMemo(() => {
    const map = new Map<string, PaperOption[]>();
    for (const o of options) {
      const key = o.paperCode ?? "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    }
    return Array.from(map.entries());
  }, [options]);

  const [selectedPaperCode, setSelectedPaperCode] = useState<string | undefined>(
    grouped[0]?.[0]
  );
  const sizesForPaper = useMemo(() => {
    return options.filter((o) => o.paperCode === selectedPaperCode);
  }, [options, selectedPaperCode]);
  const [selectedSizeId, setSelectedSizeId] = useState<number | undefined>(
    sizesForPaper[0]?.paperSizeId ?? undefined
  );
  const [quantity, setQuantity] = useState(1);

  // 용지 변경 시 사이즈 자동 초기화
  useEffect(() => {
    setSelectedSizeId(sizesForPaper[0]?.paperSizeId ?? undefined);
  }, [selectedPaperCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // 최근 본 상품 기록
  const addRecent = useRecentlyViewed((s) => s.add);
  useEffect(() => {
    if (!product.id || !product.name || !product.thumbnailUrl) return;
    addRecent({
      id: String(product.id),
      name: product.name,
      categoryIds: [],
      price: product.basePrice ?? 0,
      imageUrl: product.thumbnailUrl,
    });
  }, [product.id, product.name, product.basePrice, product.thumbnailUrl, addRecent]);

  const selectedOption = sizesForPaper.find((o) => o.paperSizeId === selectedSizeId);
  const unitPrice = selectedOption?.unitPrice ?? product.basePrice ?? 0;
  const totalPrice = unitPrice * quantity;

  const isWished = useWishlist((s) => (product.id != null ? s.has(String(product.id)) : false));
  const toggleWish = useWishlist((s) => s.toggle);
  const addToCart = useCart((s) => s.add);

  const onAddToCart = () => {
    if (isEntry || !product.id || !product.name || !product.thumbnailUrl) return;
    addToCart(
      {
        id: String(product.id),
        name: product.name,
        categoryIds: [],
        price: unitPrice,
        imageUrl: product.thumbnailUrl,
      },
      quantity
    );
    // eslint-disable-next-line no-alert
    alert(`장바구니에 ${quantity}개 담았습니다.`);
  };

  return (
    <div className="app-wrap pb-16 pt-6">
      <div className="grid grid-cols-[minmax(0,520px)_1fr] gap-10 max-[860px]:grid-cols-1">
        {/* 좌측: 이미지 */}
        <div className="relative aspect-square overflow-hidden rounded-card border border-line bg-bg-soft">
          {product.thumbnailUrl && (
            <Image
              src={product.thumbnailUrl}
              alt={product.name ?? ""}
              fill
              sizes="(max-width: 860px) 100vw, 520px"
              className="object-cover"
              priority
              unoptimized={product.thumbnailUrl.startsWith("/")}
            />
          )}
        </div>

        {/* 우측: 정보 + 옵션 */}
        <div className="flex flex-col gap-5">
          <header>
            <p className="text-[12px] font-bold text-accent">
              {product.type === "AI_ENTRY"
                ? "AI 캐릭터"
                : product.type === "CUSTOM_ENTRY"
                  ? "커스텀"
                  : "일반 스티커"}
            </p>
            <h1 className="mt-1 text-[24px] font-bold tracking-tight">{product.name}</h1>
            <p className="mt-3 text-[22px] font-extrabold text-accent-deep">
              {formatKrw(unitPrice)}
              {!isEntry && (
                <span className="ml-1 text-[12px] font-medium text-ink-soft">
                  ({selectedOption?.paperName ?? "용지"} / {selectedOption?.sizeLabel ?? "크기"} 기준)
                </span>
              )}
            </p>
          </header>

          {isEntry ? (
            <EntryGuide type={product.type ?? "AI_ENTRY"} />
          ) : (
            <>
              <PaperSelector
                grouped={grouped}
                selectedPaperCode={selectedPaperCode}
                onSelect={setSelectedPaperCode}
              />
              <SizeSelector
                sizes={sizesForPaper}
                selectedSizeId={selectedSizeId}
                onSelect={setSelectedSizeId}
              />
              <QuantityControl quantity={quantity} onChange={setQuantity} />

              <div className="mt-2 flex items-center justify-between rounded-[12px] bg-bg-soft px-4 py-3">
                <span className="text-sm font-medium text-ink-soft">총 결제 금액</span>
                <strong className="text-[20px] font-extrabold text-accent-deep">
                  {formatKrw(totalPrice)}
                </strong>
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  aria-label={isWished ? "찜 해제" : "찜하기"}
                  onClick={() => product.id != null && toggleWish(String(product.id))}
                  className={cn(
                    "grid size-[52px] flex-shrink-0 place-items-center rounded-[12px] border border-line bg-white text-accent hover:bg-bg-soft",
                    isWished && "bg-pink/40"
                  )}
                >
                  <Heart size={20} fill={isWished ? "currentColor" : "none"} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={onAddToCart}
                  className="btn-outline h-[52px] flex-1 !text-[14px]"
                >
                  <ShoppingCart size={16} aria-hidden /> 장바구니
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart();
                    // 결제 페이지로 이동 (1차에서는 placeholder)
                    window.location.href = "/cart";
                  }}
                  className="btn-primary h-[52px] flex-1 !text-[14px]"
                >
                  바로 구매
                </button>
              </div>
            </>
          )}

          <p className="mt-4 border-t border-line pt-4 text-[11px] leading-relaxed text-ink-soft">
            ※ 주문제작 상품으로, 결제 후 24시간 또는 생산 시작 후에는 단순 변심에 의한 환불이 제한될 수
            있습니다 (전자상거래법 제17조).
          </p>
        </div>
      </div>

      {/* ===== 탭: 상품 상세 / 리뷰 / Q&A ===== */}
      <ProductTabs
        productId={productId}
        detailHtml={product.detailHtml}
        detailImages={product.detailImages}
      />
    </div>
  );
}

// ---- 서브 컴포넌트 ----

function EntryGuide({ type }: { type: NonNullable<DetailBodyProps["product"]["type"]> }) {
  const href = type === "AI_ENTRY" ? "/ai-character" : "/custom-sticker";
  const label = type === "AI_ENTRY" ? "AI 캐릭터 만들기" : "커스텀 스티커 시작하기";
  return (
    <div className="rounded-[12px] border border-dashed border-peach-2 bg-bg-soft p-6 text-center">
      <p className="text-sm font-semibold text-ink">
        이 상품은 편집기에서 직접 만들어요.
      </p>
      <p className="mt-1 text-[12px] text-ink-soft">
        용지와 크기, 디자인은 다음 단계에서 선택할 수 있어요.
      </p>
      <Link href={href} className="btn-primary mt-4 inline-flex">
        {label} →
      </Link>
    </div>
  );
}

function PaperSelector({
  grouped,
  selectedPaperCode,
  onSelect,
}: {
  grouped: [string, PaperOption[]][];
  selectedPaperCode: string | undefined;
  onSelect: (code: string) => void;
}) {
  if (grouped.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-[13px] font-semibold">용지 선택</p>
      <div className="flex flex-wrap gap-2">
        {grouped.map(([code, opts]) => (
          <button
            key={code}
            type="button"
            onClick={() => onSelect(code)}
            className={cn(
              "min-w-[80px] rounded-[10px] border px-4 py-2 text-sm transition-colors",
              code === selectedPaperCode
                ? "border-accent bg-peach text-accent-deep font-bold"
                : "border-line bg-white text-ink hover:border-accent/40"
            )}
          >
            {opts[0]?.paperName ?? code}
          </button>
        ))}
      </div>
    </div>
  );
}

function SizeSelector({
  sizes,
  selectedSizeId,
  onSelect,
}: {
  sizes: PaperOption[];
  selectedSizeId: number | undefined;
  onSelect: (id: number) => void;
}) {
  if (sizes.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-[13px] font-semibold">크기 선택</p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((o) => (
          <button
            key={o.paperSizeId}
            type="button"
            onClick={() => o.paperSizeId != null && onSelect(o.paperSizeId)}
            className={cn(
              "rounded-[10px] border px-4 py-2 text-sm transition-colors",
              o.paperSizeId === selectedSizeId
                ? "border-accent bg-peach text-accent-deep font-bold"
                : "border-line bg-white text-ink hover:border-accent/40"
            )}
          >
            {o.sizeLabel}
            <span className="ml-2 text-[11px] font-normal text-ink-soft">
              {formatKrw(o.unitPrice ?? 0)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function QuantityControl({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-semibold">수량</p>
      <div className="inline-flex items-center overflow-hidden rounded-[10px] border border-line">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, quantity - 1))}
          className="grid size-9 place-items-center hover:bg-bg-soft"
          aria-label="수량 감소"
        >
          <Minus size={14} aria-hidden />
        </button>
        <span className="min-w-[40px] text-center text-sm font-semibold">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => onChange(quantity + 1)}
          className="grid size-9 place-items-center hover:bg-bg-soft"
          aria-label="수량 증가"
        >
          <Plus size={14} aria-hidden />
        </button>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="app-wrap pb-16 pt-6">
      <div className="grid grid-cols-[minmax(0,520px)_1fr] gap-10 max-[860px]:grid-cols-1">
        <div className="aspect-square animate-pulse rounded-card border border-line bg-bg-soft" />
        <div className="space-y-3">
          <div className="h-6 w-24 animate-pulse rounded bg-bg-soft" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-bg-soft" />
          <div className="h-6 w-1/2 animate-pulse rounded bg-bg-soft" />
          <div className="h-12 animate-pulse rounded bg-bg-soft" />
        </div>
      </div>
    </div>
  );
}
