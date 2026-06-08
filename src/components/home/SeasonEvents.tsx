import Link from "next/link";
import Image from "next/image";
import type { EventCard } from "@/types/domain";
import { MOCKUP_ASSETS } from "@/assets/mockup";
import { SectionHead } from "./SectionHead";

interface SeasonEventsProps {
  events: EventCard[];
}

/**
 * 시즌 이벤트 4칸 그리드. 목업 v2 .season-sec / .season-grid 구조.
 * 각 카드는 1:1 이미지 + 컬러 배경 라벨.
 */
export function SeasonEvents({ events }: SeasonEventsProps) {
  return (
    <section className="mt-[46px]">
      <SectionHead
        mascotSrc={MOCKUP_ASSETS.seasonMascot}
        title="시즌 이벤트 타이틀"
        moreHref="/events"
      />

      <div className="grid grid-cols-4 gap-[14px] max-[760px]:grid-cols-2">
        {events.map((e) => (
          <Link
            key={e.id}
            href={e.linkUrl}
            className="group relative overflow-hidden border border-line bg-white transition-transform duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
          >
            <div className="aspect-square overflow-hidden">
              <Image
                src={e.imageUrl}
                alt={e.label}
                width={300}
                height={300}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span
              className="block px-1.5 py-3 text-center text-[14px] font-bold text-white"
              style={{ background: e.labelBgColor }}
            >
              {e.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
