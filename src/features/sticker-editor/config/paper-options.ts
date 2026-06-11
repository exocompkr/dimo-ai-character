/**
 * 용지 타입 및 크기 옵션 상수
 * 스티커 원단 설정에서 사용
 */

import type { PaperType, SizeOption } from "../types/editor.types";

/**
 * 용지 타입 정의
 * - 백색: 일반 백색 스티커, 모든 크기 지원
 * - 투명: 투명 배경 스티커, 모든 크기 지원
 * - 의류: 패브릭 원단 전용 (의류 크기만)
 * - 판박이: UV DTF 방식 (판박이 크기만)
 */
export const PAPER_TYPES: PaperType[] = [
  {
    id: "white",
    name: "백색",
    description: "선명한 인쇄\n어디에나 잘 어울려요",
    detailDescription: "백색 원단은 색상 재현이 뛰어나고 어떤 물건에도 잘 어울립니다. 가장 범용적인 선택입니다.",
    imageUrl: "/images/paper/white.jpg",
    availableSizes: ["a3", "a4", "mini"],
  },
  {
    id: "transparent",
    name: "투명",
    description: "깔끔함 GOOD!\n밝은 단색 배경 추천",
    detailDescription: "투명 원단은 배경이 비쳐 깔끔한 느낌을 줍니다. 밝은 단색 배경에 붙이면 가장 잘 보입니다. 어두운 배경에 붙이면 잘 보이지 않아요.",
    imageUrl: "/images/paper/transparent.jpg",
    availableSizes: ["a3", "a4", "mini"],
  },
  {
    id: "fabric",
    name: "의류",
    description: "의류와 비슷한 소재의\n패브릭 원단",
    detailDescription: "옷감과 비슷한 질감의 패브릭 원단입니다. 옷이나 가방 등 천 소재에 붙이기 좋습니다.",
    imageUrl: "/images/paper/clothes.jpg",
    availableSizes: ["fabric"],
  },
  {
    id: "transfer",
    name: "판박이",
    description: "글자만 깔끔하게 붙이는\n판박이 방식",
    detailDescription: "UV DTF 방식의 판박이입니다. 글씨나 로고만 깔끔하게 전사됩니다.",
    imageUrl: "/images/paper/uv_dtf.png",
    availableSizes: ["transfer"],
  },
];

/**
 * 크기 옵션 정의
 * 각 크기는 실제 인쇄 가능 영역 (mm)
 */
export const SIZE_OPTIONS: SizeOption[] = [
  { id: "a3", name: "A3", width: 270, height: 420 },
  { id: "a4", name: "A4", width: 220, height: 312 },
  { id: "mini", name: "미니", width: 135, height: 200 },
  { id: "fabric", name: "의류", width: 135, height: 200 },
  { id: "transfer", name: "의류", width: 130, height: 210 },
];

/**
 * 용지 타입 ID로 용지 정보 조회
 */
export function getPaperType(id: string): PaperType | undefined {
  return PAPER_TYPES.find((p) => p.id === id);
}

/**
 * 크기 옵션 ID로 크기 정보 조회
 */
export function getSizeOption(id: string): SizeOption | undefined {
  return SIZE_OPTIONS.find((s) => s.id === id);
}

/**
 * 특정 용지 타입에서 사용 가능한 크기 옵션 목록 반환
 */
export function getAvailableSizes(paperTypeId: string): SizeOption[] {
  const paperType = getPaperType(paperTypeId);
  if (!paperType) return [];

  return paperType.availableSizes
    .map((sizeId) => getSizeOption(sizeId))
    .filter((s): s is SizeOption => s !== undefined);
}
