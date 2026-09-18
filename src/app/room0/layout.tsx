import type { Metadata, Viewport } from "next";
import "@/room0/room0.css";

export const metadata: Metadata = {
  title: "ROOM 0 — NULL HOTEL",
  description: "이 건물에는 존재하지 않는 방이 하나 있다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0b08",
  colorScheme: "dark",
};

export default function Room0Layout({ children }: { children: React.ReactNode }) {
  return children;
}
