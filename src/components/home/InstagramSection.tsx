"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { InstaPost } from "@/types/domain";
import { MOCKUP_ASSETS } from "@/assets/mockup";

interface InstagramSectionProps {
  posts: InstaPost[];
  handle?: string;
}

/**
 * 인스타그램 섹션. 목업 v2 .insta-sec / .insta-box 구조.
 *
 * - 우상단에 side-mascot이 박스 위로 살짝 떠 있음 (top:-46px)
 * - .insta-box: purple-tinted #efeaf6 배경
 * - 좌우 화살표 ‹ › 로 가로 스크롤
 */
export function InstagramSection({
  posts,
  handle = "dimo_official",
}: InstagramSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dx: number) => {
    trackRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    <section className="relative mt-[46px]">
      <Image
        src={MOCKUP_ASSETS.instaSideMascot}
        alt=""
        width={56}
        height={56}
        className="pointer-events-none absolute -top-[46px] right-[8px] z-[1] h-auto w-[56px] max-[680px]:-top-[36px] max-[680px]:right-[10px] max-[680px]:w-[46px]"
        aria-hidden
      />

      <div className="rounded-[18px] bg-[#efeaf6] px-6 py-[26px]">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="block size-[42px] overflow-hidden rounded-[11px] border-2 border-white bg-white shadow-[var(--shadow-card-sm)]">
            <Image
              src={MOCKUP_ASSETS.instaAvatar}
              alt="Instagram"
              width={42}
              height={42}
              className="size-full object-cover"
            />
          </span>
          <span className="text-[15px] font-bold leading-tight">
            디모의 일상을 인스타그램에서
            <small className="block text-[11px] font-normal text-ink-soft">
              @{handle}
            </small>
          </span>
          <Link
            href={`https://instagram.com/${handle}`}
            target="_blank"
            rel="noopener"
            className="ml-auto rounded-[20px] bg-ink px-[18px] py-2 text-[12px] font-bold text-white"
          >
            팔로우하기
          </Link>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => scrollBy(-340)}
            aria-label="이전 게시물"
            className="absolute -left-[10px] top-1/2 z-[2] grid size-[34px] -translate-y-1/2 place-items-center rounded-full border-none bg-white text-[15px] shadow-[var(--shadow-card)] hover:bg-bg-soft"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollBy(340)}
            aria-label="다음 게시물"
            className="absolute -right-[10px] top-1/2 z-[2] grid size-[34px] -translate-y-1/2 place-items-center rounded-full border-none bg-white text-[15px] shadow-[var(--shadow-card)] hover:bg-bg-soft"
          >
            ›
          </button>

          <div
            ref={trackRef}
            className="no-scrollbar flex gap-2.5 overflow-x-auto scroll-smooth"
          >
            {posts.map((p) => (
              <Link
                key={p.id}
                href={p.permalink}
                target="_blank"
                rel="noopener"
                className="block h-[160px] w-[160px] flex-shrink-0 overflow-hidden rounded-[12px] shadow-[var(--shadow-card-sm)] transition-transform hover:scale-[1.03]"
                aria-label={p.caption}
              >
                <Image
                  src={p.imageUrl}
                  alt=""
                  width={160}
                  height={160}
                  className="size-full object-cover"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
