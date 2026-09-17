const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: FormDataEntryValue | null): string {
  return String(raw ?? "").trim().toLowerCase();
}

export function validateCredentials(email: string, password: string): string | null {
  if (!EMAIL_PATTERN.test(email)) return "올바른 이메일을 입력하세요.";
  if (password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
  return null;
}
