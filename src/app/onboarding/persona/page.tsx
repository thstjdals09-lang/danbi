import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { PERSONA_AXES } from "@/content/personas";
import { PersonaTest } from "./PersonaTest";

export default async function PersonaTestPage() {
  const user = await requireUser();
  if (user.personaId) redirect(user.handle ? "/" : "/onboarding/persona/result");

  return (
    <div className="stack">
      <div>
        <p className="eyebrow">Poker Persona Test</p>
        <h1>당신은 어떤 포커 플레이어인가요?</h1>
        <p className="muted">4개의 질문, 30초. 정답은 없습니다.</p>
      </div>
      <PersonaTest axes={PERSONA_AXES} />
    </div>
  );
}
