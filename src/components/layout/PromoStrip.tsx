/**
 * 최상단 검정 프로모 스트립. 목업 v2 텍스트 일치.
 */
interface PromoStripProps {
  message?: string;
  href?: string;
}

export function PromoStrip({
  message = "AI 네임스티커 런칭 기념 30% 할인",
  href = "/events/launch-30",
}: PromoStripProps) {
  return (
    <a
      href={href}
      className="block w-full bg-[#1c1a19] px-3 py-[9px] text-center text-[13px] font-semibold tracking-tight text-white max-[680px]:px-[10px] max-[680px]:py-2 max-[680px]:text-[11.5px]"
    >
      {message}
    </a>
  );
}
