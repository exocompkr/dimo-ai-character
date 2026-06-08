/**
 * 쿠폰 띠배너. 목업 v2 .coupon 구조 그대로.
 *
 * 좌: NEW 칩 + "오늘이 처음이세요?" + "첫 주문 무료배송 +5% 쿠폰팩"
 * 우: 5% 쿠폰 박스 + QR + 앱 다운로드 안내
 */
export function CouponBand() {
  return (
    <div
      className="mt-[30px] flex items-center gap-[18px] rounded-[18px] border border-[#d9e6f6] px-[26px] py-5 max-[760px]:flex-wrap max-[760px]:gap-3 max-[760px]:px-[18px] max-[760px]:py-4"
      style={{ background: "linear-gradient(100deg,#e8f1fb,#eef4fc)" }}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="rounded-[11px] bg-accent px-[9px] py-[3px] text-[10px] font-bold text-white">
            NEW
          </span>
          <span className="text-[12px] text-[#6f86a3]">오늘이 처음이세요?</span>
        </div>
        <div className="text-[21px] font-extrabold tracking-[-0.5px] text-[#34506e] max-[760px]:text-[17px]">
          첫 주문 무료배송 +5% 쿠폰팩
        </div>
        <div className="mt-1 text-[12px] text-[#6f86a3]">
          지금 회원가입하고 바로 사용하세요!
        </div>
      </div>

      <div className="relative flex h-[64px] w-[88px] flex-shrink-0 flex-col items-center justify-center rounded-[12px] bg-white shadow-[var(--shadow-card-sm)]">
        <b className="text-[24px] font-extrabold leading-none text-accent-deep">
          5%
        </b>
        <small className="mt-0.5 text-[9px] tracking-[1px] text-ink-soft">
          COUPON
        </small>
      </div>

      <div className="flex flex-shrink-0 items-center gap-3 rounded-[12px] bg-white px-4 py-2.5 shadow-[var(--shadow-card-sm)] max-[760px]:hidden">
        <CouponQr />
        <span className="text-[11px] text-[#6f86a3]">
          <b className="mb-0.5 block text-[12.5px] font-bold text-[#34506e]">
            앱에서 더 편리하게!
          </b>
          앱 다운로드 ⤓
        </span>
      </div>
    </div>
  );
}

/**
 * QR 코드 (목업 v2 인라인 SVG 그대로).
 */
function CouponQr() {
  return (
    <svg
      viewBox="0 0 40 40"
      width={54}
      height={54}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="40" height="40" rx="5" fill="#fff" />
      <g fill="#34506e">
        <path d="M5 5h9v9H5zM7 7v5h5V7z" />
        <path d="M26 5h9v9h-9zM28 7v5h5V7z" />
        <path d="M5 26h9v9H5zM7 28v5h5v-5z" />
        <rect x="17" y="6" width="2" height="2" />
        <rect x="20" y="6" width="2" height="2" />
        <rect x="17" y="9" width="2" height="2" />
        <rect x="22" y="9" width="2" height="2" />
        <rect x="17" y="17" width="2" height="2" />
        <rect x="20" y="18" width="2" height="2" />
        <rect x="23" y="17" width="2" height="2" />
        <rect x="26" y="20" width="2" height="2" />
        <rect x="29" y="18" width="2" height="2" />
        <rect x="32" y="20" width="2" height="2" />
        <rect x="17" y="22" width="2" height="2" />
        <rect x="20" y="24" width="2" height="2" />
        <rect x="26" y="26" width="2" height="2" />
        <rect x="29" y="29" width="2" height="2" />
        <rect x="32" y="26" width="2" height="2" />
        <rect x="26" y="32" width="2" height="2" />
        <rect x="31" y="32" width="2" height="2" />
      </g>
    </svg>
  );
}
