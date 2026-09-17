import { notFound, redirect } from "next/navigation";
import { isDevModeEnabled } from "@/lib/config";
import { isDevUnlocked } from "@/lib/dev";
import { UnlockForm } from "./UnlockForm";

export const dynamic = "force-dynamic";

export default async function DevUnlockPage() {
  if (!isDevModeEnabled()) notFound();
  if (await isDevUnlocked()) redirect("/dev");

  return (
    <div className="stack">
      <div>
        <p className="eyebrow" style={{ color: "var(--dev)" }}>Developer Mode</p>
        <h1>개발자 모드 잠금 해제</h1>
        <p className="muted">개발자 비밀번호를 입력하세요.</p>
      </div>
      <UnlockForm />
    </div>
  );
}
