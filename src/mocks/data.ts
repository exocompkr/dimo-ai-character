import { MOCKUP_ASSETS } from "@/assets/mockup";
import type {
  CampaignStrip,
  Category,
  EventCard,
  InstaPost,
  Product,
} from "@/types/domain";

/**
 * 인기 상품 (6개) — dimo_mockup_v2 popular-sec와 동일 (이름/가격/이미지).
 */
export const MOCK_POPULAR_PRODUCTS: Product[] = [
  {
    id: "p-pop-1",
    name: "의류 네임스티커",
    categoryIds: ["clothes"],
    price: 7900,
    imageUrl: MOCKUP_ASSETS.popularItems[0],
  },
  {
    id: "p-pop-2",
    name: "투명 네임스티커",
    categoryIds: ["transparent"],
    price: 6900,
    imageUrl: MOCKUP_ASSETS.popularItems[1],
  },
  {
    id: "p-pop-3",
    name: "디자인 네임스티커",
    categoryIds: ["design"],
    price: 8900,
    imageUrl: MOCKUP_ASSETS.popularItems[2],
  },
  {
    id: "p-pop-4",
    name: "원형 네임스티커",
    categoryIds: ["round"],
    price: 3600,
    imageUrl: MOCKUP_ASSETS.popularItems[3],
  },
  {
    id: "p-pop-5",
    name: "방수 네임스티커",
    categoryIds: ["waterproof"],
    price: 7900,
    imageUrl: MOCKUP_ASSETS.popularItems[4],
  },
  {
    id: "p-pop-6",
    name: "미니 네임스티커",
    categoryIds: ["mini"],
    price: 5900,
    imageUrl: MOCKUP_ASSETS.popularItems[5],
  },
];

/**
 * 시즌 이벤트 (4개) — dimo_mockup_v2 season-grid와 동일.
 * 라벨 배경색은 목업 인라인 스타일 그대로.
 */
export const MOCK_SEASON_EVENTS: EventCard[] = [
  {
    id: "se-1",
    imageUrl: MOCKUP_ASSETS.seasonItems[0],
    label: "출시 기념 최대 30% 할인",
    labelBgColor: "#f0604a",
    linkUrl: "/events/launch-30",
  },
  {
    id: "se-2",
    imageUrl: MOCKUP_ASSETS.seasonItems[1],
    label: "새학기 이벤트",
    labelBgColor: "#3f74c4",
    linkUrl: "/events/new-semester",
  },
  {
    id: "se-3",
    imageUrl: MOCKUP_ASSETS.seasonItems[2],
    label: "1+1 이벤트",
    labelBgColor: "#f0a92e",
    linkUrl: "/events/1plus1",
  },
  {
    id: "se-4",
    imageUrl: MOCKUP_ASSETS.seasonItems[3],
    label: "최대 10,000 포인트 증정",
    labelBgColor: "#3f9a6e",
    linkUrl: "/events/point-10000",
  },
];

/**
 * 카테고리 9개 — dimo_mockup_v2 iconmenu와 동일.
 * 이미지가 아니라 emoji + 컬러 배경 형식.
 */
export interface IconCategory {
  id: string;
  name: string;
  /** 부가 라벨 (예: "UV DTF") */
  sub?: string;
  emoji: string;
  bgColor: string;
  linkUrl: string;
}

export const MOCK_ICON_CATEGORIES: IconCategory[] = [
  {
    id: "ai-character",
    name: "AI 캐릭터",
    emoji: "🧒",
    bgColor: "#ffe7dc",
    linkUrl: "/ai-character",
  },
  {
    id: "normal",
    name: "일반 스티커",
    emoji: "🧸",
    bgColor: "#f1e8df",
    linkUrl: "/category/normal",
  },
  {
    id: "freeform",
    name: "자유형 스티커",
    sub: "UV DTF",
    emoji: "🦖",
    bgColor: "#e3f2e1",
    linkUrl: "/category/freeform",
  },
  {
    id: "waterproof",
    name: "방수 스티커",
    emoji: "💧",
    bgColor: "#e0eefb",
    linkUrl: "/category/waterproof",
  },
  {
    id: "clothes",
    name: "의류 스티커",
    emoji: "👕",
    bgColor: "#ffe3ec",
    linkUrl: "/category/clothes",
  },
  {
    id: "transfer",
    name: "판박이",
    emoji: "🍒",
    bgColor: "#ffe1e1",
    linkUrl: "/category/transfer",
  },
  {
    id: "event",
    name: "이벤트",
    emoji: "🎁",
    bgColor: "#ffe0e6",
    linkUrl: "/events",
  },
  {
    id: "best",
    name: "베스트",
    emoji: "👑",
    bgColor: "#fff2d4",
    linkUrl: "/category/best",
  },
  {
    id: "new",
    name: "신상품",
    emoji: "⭐",
    bgColor: "#fff2d4",
    linkUrl: "/category/new",
  },
];

/**
 * 최근 본 상품 (서버 사이드 초기값 — 클라이언트는 zustand로 덮어씀).
 */
export const MOCK_RECENT_PRODUCTS: Product[] = [
  {
    id: "p-recent-1",
    name: "심플 네임스티커",
    categoryIds: ["simple"],
    price: 7900,
    imageUrl: MOCKUP_ASSETS.recentItems[0],
  },
  {
    id: "p-recent-2",
    name: "디자인 네임스티커",
    categoryIds: ["design"],
    price: 8900,
    imageUrl: MOCKUP_ASSETS.recentItems[1],
  },
  {
    id: "p-recent-3",
    name: "원형 네임스티커",
    categoryIds: ["round"],
    price: 3600,
    imageUrl: MOCKUP_ASSETS.recentItems[2],
  },
];

/**
 * 인스타 게시물 6개.
 */
export const MOCK_INSTA_POSTS: InstaPost[] = MOCKUP_ASSETS.instaCarousel.map(
  (img, i) => ({
    id: `insta-${i + 1}`,
    imageUrl: img,
    permalink: "https://instagram.com/dimo_official",
    caption: `dimo_official post ${i + 1}`,
  })
);

/**
 * 히어로 배너 데이터 (정확한 문구는 컴포넌트 내부에 하드코딩).
 */
export const MOCK_HERO_FACES = MOCKUP_ASSETS.heroFaces;
export const MOCK_HERO_CHARACTER = MOCKUP_ASSETS.heroCharacter;

// === 향후 백엔드 합의 후 교체 예정 ===

/**
 * (legacy) 옛 컴포넌트 호환용 빈 배열들.
 */
export const MOCK_PRODUCTS: Product[] = MOCK_POPULAR_PRODUCTS;
export const MOCK_CATEGORIES: Category[] = [];
export const MOCK_HERO_BANNERS = [];
export const MOCK_CAMPAIGN_STRIPS: CampaignStrip[] = [];
export const MOCK_EVENTS = MOCK_SEASON_EVENTS;

export function getCuratedCategories(): Category[] {
  return [];
}
