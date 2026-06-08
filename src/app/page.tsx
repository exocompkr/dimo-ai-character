import { HeroSection } from "@/components/home/HeroSection";
import { CategoryIcons } from "@/components/home/CategoryIcons";
import { SeasonEvents } from "@/components/home/SeasonEvents";
import { CouponBand } from "@/components/home/CouponBand";
import { PopularProducts } from "@/components/home/PopularProducts";
import { InstagramSection } from "@/components/home/InstagramSection";
import { RecentlyViewedFloat } from "@/components/home/RecentlyViewedFloat";
import {
  MOCK_ICON_CATEGORIES,
  MOCK_INSTA_POSTS,
  MOCK_RECENT_PRODUCTS,
  MOCK_SEASON_EVENTS,
} from "@/mocks/data";

/**
 * 메인 홈. dimo_mockup_v2.html body 구조 그대로:
 *   PromoStrip + AppBar + TopTabs (layout) →
 *   Hero (gen-banner + cta-banner) →
 *   IconMenu (9) →
 *   SeasonEvents (4) →
 *   CouponBand →
 *   PopularProducts (6) →
 *   InstagramSection →
 *   RecentlyViewedFloat (fixed) →
 *   Footer (layout)
 */
export default function HomePage() {
  return (
    <>
      <div className="app-wrap">
        <HeroSection />
        <CategoryIcons categories={MOCK_ICON_CATEGORIES} />
        <SeasonEvents events={MOCK_SEASON_EVENTS} />
        <CouponBand />
        <PopularProducts />
        <InstagramSection posts={MOCK_INSTA_POSTS} />
      </div>

      <RecentlyViewedFloat initialItems={MOCK_RECENT_PRODUCTS} />
    </>
  );
}
