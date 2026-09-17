"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; match: (path: string) => boolean };

export function SiteNav({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const items: Item[] = [
    signedIn
      ? { href: "/", label: "Home", match: (p) => p === "/" }
      : { href: "/onboarding/persona", label: "Play", match: (p) => p.startsWith("/onboarding") },
    { href: "/exams", label: "Exam", match: (p) => p.startsWith("/exams") },
    { href: "/collection", label: "Collection", match: (p) => p.startsWith("/collection") || p.startsWith("/me") },
    { href: "/community", label: "Community", match: (p) => p.startsWith("/community") },
  ];

  return (
    <nav className="site-nav" aria-label="Main">
      {items.map((item) => (
        <Link key={item.label} href={item.href} aria-current={item.match(pathname) ? "page" : undefined}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
