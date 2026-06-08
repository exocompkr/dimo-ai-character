import { http, HttpResponse } from "msw";
import {
  MOCK_CAMPAIGN_STRIPS,
  MOCK_EVENTS,
  MOCK_HERO_BANNERS,
  MOCK_INSTA_POSTS,
  MOCK_POPULAR_PRODUCTS,
  MOCK_PRODUCTS,
  getCuratedCategories,
} from "./data";

/**
 * MSW 핸들러. 백엔드 API 스펙이 확정되면 그대로 교체하거나 제거.
 *
 * 현재 홈 화면은 Server Component에서 mock data를 직접 import 하므로
 * 이 핸들러들은 클라이언트 측 fetch (예: 마이페이지) 에서만 사용됨.
 */
export const handlers = [
  http.get("/api/products", () => HttpResponse.json(MOCK_PRODUCTS)),
  http.get("/api/products/popular", () =>
    HttpResponse.json(MOCK_POPULAR_PRODUCTS)
  ),
  http.get("/api/products/:id", ({ params }) => {
    const p = MOCK_PRODUCTS.find((x) => x.id === params.id);
    return p ? HttpResponse.json(p) : new HttpResponse(null, { status: 404 });
  }),
  http.get("/api/categories", () => HttpResponse.json(getCuratedCategories())),
  http.get("/api/banners/hero", () => HttpResponse.json(MOCK_HERO_BANNERS)),
  http.get("/api/banners/campaigns", () =>
    HttpResponse.json(MOCK_CAMPAIGN_STRIPS)
  ),
  http.get("/api/events", () => HttpResponse.json(MOCK_EVENTS)),
  http.get("/api/insta/posts", () => HttpResponse.json(MOCK_INSTA_POSTS)),
];
