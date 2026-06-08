import Image from "next/image";
import { MOCKUP_ASSETS } from "@/assets/mockup";

interface LogoProps {
  /** 높이 (px). 기본 42 (목업 AppBar 기준). */
  height?: number;
  /** Footer용 등 다른 소스 사용 시 */
  src?: string;
  alt?: string;
}

/**
 * 디모 로고. 목업에서 추출한 PNG를 사용.
 */
export function Logo({
  height = 42,
  src = MOCKUP_ASSETS.logo,
  alt = "DIMO",
}: LogoProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={Math.round(height * 3)}
      height={height}
      priority
      style={{ height, width: "auto", objectFit: "contain" }}
    />
  );
}
