/**
 * AI 캐릭터 스타일 타입 정의
 */
export interface CharacterStyle {
  /** 고유 ID (예: "cute-cartoon") */
  id: string;
  /** 표시 이름 (예: "귀여운 만화") */
  name: string;
  /** 스타일 설명 */
  description: string;
  /** 미리보기 이미지 경로 */
  previewImage: string;
  /** OpenAI에 전달할 프롬프트 */
  prompt: string;
}

/**
 * character-styles.json의 구조
 */
export interface CharacterStylesData {
  styles: CharacterStyle[];
}
