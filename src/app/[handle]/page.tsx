import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getPublicProfile } from "@/lib/player";
import { seasonOf } from "@/lib/player-rules";
import { PlayerFigure } from "@/components/PlayerFigure";
import { CollectionObject } from "@/components/CollectionObject";
import { GradeGlyph, Stars } from "@/components/Medal";
import { ShareActions } from "@/components/ShareActions";

type Params = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  if (!profile) return { title: "Player not found — POKER PLAYER GROW" };
  const family = profile.avatar.originPersona.family;
  return {
    title: `${profile.nickname} · Lv.${profile.level} ${family.name} — POKER PLAYER GROW`,
    description: `${family.line} ${profile.certifications.filter((c) => c.isOwned).length} certifications.`,
  };
}

/** Player Passport: Instagram bio 에 걸었을 때 "나도 하나 만들고 싶다"가 목표 */
export default async function PublicProfilePage({ params }: Params) {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  if (!profile) notFound();

  const viewer = await getCurrentUser();
  const isOwner = viewer?.id === profile.userId;
  const { avatar } = profile;
  const family = avatar.originPersona.family;
  const certified = profile.certifications.filter((c) => c.isOwned);
  const owned = profile.collection.filter((i) => i.isOwned && i.type !== "avatar");

  return (
    <div style={{ "--accent": family.accent } as CSSProperties}>
      <section className="shell passport">
        <div className="passport__figure">
          <PlayerFigure avatar={avatar} variant="full" />
        </div>

        <div className="passport__id">
          <p className="eyebrow">Player passport · No. {String(profile.userId).padStart(5, "0")}</p>

          <div>
            <h1 className="display passport__name">{profile.nickname}</h1>
            <p className="meta" style={{ marginTop: 14 }}>@{profile.handle}</p>
          </div>

          <div>
            <div className="passport__identity">
              <span className="serif" style={{ fontSize: 28 }}>Lv.{profile.level}</span>
              <span className="passport__family">{family.name}</span>
            </div>
            <p className="quote" style={{ marginTop: 10 }}>{family.line.charAt(0) + family.line.slice(1).toLowerCase()}</p>
          </div>

          <dl className="passport__lineage">
            <dt>Origin</dt>
            <dd>{family.name} · {avatar.originPersona.variant}</dd>
            <dt>Identity</dt>
            <dd>{avatar.currentIdentity.name}</dd>
            <dt>Career</dt>
            <dd>{avatar.careerStage.name}</dd>
            <dt>Since</dt>
            <dd>{seasonOf(profile.joinedAt)}</dd>
          </dl>

          <div className="passport__metrics">
            <div>
              <div className="stat__value">{profile.proofCount}</div>
              <div className="eyebrow stat__label">Proofs</div>
            </div>
            <div>
              <div className="stat__value">{certified.length}</div>
              <div className="eyebrow stat__label">Certifications</div>
            </div>
            <div>
              <div className="stat__value">{owned.length}</div>
              <div className="eyebrow stat__label">Collection</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
            {isOwner ? (
              <Link href="/me/showcase" className="btn btn--sm">Edit my room</Link>
            ) : (
              <Link href="/onboarding/persona" className="btn btn--sm">Create your player</Link>
            )}
            <ShareActions
              title={`${profile.nickname} — POKER PLAYER GROW`}
              text={`${profile.nickname} · Lv.${profile.level} ${family.name}`}
              path={`/${profile.handle}`}
              saveSrc={avatar.assets.pfp.src}
              saveName={`${profile.handle}-pfp`}
            />
          </div>
        </div>
      </section>

      <section className="shell">
        <div className="section">
          <div className="section__head">
            <div>
              <p className="eyebrow">Showcase</p>
              <h2 className="section__title">Featured proofs</h2>
            </div>
            <span className="eyebrow">
              {profile.featuredProofs.length} / {profile.showcase.capacity}
            </span>
          </div>
          <div className="proofs">
            {profile.showcase.slots.map((item, i) =>
              item ? (
                <div key={item.id} className="proof">
                  <CollectionObject item={item} size="sm" />
                  <span className="proof__name">{item.name}</span>
                  <span className="eyebrow">
                    {item.grade ? `${item.grade} · ` : ""}
                    {item.rarity.tier ?? `${item.rarity.ownedPercent}% own`}
                  </span>
                </div>
              ) : (
                <div key={`empty-${i}`} className="proof">
                  <span className="proof__empty" />
                  <span className="eyebrow">Empty</span>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="section" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 48 }}>
          <div>
            <p className="eyebrow">Play style</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
              {profile.playStyle.map((k) => (
                <span key={k} className="tag">{k}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow">Equipped gear</p>
            {avatar.equippedGear.length ? (
              <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0" }}>
                {avatar.equippedGear.map((g) => (
                  <li key={g.id} className="aside-row">
                    <span>{g.slotLabel}</span>
                    <span>{g.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted" style={{ marginTop: 14, fontSize: 13 }}>아직 획득한 기어가 없습니다.</p>
            )}
          </div>
        </div>

        <div className="section" id="skills">
          <div className="section__head">
            <div>
              <p className="eyebrow">Proven skills</p>
              <h2 className="section__title">Skills</h2>
            </div>
          </div>
          <div className="skills">
            {profile.certifications.map((c) => (
              <div key={c.id} className="skill">
                <div>
                  <div style={{ fontWeight: 500 }}>{c.code}</div>
                  <div className="eyebrow" style={{ marginTop: 4 }}>
                    <Stars value={c.difficulty} /> · {c.name}
                  </div>
                </div>
                <GradeGlyph grade={c.isOwned ? c.grade : null} size={38} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
