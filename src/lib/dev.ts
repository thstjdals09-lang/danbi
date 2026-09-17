import "server-only";
import { notFound } from "next/navigation";
import { isDevMode } from "@/lib/config";

/**
 * 모든 개발자 전용 페이지와 서버 액션의 첫 줄에서 호출한다.
 * 개발자 모드가 꺼져 있으면 해당 기능은 존재하지 않는 것(404)처럼 동작한다.
 */
export function assertDevMode(): void {
  if (!isDevMode()) notFound();
}
