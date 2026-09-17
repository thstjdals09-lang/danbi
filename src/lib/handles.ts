/** 공개 프로필 URL(서비스/handle)에 쓰이므로 라우트 이름과 겹치면 안 된다. */
export const RESERVED_HANDLES = new Set([
  "login", "signup", "logout", "onboarding", "exams", "exam", "academy", "me", "dev",
  "api", "admin", "settings", "profile", "images", "assets", "static", "_next",
  "favicon.ico", "robots.txt", "danbi", "support", "help",
  "collection", "community", "play", "home", "players", "showcase", "stats", "season", "shop",
]);

export const HANDLE_PATTERN = /^[a-z0-9_]{3,20}$/;

export function validateHandle(raw: string): string | null {
  const handle = raw.trim().toLowerCase();
  if (!HANDLE_PATTERN.test(handle)) return "공개 ID는 영문 소문자, 숫자, _ 로 3~20자여야 합니다.";
  if (RESERVED_HANDLES.has(handle)) return "사용할 수 없는 ID입니다.";
  return null;
}

export function validateNickname(raw: string): string | null {
  const nickname = raw.trim();
  if (nickname.length < 2 || nickname.length > 16) return "닉네임은 2~16자여야 합니다.";
  return null;
}
