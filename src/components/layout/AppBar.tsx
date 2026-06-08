"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Sticker, User } from "lucide-react";
import { useCart } from "@/stores/cartStore";
import { useWishlist } from "@/stores/wishlistStore";
import { Logo } from "./Logo";

/**
 * 상단 앱바. 좌측 빈 / 중앙 로고 / 우측 검색·찜·장바구니·마이페이지.
 * 목업 v2 .appbar 구조 그대로.
 */
export function AppBar() {
  const cartCount = useCart((s) => s.itemCount());
  const wishlistCount = useWishlist((s) => s.ids.length);

  return (
    <header className="border-b border-line bg-white">
      <div className="app-wrap grid h-[84px] grid-cols-[1fr_auto_1fr] items-center max-[680px]:h-[60px]">
        <div />

        <Link href="/" className="justify-self-center">
          <Logo height={42} />
        </Link>

        <nav
          className="flex justify-self-end gap-1 max-[680px]:gap-0"
          aria-label="유저 메뉴"
        >
          <IconButton href="/mypage/stickers" label="스티커 관리">
            <Sticker size={21} strokeWidth={1.8} aria-hidden />
          </IconButton>
          <IconButton
            href="/mypage/wishlist"
            label="찜한 상품"
            badge={wishlistCount}
          >
            <Heart size={21} strokeWidth={1.8} aria-hidden />
          </IconButton>
          <IconButton href="/cart" label="장바구니" badge={cartCount}>
            <ShoppingCart size={21} strokeWidth={1.8} aria-hidden />
          </IconButton>
          <IconButton href="/mypage" label="마이페이지">
            <User size={21} strokeWidth={1.8} aria-hidden />
          </IconButton>
        </nav>
      </div>
    </header>
  );
}

interface IconButtonProps {
  href: string;
  label: string;
  badge?: number;
  children: React.ReactNode;
}

function IconButton({ href, label, badge, children }: IconButtonProps) {
  const showBadge = typeof badge === "number" && badge > 0;
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="relative grid size-10 place-items-center rounded-[10px] text-ink transition-colors hover:bg-bg-soft max-[680px]:size-9"
    >
      {children}
      {showBadge && (
        <span className="absolute right-1 top-1 grid h-[15px] min-w-[15px] place-items-center rounded-[8px] bg-accent px-[3px] text-[9px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
