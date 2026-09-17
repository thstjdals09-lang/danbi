import type { CSSProperties } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getPendingPersona } from "@/lib/onboarding";
import { previewAvatarState } from "@/lib/player";
import { getPersona } from "@/content/personas";
import { PlayerFigure } from "@/components/PlayerFigure";
import { IdentityForm } from "./IdentityForm";

export const metadata = { title: "Player Name — POKER PLAYER GROW" };

export default async function HandlePage({ searchParams }: { searchParams: Promise<{ nickname?: string }> }) {
  const user = await getCurrentUser();
  if (user?.handle) redirect("/");
  const persona = user?.personaId ? getPersona(user.personaId) : await getPendingPersona();
  if (!persona) redirect("/onboarding/persona");

  const { nickname = "" } = await searchParams;
  const avatar = previewAvatarState(persona);

  return (
    <section className="shell auth" style={{ "--accent": persona.family.accent } as CSSProperties}>
      <div className="auth__form">
        <div>
          <p className="eyebrow">{persona.family.name} · Player passport</p>
          <h1 className="display" style={{ fontSize: "clamp(44px, 5vw, 72px)", marginTop: 18 }}>
            Name your player.
          </h1>
          <p className="muted" style={{ marginTop: 18, fontSize: 14, lineHeight: 1.8 }}>
            공개 ID는 당신의 플레이어 주소가 됩니다. Instagram bio에 걸어도 좋은 이름으로.
          </p>
        </div>
        <IdentityForm needsAccount={!user} initialNickname={nickname.slice(0, 16)} />
      </div>
      <div className="auth__figure">
        <PlayerFigure avatar={avatar} variant="bust" showCallouts={false} showStage={false} />
      </div>
    </section>
  );
}
