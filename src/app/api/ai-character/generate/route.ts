import { NextRequest, NextResponse } from "next/server";
import { PNG } from "pngjs";
import type { CharacterStyle } from "@/types/character-style";
import characterStylesData from "@/data/character-styles.json";

// Vercel 서버리스 함수 최대 실행 시간 (초). OpenAI 이미지 생성은 20~60s 소요.
// Hobby 플랜 한도는 60s, Pro 플랜은 300s 까지 가능.
export const maxDuration = 60;

// JSON에서 스타일 데이터 로드
const CHARACTER_STYLES: CharacterStyle[] = characterStylesData.styles;

// 지원하는 OpenAI 이미지 모델
type OpenAIImageModel =
  | "gpt-image-2"
  | "gpt-image-1.5"
  | "gpt-image-1"
  | "gpt-image-1-mini";

// 기본 모델 (빠른 속도)
const DEFAULT_MODEL: OpenAIImageModel = "gpt-image-1.5";

// 깔끔한 이미지 생성을 위한 suffix (크로마키 그린 배경 - 캐릭터 내 흰색 보존)
const BASE_SUFFIX =
  ", isolated subject only, no shadow, no particles, no floor, no decorations, no additional elements, nothing else, clean edges, solid bright green chroma key background (#00FF00)";

/**
 * 스타일 ID로 프롬프트 조회
 */
function getStylePrompt(styleId: string): string | undefined {
  const style = CHARACTER_STYLES.find((s) => s.id === styleId);
  return style?.prompt;
}

/**
 * Data URL을 Blob으로 변환
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mimeType });
}

/**
 * 이미지 역할을 명시하는 프롬프트 프리픽스 생성
 */
function buildImageRolePrefix(
  subjectCount: number,
  styleCount: number
): string {
  const parts: string[] = [];

  if (subjectCount > 0 && styleCount > 0) {
    parts.push(
      `[Image roles: The first ${subjectCount === 1 ? "image is" : `${subjectCount} images are`} the SUBJECT (real photo to transform).`
    );
    parts.push(
      `The ${styleCount === 1 ? "next image is" : `next ${styleCount} images are`} STYLE REFERENCES (artistic style to apply).]`
    );
    parts.push(
      "Transform the subject image(s) using the exact artistic style from the style reference image(s)."
    );
  } else if (subjectCount > 0) {
    parts.push(
      `[Image role: The provided ${subjectCount === 1 ? "image is" : "images are"} the SUBJECT (real photo to transform).]`
    );
    parts.push("Transform this subject image.");
  }

  return parts.join(" ");
}

interface OpenAIResponse {
  data: Array<{
    url?: string;
    b64_json?: string;
  }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
  error?: {
    message: string;
    type: string;
    code: string;
  };
}

/**
 * URL에서 이미지를 다운로드하여 Buffer로 반환
 */
async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`이미지 다운로드 실패: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * 크로마키 그린 배경을 투명으로 변환
 * - 녹색에 가까운 픽셀(G가 높고 R,B가 낮음)을 투명하게
 * - 경계 부분은 부드럽게 처리 (anti-aliasing)
 * - 캐릭터 내부의 흰색은 보존됨
 */
async function removeGreenBackground(imageBuffer: Buffer): Promise<Buffer> {
  // pngjs: 순수 JS PNG 디코더/인코더. Vercel 서버리스 호환 (네이티브 바이너리 X).
  const png = PNG.sync.read(imageBuffer);
  const { width, height, data } = png;

  if (!width || !height) {
    throw new Error("Invalid image dimensions");
  }

  // pngjs.PNG.data 는 RGBA 4채널 Buffer 로 디코드 (alpha 없으면 자동으로 255 추가)
  const pixels = data;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    // 크로마키 그린 감지: G가 높고 R,B가 낮은 경우
    // 순수 녹색 #00FF00 기준
    const isGreen = g > 180 && r < 120 && b < 120;
    const isSoftGreen = g > 150 && r < 150 && b < 150 && g > r && g > b;

    if (isGreen) {
      // 완전 녹색 → 완전 투명
      pixels[i + 3] = 0;
    } else if (isSoftGreen) {
      // 녹색 경계 → 반투명 (부드러운 경계)
      const greenness = Math.min(
        (g - r) / 100,
        (g - b) / 100,
        (g - 150) / 50
      );
      const clampedGreenness = Math.max(0, Math.min(1, greenness));
      const newAlpha = Math.round(pixels[i + 3] * (1 - clampedGreenness * 0.9));
      pixels[i + 3] = newAlpha;
    }
  }

  // pixels 가 png.data 를 직접 참조하므로 그대로 인코딩하면 됨
  return PNG.sync.write(png);
}

/**
 * POST /api/ai-character/generate
 *
 * 업로드된 이미지를 기반으로 AI 캐릭터를 생성합니다.
 * 1. OpenAI의 /v1/images/edits 엔드포인트로 크로마키 그린 배경 캐릭터 생성
 * 2. 후처리로 녹색 배경을 투명으로 변환 (캐릭터 내 흰색 보존)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, styleId, styleImage } = body as {
      image: string;
      styleId: string;
      styleImage?: string; // 스타일 참조 이미지 (base64)
    };

    if (!image || !styleId) {
      return NextResponse.json(
        { error: "이미지와 스타일 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const stylePrompt = getStylePrompt(styleId);
    if (!stylePrompt) {
      return NextResponse.json(
        { error: "유효하지 않은 스타일입니다." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const model = DEFAULT_MODEL;
    const hasStyleImage = !!styleImage;

    // 이미지 역할 프리픽스 + 스타일 프롬프트 + 배경 suffix
    // 스타일 이미지가 있으면 subject 1개 + style 1개
    const imageRolePrefix = buildImageRolePrefix(1, hasStyleImage ? 1 : 0);
    const fullPrompt = imageRolePrefix + " " + stylePrompt + BASE_SUFFIX;

    console.log("Using model:", model);
    console.log("Has style image:", hasStyleImage);
    console.log("Prompt length:", fullPrompt.length);

    // FormData 생성 (multipart/form-data)
    const formData = new FormData();
    formData.append("model", model);
    formData.append("prompt", fullPrompt);
    formData.append("n", "1");
    formData.append("size", "1024x1024");
    formData.append("quality", "high");
    formData.append("output_format", "png");

    // 1. 대상 이미지 추가 (subject - 먼저!)
    const subjectBlob = dataUrlToBlob(image);
    formData.append("image[]", subjectBlob, "subject.png");

    // 2. 스타일 참조 이미지 추가 (style reference - 그 다음)
    if (styleImage) {
      const styleBlob = dataUrlToBlob(styleImage);
      formData.append("image[]", styleBlob, "style.png");
    }

    // OpenAI edits 엔드포인트 호출
    console.log("Calling OpenAI edits API...");
    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API Error:", {
        status: response.status,
        error: errorData,
      });

      const errorMessage =
        errorData.error?.message || `API 오류: ${response.status}`;

      if (response.status === 401) {
        return NextResponse.json(
          { error: "API 인증에 실패했습니다. API 키를 확인해주세요." },
          { status: 401 }
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          {
            error: "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const data: OpenAIResponse = await response.json();

    if (!data.data?.[0]?.url && !data.data?.[0]?.b64_json) {
      return NextResponse.json(
        { error: "이미지 생성 결과가 없습니다." },
        { status: 500 }
      );
    }

    console.log("Image generated, processing background removal...");

    // 이미지 Buffer 얻기
    let imageBuffer: Buffer;
    if (data.data[0].b64_json) {
      imageBuffer = Buffer.from(data.data[0].b64_json, "base64");
    } else {
      imageBuffer = await fetchImageAsBuffer(data.data[0].url!);
    }

    // 크로마키 그린 배경을 투명으로 변환
    const transparentBuffer = await removeGreenBackground(imageBuffer);

    // base64 Data URL로 변환
    const resultImage = `data:image/png;base64,${transparentBuffer.toString("base64")}`;

    console.log("Background removed successfully");

    return NextResponse.json({
      image: resultImage,
      stats: {
        inputTokens: data.usage?.input_tokens,
        outputTokens: data.usage?.output_tokens,
        totalTokens: data.usage?.total_tokens,
      },
    });
  } catch (error) {
    console.error("AI Character Generation Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `캐릭터 생성 중 오류가 발생했습니다: ${errorMessage}` },
      { status: 500 }
    );
  }
}
