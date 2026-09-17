import "server-only";

/**
 * 개발자 모드 스위치.
 * 출시할 때는 DANBI_DEV_MODE 를 빼거나 false 로 두면 개발자 모드 버튼과 모든 개발자 기능이 사라진다.
 * 값이 정확히 "true" 일 때만 켜지므로, 설정이 누락되면 안전하게 꺼진 상태가 된다.
 * 켜져 있어도 실제 기능은 DANBI_DEV_PASSWORD 로 잠금 해제해야 사용할 수 있다. (lib/dev.ts)
 */
export function isDevModeEnabled(): boolean {
  return process.env.DANBI_DEV_MODE === "true";
}

export const APP_NAME = "danbi";
export const TAGLINE = "PLAY. PROVE. BECOME.";
