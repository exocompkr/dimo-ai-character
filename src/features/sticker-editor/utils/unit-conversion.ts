/**
 * 단위 변환 유틸리티
 * px (픽셀) ↔ mm (밀리미터) 변환
 */

/** 기본 DPI (웹 표준) */
export const DEFAULT_DPI = 72;

/** 1인치 = 25.4mm */
const MM_PER_INCH = 25.4;

/**
 * 픽셀을 밀리미터로 변환
 * @param px 픽셀 값
 * @param dpi DPI (기본값: 72)
 * @returns 밀리미터 값
 *
 * @example
 * pxToMm(72) // => 25.4 (72px at 72dpi = 1 inch = 25.4mm)
 */
export function pxToMm(px: number, dpi: number = DEFAULT_DPI): number {
  const inches = px / dpi;
  return inches * MM_PER_INCH;
}

/**
 * 밀리미터를 픽셀로 변환
 * @param mm 밀리미터 값
 * @param dpi DPI (기본값: 72)
 * @returns 픽셀 값
 *
 * @example
 * mmToPx(25.4) // => 72 (25.4mm = 1 inch = 72px at 72dpi)
 */
export function mmToPx(mm: number, dpi: number = DEFAULT_DPI): number {
  const inches = mm / MM_PER_INCH;
  return inches * dpi;
}

/**
 * 크기를 mm 문자열로 포맷팅
 * @param widthPx 너비 (픽셀)
 * @param heightPx 높이 (픽셀)
 * @param dpi DPI (기본값: 72)
 * @returns "가로 x 세로 mm" 형식 문자열
 *
 * @example
 * formatSizeMm(144, 180) // => "51 x 64 mm"
 */
export function formatSizeMm(
  widthPx: number,
  heightPx: number,
  dpi: number = DEFAULT_DPI
): string {
  const widthMm = Math.round(pxToMm(widthPx, dpi));
  const heightMm = Math.round(pxToMm(heightPx, dpi));
  return `${widthMm} x ${heightMm} mm`;
}

/**
 * 크기를 콤팩트 mm 문자열로 포맷팅 (레퍼런스 이미지 스타일)
 * @param widthPx 너비 (픽셀)
 * @param heightPx 높이 (픽셀)
 * @param dpi DPI (기본값: 72)
 * @returns "가로 x 세로 mm" 형식 문자열 (소수점 없음)
 *
 * @example
 * formatSizeCompact(144, 180) // => "51 x 64 mm"
 */
export function formatSizeCompact(
  widthPx: number,
  heightPx: number,
  dpi: number = DEFAULT_DPI
): string {
  const widthMm = Math.round(pxToMm(Math.abs(widthPx), dpi));
  const heightMm = Math.round(pxToMm(Math.abs(heightPx), dpi));
  return `${widthMm} x ${heightMm} mm`;
}
