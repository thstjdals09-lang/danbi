"use client";

import { usePathname } from "next/navigation";

/* ROOM 0 은 전체 화면 장면이므로 danbi 사이트 헤더/푸터를 걷어낸다. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/room0")) return null;
  return <>{children}</>;
}
