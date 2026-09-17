import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { isDevModeEnabled } from "@/lib/config";

const COOKIE_NAME = "danbi_dev";
const MAX_FAILURES = 5;
const MAX_GLOBAL_FAILURES = 30;
const GLOBAL_KEY = "*";
const LOCKOUT_MS = 10 * 60 * 1000;

function devPassword(): string | null {
  const value = process.env.DANBI_DEV_PASSWORD;
  return value ? value : null;
}

/** 비밀번호에서 파생한 토큰. 비밀번호를 바꾸면 기존 잠금 해제가 모두 무효가 된다. */
function unlockToken(password: string): string {
  return createHmac("sha256", password).update("danbi-dev-unlock:v1").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** 개발자 모드가 켜져 있고, 이 브라우저가 비밀번호로 잠금 해제했는가. */
export async function isDevUnlocked(): Promise<boolean> {
  const password = devPassword();
  if (!isDevModeEnabled() || !password) return false;
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return Boolean(token && safeEqual(token, unlockToken(password)));
}

/**
 * 모든 개발자 전용 페이지와 서버 액션의 첫 줄에서 호출한다.
 * 개발자 모드가 꺼져 있으면 404, 잠겨 있으면 잠금 해제 화면으로 보낸다.
 */
export async function assertDevAccess(): Promise<void> {
  if (!isDevModeEnabled()) notFound();
  if (!(await isDevUnlocked())) redirect("/dev/unlock");
}

// 비밀번호 대입 방지: 접속 IP 별 실패 횟수 (서버 메모리)
const failures = new Map<string, { count: number; lockedUntil: number }>();

async function clientKey(): Promise<string> {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
}

export type UnlockResult = { ok: true } | { ok: false; error: string };

export async function tryUnlockDev(input: string): Promise<UnlockResult> {
  if (!isDevModeEnabled()) notFound();
  const password = devPassword();
  if (!password) return { ok: false, error: "서버에 DANBI_DEV_PASSWORD 가 설정되지 않았습니다." };

  // IP 헤더는 위조될 수 있으므로 전체 실패 횟수 제한(GLOBAL_KEY)도 함께 건다.
  const keys = [await clientKey(), GLOBAL_KEY];
  for (const key of keys) {
    const record = failures.get(key);
    if (record && record.lockedUntil > Date.now()) {
      const minutes = Math.ceil((record.lockedUntil - Date.now()) / 60000);
      return { ok: false, error: `시도 횟수를 초과했습니다. ${minutes}분 후 다시 시도하세요.` };
    }
  }

  if (!safeEqual(unlockToken(input), unlockToken(password))) {
    for (const key of keys) {
      const record = failures.get(key);
      // 잠금 시간이 지나 풀린 기록은 0 부터 다시 센다.
      const count = (record && record.lockedUntil === 0 ? record.count : 0) + 1;
      const limit = key === GLOBAL_KEY ? MAX_GLOBAL_FAILURES : MAX_FAILURES;
      failures.set(key, { count, lockedUntil: count >= limit ? Date.now() + LOCKOUT_MS : 0 });
    }
    return { ok: false, error: "비밀번호가 올바르지 않습니다." };
  }

  failures.delete(keys[0]);
  (await cookies()).set(COOKIE_NAME, unlockToken(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return { ok: true };
}

export async function lockDev(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
