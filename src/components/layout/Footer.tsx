import Image from "next/image";
import Link from "next/link";
import { MOCKUP_ASSETS } from "@/assets/mockup";
import { Logo } from "./Logo";

/**
 * 하단 푸터. 목업 v2 footer 마크업과 동일.
 *
 * - foot-top : 좌측 로고+링크 / 우측 마스코트+고객센터
 * - foot-info: 실제 사업자 정보
 */
export function Footer() {
  return (
    <footer className="mt-[56px] border-t border-line bg-bg-soft px-0 pb-[42px] pt-[34px]">
      <div className="app-wrap">
        <div className="flex flex-wrap items-start justify-between gap-5">
          {/* 좌: 로고 + 링크 */}
          <div>
            <Logo src={MOCKUP_ASSETS.footerLogo} height={30} />
            <div className="mt-[14px] flex flex-wrap gap-[18px]">
              <Link
                href="/privacy"
                className="text-[12.5px] font-bold hover:text-accent"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/terms"
                className="text-[12.5px] hover:text-accent"
              >
                이용약관
              </Link>
              <Link
                href="/faq"
                className="text-[12.5px] hover:text-accent"
              >
                자주 묻는 질문
              </Link>
            </div>
          </div>

          {/* 우: 마스코트 + 고객센터 */}
          <div className="flex items-center gap-[14px]">
            <Image
              src={MOCKUP_ASSETS.footerMascot}
              alt=""
              width={78}
              height={78}
              className="h-[78px] w-auto object-contain"
            />
            <div>
              <div className="text-[11px] text-ink-soft">고객센터</div>
              <div className="text-[21px] font-bold">1899-1608</div>
              <div className="mt-0.5 text-[11px] text-ink-soft">
                평일 09:30 - 18:00 / 점심 12:30 - 13:30
              </div>
            </div>
          </div>
        </div>

        {/* 사업자 정보 */}
        <div className="mt-[22px] max-w-[760px] text-[11.5px] leading-[1.9] text-ink-soft">
          <b className="font-semibold text-ink">상호명</b> 디모
          &nbsp;|&nbsp;
          <b className="font-semibold text-ink">대표이사</b> 박선재
          <br />
          <b className="font-semibold text-ink">주소</b> 충청남도 아산시 음봉면
          연암산로 52-28 (유원빌) 1층 디모 (우 : 31415)
          <br />
          <b className="font-semibold text-ink">사업자등록번호</b> 888-27-01594
          &nbsp;|&nbsp;
          <b className="font-semibold text-ink">통신판매업신고번호</b>{" "}
          2024-충남아산-0903
          <br />
          <b className="font-semibold text-ink">이메일</b> dimo2024@naver.com
        </div>

        <div className="mt-[22px] text-[11px] text-[#c2b9b4]">
          © 2026 DIMO. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
