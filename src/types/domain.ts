/**
 * 디모 자사몰 도메인 타입 정의
 *
 * 백엔드 API 스키마가 확정되기 전 임시 정의이며,
 * dimo_back과 합의 후 OpenAPI에서 생성으로 교체 예정.
 */

export type ProductId = string;
export type CategoryId = string;
export type BannerId = string;

export interface Product {
  id: ProductId;
  name: string;
  shortName?: string;
  categoryIds: CategoryId[];
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  imageUrl: string;
  badge?: "NEW" | "BEST" | "AI" | "LIMITED";
  rating?: number;
  reviewCount?: number;
  isAiCustom?: boolean;
}

export interface Category {
  id: CategoryId;
  name: string;
  imageUrl: string;
  curation: boolean;
  order: number;
}

export interface Banner {
  id: BannerId;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  linkUrl: string;
  variant: "hero" | "event" | "campaign-strip";
}

export interface CampaignStrip {
  id: string;
  label: string;
  message: string;
  bgColor: string;
  linkUrl: string;
}

export interface EventCard {
  id: string;
  imageUrl: string;
  label: string;
  labelBgColor: string;
  linkUrl: string;
}

export interface InstaPost {
  id: string;
  imageUrl: string;
  permalink: string;
  caption?: string;
}
