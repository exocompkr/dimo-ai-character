import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import type { CharacterStyle } from "@/types/character-style";
import characterStylesData from "@/data/character-styles.json";

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

// 깔끔한 이미지 생성을 위한 suffix (흰 배경)
const BASE_SUFFIX =
  ", isolated subject only, no shadow, no particles, no floor, no decorations, no additional elements, nothing else, clean edges, plain white background";

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
 * 흰색 배경을 투명으로 변환
 * - 흰색에 가까운 픽셀(R,G,B 모두 > threshold)을 투명하게
 * - 경계 부분은 부드럽게 처리 (anti-aliasing)
 */
async function removeWhiteBackground(imageBuffer: Buffer): Promise<Buffer> {
  const image = sharp(imageBuffer);
  const { width, height } = await image.metadata();

  if (!width || !height) {
    throw new Error("Invalid image dimensions");
  }

  // RGBA raw 데이터로 변환
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8ClampedArray(data);

  // 흰색 판단 임계값
  const WHITE_THRESHOLD = 245; // R, G, B 모두 이 값 이상이면 흰색으로 간주
  const SOFT_THRESHOLD = 230; // 이 값 이상이면 반투명 처리

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    // 완전 흰색에 가까운 경우 → 완전 투명
    if (r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD) {
      pixels[i + 3] = 0;
    }
    // 밝은 회색/흰색 경계 → 반투명 (부드러운 경계)
    else if (r >= SOFT_THRESHOLD && g >= SOFT_THRESHOLD && b >= SOFT_THRESHOLD) {
      // 얼마나 흰색에 가까운지 계산 (0~1)
      const whiteness = Math.min(
        (r - SOFT_THRESHOLD) / (WHITE_THRESHOLD - SOFT_THRESHOLD),
        (g - SOFT_THRESHOLD) / (WHITE_THRESHOLD - SOFT_THRESHOLD),
        (b - SOFT_THRESHOLD) / (WHITE_THRESHOLD - SOFT_THRESHOLD)
      );
      // 기존 알파에 whiteness 비율만큼 감소
      const newAlpha = Math.round(pixels[i + 3] * (1 - whiteness * 0.8));
      pixels[i + 3] = newAlpha;
    }
  }

  // 다시 PNG로 변환
  return sharp(Buffer.from(pixels), {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

/**
 * POST /api/ai-character/generate
 *
 * 업로드된 이미지를 기반으로 AI 캐릭터를 생성합니다.
 * 1. OpenAI의 /v1/images/edits 엔드포인트로 흰 배경 캐릭터 생성
 * 2. 후처리로 흰색 배경을 투명으로 변환
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

    // 흰색 배경을 투명으로 변환
    const transparentBuffer = await removeWhiteBackground(imageBuffer);

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
