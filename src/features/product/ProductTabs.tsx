"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock, MessageSquare, Pencil, Star as StarIcon } from "lucide-react";
import {
  useProductQna,
  useReviewList,
  useReviewSummary,
} from "./reviewHooks";
import type { ProductQnaDto, ProductReviewDto } from "./reviewApi";
import { Stars } from "./Stars";
import { cn } from "@/lib/cn";

type TabKey = "detail" | "review" | "qna";

interface ProductTabsProps {
  productId: number;
  detailHtml?: string | null;
  detailImages?: string[] | null;
}

/**
 * 상품 상세 페이지 하단 탭.
 *  - 상품상세 : detailHtml + detailImages (서버 렌더된 HTML)
 *  - 리뷰     : 평균/개수 + 리스트 + 페이지네이션 + (로그인 후 작성)
 *  - Q&A      : 질문/답변 트리 + (로그인 후 문의)
 */
export function ProductTabs({ productId, detailHtml, detailImages }: ProductTabsProps) {
  const [tab, setTab] = useState<TabKey>("detail");
  const summary = useReviewSummary(productId);

  return (
    <section className="mt-14 border-t border-line pt-6">
      <nav role="tablist" className="sticky top-[50px] z-20 -mx-2 mb-6 flex gap-1 overflow-x-auto bg-white/95 px-2 py-2 backdrop-blur-md">
        <TabButton active={tab === "detail"} onClick={() => setTab("detail")}>
          상품 상세
        </TabButton>
        <TabButton active={tab === "review"} onClick={() => setTab("review")}>
          <StarIcon size={14} className="text-accent" aria-hidden />
          리뷰
          {summary.data?.count != null && (
            <span className="ml-1 text-[12px] text-ink-soft">
              {summary.data.count}
            </span>
          )}
        </TabButton>
        <TabButton active={tab === "qna"} onClick={() => setTab("qna")}>
          <MessageSquare size={14} aria-hidden />
          Q&amp;A
        </TabButton>
      </nav>

      {tab === "detail" && (
        <DetailPanel html={detailHtml} images={detailImages} />
      )}
      {tab === "review" && (
        <ReviewPanel productId={productId} />
      )}
      {tab === "qna" && (
        <QnaPanel productId={productId} />
      )}
    </section>
  );
}

// ---------------- Tab button ----------------
function TabButton({
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
      role="tab"
      aria-selected={active}
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[18px] px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-ink font-bold text-white"
          : "text-ink-soft hover:bg-bg-soft hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

// ---------------- 상품 상세 ----------------
function DetailPanel({
  html,
  images,
}: {
  html?: string | null;
  images?: string[] | null;
}) {
  if (!html && (!images || images.length === 0)) {
    return (
      <p className="rounded-card border border-line bg-bg-soft p-8 text-center text-sm text-ink-soft">
        상품 상세 정보가 아직 준비되지 않았어요.
      </p>
    );
  }
  return (
    <div className="prose prose-sm max-w-none">
      {html && (
        <div
          className="text-[14px] leading-[1.7] text-ink [&_h3]:mt-6 [&_h3]:text-[16px] [&_h3]:font-bold [&_li]:mt-0.5 [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5"
          // 운영팀이 작성한 정적 HTML (NFR-007 라이선스/검수 통과 가정). 외부 사용자 입력 아님.
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
      {images && images.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          {images.map((src, i) => (
            <div key={i} className="overflow-hidden rounded-card border border-line">
              <Image
                src={src}
                alt={`상품 상세 ${i + 1}`}
                width={1200}
                height={1200}
                className="h-auto w-full object-contain"
                unoptimized={src.startsWith("/")}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- 리뷰 ----------------
function ReviewPanel({ productId }: { productId: number }) {
  const summary = useReviewSummary(productId);
  const [page, setPage] = useState(0);
  const list = useReviewList(productId, page);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between rounded-card border border-line bg-bg-soft px-5 py-4">
        <div>
          <p className="text-[11px] text-ink-soft">전체 평점</p>
          <div className="mt-1 flex items-baseline gap-2">
            <strong className="text-[28px] font-extrabold text-accent">
              {(summary.data?.averageRating ?? 0).toFixed(1)}
            </strong>
            <span className="text-[12px] text-ink-soft">/ 5.0</span>
            <Stars value={summary.data?.averageRating ?? 0} size={16} className="ml-2" />
          </div>
          <p className="mt-1 text-[12px] text-ink-soft">
            {summary.data?.count ?? 0}개의 리뷰
          </p>
        </div>
        <button
          type="button"
          disabled
          title="로그인 후 작성 가능 (슬라이스 #2 이후 활성)"
          className="btn-outline cursor-not-allowed gap-1.5 !text-[12px] opacity-60"
        >
          <Lock size={12} aria-hidden /> 리뷰 작성 (로그인 필요)
        </button>
      </header>

      {list.isLoading && <SkeletonList />}
      {list.isError && (
        <ErrorBox onRetry={() => list.refetch()}>리뷰를 불러오지 못했어요.</ErrorBox>
      )}
      {list.isSuccess && (list.data.content ?? []).length === 0 && (
        <EmptyBox>아직 등록된 리뷰가 없어요.</EmptyBox>
      )}
      {list.isSuccess && (list.data.content ?? []).length > 0 && (
        <>
          <ul className="flex flex-col">
            {list.data.content!.map((r) => (
              <ReviewItem key={r.id} review={r} />
            ))}
          </ul>
          <SimplePagination
            page={list.data.number ?? 0}
            totalPages={list.data.totalPages ?? 1}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}

function ReviewItem({ review }: { review: ProductReviewDto }) {
  return (
    <li className="border-b border-line py-4 last:border-b-0">
      <div className="flex items-center gap-2">
        <Stars value={review.rating ?? 0} />
        <span className="text-[13px] font-semibold">{review.authorName}</span>
        <span className="ml-auto text-[11px] text-ink-soft">
          {formatDate(review.createdAt)}
        </span>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-[1.6] text-ink">
        {review.body}
      </p>
    </li>
  );
}

// ---------------- Q&A ----------------
function QnaPanel({ productId }: { productId: number }) {
  const qna = useProductQna(productId);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between rounded-card border border-line bg-bg-soft px-5 py-4">
        <div>
          <p className="text-[14px] font-bold text-ink">상품 문의</p>
          <p className="mt-0.5 text-[12px] text-ink-soft">
            답변은 영업일 기준 1일 이내 (일요일/공휴일 제외)
          </p>
        </div>
        <button
          type="button"
          disabled
          title="로그인 후 작성 가능 (슬라이스 #2 이후 활성)"
          className="btn-outline cursor-not-allowed gap-1.5 !text-[12px] opacity-60"
        >
          <Pencil size={12} aria-hidden /> 문의하기 (로그인 필요)
        </button>
      </header>

      {qna.isLoading && <SkeletonList />}
      {qna.isError && (
        <ErrorBox onRetry={() => qna.refetch()}>Q&amp;A를 불러오지 못했어요.</ErrorBox>
      )}
      {qna.isSuccess && (qna.data ?? []).length === 0 && (
        <EmptyBox>아직 등록된 문의가 없어요.</EmptyBox>
      )}
      {qna.isSuccess && (qna.data ?? []).length > 0 && (
        <ul className="flex flex-col">
          {qna.data!.map((q) => (
            <QnaItem key={q.id} question={q} />
          ))}
        </ul>
      )}
    </div>
  );
}

function QnaItem({ question }: { question: ProductQnaDto }) {
  const answers = question.answers ?? [];
  const isUnanswered = answers.length === 0;
  return (
    <li className="border-b border-line py-4 last:border-b-0">
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white">
          Q
        </span>
        {question.secret && (
          <span className="inline-flex items-center gap-0.5 text-[11px] text-ink-soft">
            <Lock size={10} aria-hidden /> 비밀글
          </span>
        )}
        <span className="text-[13px] font-semibold">{question.authorName}</span>
        <span className="ml-auto text-[11px] text-ink-soft">
          {formatDate(question.createdAt)}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold",
            isUnanswered
              ? "bg-bg-soft text-ink-soft"
              : "bg-peach text-accent-deep"
          )}
        >
          {isUnanswered ? "답변 대기" : "답변 완료"}
        </span>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-[1.6] text-ink">
        {question.body}
      </p>

      {answers.map((a) => (
        <div
          key={a.id}
          className="mt-3 rounded-card bg-bg-soft p-4"
        >
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
              A
            </span>
            <span className="text-[13px] font-semibold">{a.authorName}</span>
            <span className="ml-auto text-[11px] text-ink-soft">
              {formatDate(a.createdAt)}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-[1.6] text-ink">
            {a.body}
          </p>
        </div>
      ))}
    </li>
  );
}

// ---------------- 공용 ----------------
function SkeletonList() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-card border border-line p-4">
          <div className="h-3 w-32 animate-pulse rounded bg-bg-soft" />
          <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-bg-soft" />
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-bg-soft" />
        </div>
      ))}
    </div>
  );
}

function EmptyBox({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-card border border-line bg-bg-soft p-8 text-center text-sm text-ink-soft">
      {children}
    </p>
  );
}

function ErrorBox({
  children,
  onRetry,
}: {
  children: React.ReactNode;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-card border border-line bg-white p-8 text-center">
      <p className="text-sm text-ink-soft">{children}</p>
      <button type="button" onClick={onRetry} className="btn-outline mt-3">
        다시 시도
      </button>
    </div>
  );
}

function SimplePagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-2 flex justify-center gap-1">
      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={cn(
            "grid size-8 place-items-center rounded-md text-sm",
            i === page
              ? "bg-ink font-bold text-white"
              : "text-ink-soft hover:bg-bg-soft"
          )}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}
