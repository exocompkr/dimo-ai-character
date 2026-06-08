import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind 클래스를 조건부로 합치고 충돌을 자동 해결합니다.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
