/**
 * KRW 통화 포매팅 (예: 12000 → "12,000원")
 */
export function formatKrw(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

/**
 * 할인율 계산 (반올림)
 */
export function calcDiscountPercent(
  originalPrice: number,
  salePrice: number
): number {
  if (originalPrice <= 0 || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}
