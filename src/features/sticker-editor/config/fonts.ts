/**
 * 스티커 편집기에서 사용할 수 있는 폰트 목록
 */

export interface FontOption {
  /** 폰트 식별자 (CSS font-family 값) */
  value: string;
  /** 표시 이름 */
  label: string;
  /** 카테고리 */
  category: "sans-serif" | "serif" | "handwriting" | "display";
  /** 미리보기용 가중치 */
  previewWeight?: number;
}

/**
 * 사용 가능한 폰트 목록
 * - Google Fonts에서 로드 (layout.tsx)
 * - Pretendard는 기본 UI 폰트로 CDN에서 로드
 */
export const AVAILABLE_FONTS: FontOption[] = [
  // 산세리프 (Sans-serif)
  {
    value: "Pretendard",
    label: "프리텐다드",
    category: "sans-serif",
  },
  {
    value: "Nanum Gothic",
    label: "나눔고딕",
    category: "sans-serif",
  },

  // 세리프 (Serif)
  {
    value: "Nanum Myeongjo",
    label: "나눔명조",
    category: "serif",
  },

  // 손글씨 (Handwriting)
  {
    value: "Nanum Pen Script",
    label: "나눔펜스크립트",
    category: "handwriting",
  },
  {
    value: "Gamja Flower",
    label: "감자꽃",
    category: "handwriting",
  },
  {
    value: "Gaegu",
    label: "개구",
    category: "handwriting",
  },
  {
    value: "Hi Melody",
    label: "하이멜로디",
    category: "handwriting",
  },
  {
    value: "Dokdo",
    label: "독도",
    category: "handwriting",
  },

  // 디스플레이 (Display)
  {
    value: "Jua",
    label: "주아",
    category: "display",
  },
  {
    value: "Black Han Sans",
    label: "블랙한산스",
    category: "display",
  },
  {
    value: "Do Hyeon",
    label: "도현",
    category: "display",
  },
];

/**
 * 폰트 스타일 옵션
 */
export const FONT_STYLES = [
  { value: "normal", label: "기본" },
  { value: "bold", label: "굵게" },
  { value: "italic", label: "기울임" },
  { value: "bold italic", label: "굵은 기울임" },
] as const;

/**
 * 텍스트 정렬 옵션
 */
export const TEXT_ALIGNS = [
  { value: "left", label: "왼쪽" },
  { value: "center", label: "가운데" },
  { value: "right", label: "오른쪽" },
] as const;

/**
 * 폰트 크기 프리셋
 */
export const FONT_SIZE_PRESETS = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 72];

/**
 * 기본 텍스트 색상 팔레트
 */
export const TEXT_COLORS = [
  "#3f3a38", // ink (기본)
  "#000000", // 검정
  "#ffffff", // 흰색
  "#ff8064", // accent (코랄)
  "#f96a4d", // accent-deep
  "#ffe3ec", // pink
  "#ffd9c6", // peach2
  "#ff6b6b", // 빨강
  "#ffa94d", // 주황
  "#ffd43b", // 노랑
  "#69db7c", // 초록
  "#4dabf7", // 파랑
  "#9775fa", // 보라
];
