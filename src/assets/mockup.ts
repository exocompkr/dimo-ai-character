/**
 * dimo_mockup_v2.html에서 추출한 base64 임베드 이미지 자산 매핑.
 *
 * 파일 위치: public/images/mockup/
 * 라인 번호는 원본 목업 HTML 기준.
 *
 * 추후 디자인 자산 교체 시 이 매핑만 갱신하면 됨.
 */

export const MOCKUP_ASSETS = {
  // ===== 로고 (AppBar + Footer 동일 이미지) =====
  logo: "/images/mockup/line-216-0.png",
  footerLogo: "/images/mockup/line-367-0.png",

  // ===== 히어로 배너 =====
  heroFaces: [
    "/images/mockup/line-250-0.png",
    "/images/mockup/line-250-1.png",
    "/images/mockup/line-250-2.png",
    "/images/mockup/line-250-3.png",
  ] as const,
  heroCharacter: "/images/mockup/line-254-0.png",

  // ===== 시즌 이벤트 =====
  seasonMascot: "/images/mockup/line-288-0.png",
  seasonItems: [
    "/images/mockup/line-290-0.jpg",
    "/images/mockup/line-291-0.jpg",
    "/images/mockup/line-292-0.jpg",
    "/images/mockup/line-293-0.jpg",
  ] as const,

  // ===== 인기 상품 =====
  popularMascot: "/images/mockup/line-313-0.png",
  popularItems: [
    "/images/mockup/line-315-0.jpg",
    "/images/mockup/line-316-0.jpg",
    "/images/mockup/line-317-0.jpg",
    "/images/mockup/line-318-0.jpg",
    "/images/mockup/line-319-0.jpg",
    "/images/mockup/line-320-0.jpg",
  ] as const,

  // ===== 인스타그램 =====
  instaSideMascot: "/images/mockup/line-326-0.png",
  instaAvatar: "/images/mockup/line-329-0.png",
  instaCarousel: [
    "/images/mockup/line-336-0.jpg",
    "/images/mockup/line-337-0.jpg",
    "/images/mockup/line-338-0.jpg",
    "/images/mockup/line-339-0.jpg",
    "/images/mockup/line-340-0.jpg",
    "/images/mockup/line-341-0.jpg",
  ] as const,

  // ===== 최근 본 상품 (3개) =====
  recentItems: [
    "/images/mockup/line-355-0.jpg",
    "/images/mockup/line-356-0.jpg",
    "/images/mockup/line-357-0.jpg",
  ] as const,

  // ===== 푸터 마스코트 =====
  footerMascot: "/images/mockup/line-375-0.png",
} as const;
