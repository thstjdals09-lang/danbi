import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getPersona } from "@/content/personas";
import { IdentityForm } from "./IdentityForm";

export default async function HandlePage() {
  const user = await requireUser();
  const persona = getPersona(user.personaId);
  if (!persona) redirect("/onboarding/persona");
  if (user.handle) redirect("/");

  return (
    <div className="stack">
      <div>
        <p className="eyebrow">{persona.title}</p>
        <h1>플레이어 이름을 정하세요</h1>
        <p className="muted">공개 ID는 나의 공개 프로필 주소가 됩니다. 나중에 Instagram bio 등에 걸 수 있어요.</p>
      </div>
      <IdentityForm />
    </div>
  );
}
