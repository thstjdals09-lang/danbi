import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getPersona } from "@/content/personas";
import { GROWTH_STAGES } from "@/content/growth";
import { characterImage, pfpImage } from "@/lib/images";
import { ImageSlot } from "@/components/ImageSlot";
import { retakePersonaAction } from "../../actions";

export default async function PersonaResultPage() {
  const user = await requireUser();
  const persona = getPersona(user.personaId);
  if (!persona) redirect("/onboarding/persona");

  const stage = GROWTH_STAGES[0];

  return (
    <div className="stack" style={{ alignItems: "center", textAlign: "center" }}>
      <p className="eyebrow">Your Starting Persona</p>
      <ImageSlot image={characterImage(persona.id, stage.id)} alt={persona.title} width={280} height={360} label="캐릭터 이미지" />
      <h1>{persona.title}</h1>
      <p className="muted" style={{ maxWidth: 480 }}>{persona.description}</p>

      <div className="card stack" style={{ alignItems: "center" }}>
        <p className="eyebrow">PFP</p>
        <ImageSlot image={pfpImage(persona.id, stage.id)} alt={`${persona.title} PFP`} width={120} height={120} label="PFP" />
        <p className="muted" style={{ fontSize: 13 }}>프로필 사진으로 쓸 수 있는 이미지</p>
      </div>

      {user.handle ? (
        <Link href="/" className="btn btn-primary">홈으로</Link>
      ) : (
        <div className="row" style={{ justifyContent: "center" }}>
          <Link href="/onboarding/handle" className="btn btn-primary">이 플레이어로 시작하기</Link>
          <form action={retakePersonaAction}>
            <button type="submit" className="btn">다시 테스트</button>
          </form>
        </div>
      )}
    </div>
  );
}
