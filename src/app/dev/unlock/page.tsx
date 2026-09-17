import { notFound, redirect } from "next/navigation";
import { isDevModeEnabled } from "@/lib/config";
import { isDevUnlocked } from "@/lib/dev";
import { UnlockForm } from "./UnlockForm";

export const dynamic = "force-dynamic";

export default async function DevUnlockPage() {
  if (!isDevModeEnabled()) notFound();
  if (await isDevUnlocked()) redirect("/dev");

  return (
    <div className="shell dev-panel" style={{ maxWidth: 560, marginInline: "auto" }}>
      <div>
        <p className="eyebrow" style={{ color: "var(--dev)" }}>Developer mode</p>
        <h1 className="display" style={{ fontSize: 56, marginTop: 12 }}>Unlock.</h1>
        <p className="muted" style={{ marginTop: 12 }}>개발자 비밀번호를 입력하세요.</p>
      </div>
      <UnlockForm />
    </div>
  );
}
