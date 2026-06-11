/**
 * 스티커 편집기 타입 정의
 */

/** 편집 요소의 기본 타입 */
export type ElementType = "image" | "shape" | "text";

/** 도형 종류 */
export type ShapeType = "rect" | "circle" | "star" | "triangle";

/** 편집기 단계 */
export type EditorStep = "edit" | "cutline" | "complete";

/** 편집 요소 공통 속성 */
interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  name?: string;
}

/** 이미지 요소 */
export interface ImageElement extends BaseElement {
  type: "image";
  src: string; // base64 또는 URL
}

/** 도형 요소 */
export interface ShapeElement extends BaseElement {
  type: "shape";
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

/** 텍스트 요소 */
export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  fontStyle: "normal" | "bold" | "italic" | "bold italic";
  fill: string;
  align: "left" | "center" | "right";
}

/** 모든 편집 요소 유니온 타입 */
export type EditorElement = ImageElement | ShapeElement | TextElement;

/** 새 요소 생성을 위한 입력 타입 (id, zIndex 제외) */
export type NewImageElement = Omit<ImageElement, "id" | "zIndex">;
export type NewShapeElement = Omit<ShapeElement, "id" | "zIndex">;
export type NewTextElement = Omit<TextElement, "id" | "zIndex">;
export type NewEditorElement = NewImageElement | NewShapeElement | NewTextElement;

/** 편집기 히스토리 스냅샷 */
export interface HistorySnapshot {
  elements: EditorElement[];
  selectedIds: string[];
  timestamp: number;
}

/** 칼선 설정 */
export interface CutlineConfig {
  /** 칼선 간격 (mm) */
  offset: number;
  /** 칼선 색상 */
  color: string;
  /** 칼선 두께 */
  strokeWidth: number;
  /** 생성된 SVG 경로 */
  path: string | null;
}

/** 캔버스 설정 */
export interface CanvasConfig {
  /** 캔버스 너비 (px) */
  width: number;
  /** 캔버스 높이 (px) */
  height: number;
  /** 줌 레벨 (1 = 100%) */
  zoom: number;
  /** DPI (dots per inch) */
  dpi: number;
  /** 배경색 */
  backgroundColor: string;
}

/** 정렬 방향 */
export type AlignDirection =
  | "left"
  | "center"
  | "right"
  | "top"
  | "middle"
  | "bottom";

/** 그룹 정보 */
export interface GroupInfo {
  id: string;
  elementIds: string[];
}

/** 편집기 전체 상태 */
export interface StickerEditorState {
  // 캔버스 설정
  canvas: CanvasConfig;

  // 요소
  elements: EditorElement[];
  selectedIds: string[];
  groups: GroupInfo[];

  // 히스토리
  history: HistorySnapshot[];
  historyIndex: number;
  maxHistorySize: number;

  // 칼선
  cutline: CutlineConfig;

  // 편집 단계
  step: EditorStep;

  // 초기 이미지 (AI 캐릭터에서 전달)
  initialImage: string | null;
}

/** 편집기 액션 */
export interface StickerEditorActions {
  // 초기화
  initialize: (image: string) => void;
  reset: () => void;

  // 요소 관리
  addElement: (element: NewEditorElement) => string;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => string | null;

  // 선택
  setSelectedIds: (ids: string[]) => void;
  selectAll: () => void;
  deselectAll: () => void;

  // Z-Index
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;

  // 변형
  flipHorizontal: (id: string) => void;
  flipVertical: (id: string) => void;
  align: (direction: AlignDirection) => void;

  // 그룹
  groupSelected: () => void;
  ungroupSelected: () => void;

  // 히스토리
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // 칼선
  setCutlineOffset: (offset: number) => void;
  setCutlinePath: (path: string) => void;

  // 단계 전환
  setStep: (step: EditorStep) => void;
  goToEdit: () => void;
  goToCutline: () => void;
  goToComplete: () => void;

  // 캔버스
  setZoom: (zoom: number) => void;
}

export type StickerEditorStore = StickerEditorState & StickerEditorActions;
