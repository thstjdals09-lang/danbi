import type { CSSProperties } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getPendingPersona } from "@/lib/onboarding";
import { previewAvatarState } from "@/lib/player";
import { personaAsset } from "@/lib/assets";
import { FAMILIES, FAMILY_ORDER, getPersona } from "@/content/personas";
import { PlayerFigure } from "@/components/PlayerFigure";
import { AssetSlot } from "@/components/AssetSlot";
import { Pfp } from "@/components/Pfp";
import { ShareActions } from "@/components/ShareActions";
import { retakePersonaAction } from "../../actions";

export const metadata = { title: "Your Player — POKER PLAYER GROW" };

/** 제품에서 가장 중요한 장면: "이게 내 포커 플레이어다." */
export default async function PersonaRevealPage() {
  const user = await getCurrentUser();
  const persona = user?.personaId ? getPersona(user.personaId) : await getPendingPersona();
  if (!persona) redirect("/onboarding/persona");

  const avatar = previewAvatarState(persona);
  const family = persona.family;
  const onboarded = Boolean(user?.handle);

  return (
    <div style={{ "--accent": family.accent } as CSSProperties}>
      <section className="shell reveal">
        <div className="reveal__copy">
          <p className="eyebrow">Your player is</p>
          <div>
            <h1 className="display reveal__name">{family.name}</h1>
            <p className="meta" style={{ marginTop: 18 }}>{persona.variant}</p>
          </div>

          <p className="reveal__desc">{family.description}</p>
          <p className="quote">“{family.line}”</p>

          <div className="reveal__actions">
            {onboarded ? (
              <Link href="/" className="btn">
                My player <span className="arrow">→</span>
              </Link>
            ) : (
              <form action="/onboarding/handle" method="get" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <div className="field">
                  <label htmlFor="reveal-name">Set player name</label>
                  <input id="reveal-name" name="nickname" maxLength={16} placeholder="RiverMind" autoComplete="nickname" />
                </div>
                <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                  <button type="submit" className="btn">
                    Continue <span className="arrow">→</span>
                  </button>
                  <button type="submit" formAction={retakePersonaAction} formMethod="post" className="link link--mute">
                    Retake
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="reveal__figure">
          <PlayerFigure avatar={avatar} variant="reveal" showCallouts={false} showStage={false} />

          <ul className="keyword-list reveal__keywords">
            {persona.keywords.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>

          <div className="reveal__side">
            <div className="pfp-preview">
              <span className="eyebrow eyebrow--ink">PFP preview</span>
              <Pfp avatar={avatar} size={72} name={family.name.replace("THE ", "")} />
            </div>
            <ShareActions
              title="POKER PLAYER GROW"
              text={`My poker player is ${family.name}. ${family.line}`}
              saveSrc={avatar.assets.pfp.src}
              saveName={`${family.id}-pfp`}
            />
          </div>
        </div>
      </section>

      <section className="shell">
        <div className="family-strip">
          {FAMILY_ORDER.map((id) => {
            const f = FAMILIES[id];
            const current = id === family.id;
            return (
              <div
                key={id}
                className={`family-strip__item${current ? " is-current" : ""}`}
                style={{ "--accent": f.accent } as CSSProperties}
              >
                <div className="family-strip__thumb">
                  <AssetSlot asset={personaAsset(id, "bust")} alt={f.name} mark={f.name.replace("THE ", "")} label="Bust" compact />
                </div>
                <span className="eyebrow eyebrow--ink">{f.name}</span>
                <span className="eyebrow">{f.keywords.join(" · ")}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
