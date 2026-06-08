import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

interface StarsProps {
  /** 0 ~ 5 (소수 가능 시 반올림은 호출 측에서) */
  value: number;
  size?: number;
  className?: string;
}

/**
 * 별 5개. value 가 정수가 아니어도 단순히 floor 로 색칠 (반쪽 별 미지원, 1차 단순).
 */
export function Stars({ value, size = 14, className }: StarsProps) {
  const filled = Math.round(value);
  return (
    <span className={cn("inline-flex items-center gap-[1px]", className)} aria-label={`${value} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < filled ? "fill-accent text-accent" : "fill-line text-line"}
          aria-hidden
        />
      ))}
    </span>
  );
}
