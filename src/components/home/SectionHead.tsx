import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

interface SectionHeadProps {
  mascotSrc: string;
  title: ReactNode;
  moreHref?: string;
  moreLabel?: string;
}

/**
 * 섹션 헤더. 좌측에 title-mascot(58×58 PNG) + 제목, 우측에 "전체보기 ›".
 * 목업 v2 .sec-head 구조 그대로.
 */
export function SectionHead({
  mascotSrc,
  title,
  moreHref,
  moreLabel = "전체보기",
}: SectionHeadProps) {
  return (
    <div className="sec-head">
      <h2>
        <Image
          src={mascotSrc}
          alt=""
          width={58}
          height={58}
          className="inline-block size-[58px] flex-shrink-0 object-contain max-[680px]:size-[44px]"
        />
        <span>{title}</span>
      </h2>
      {moreHref && (
        <Link href={moreHref} className="more">
          {moreLabel} ›
        </Link>
      )}
    </div>
  );
}
