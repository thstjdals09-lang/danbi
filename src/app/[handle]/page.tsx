import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserByHandle } from "@/lib/repo/users";
import { getShowcase, listCollectibles } from "@/lib/repo/collection";
import { careerStage, currentPursuit, describeCollectibles, skillGrades } from "@/lib/career";
import { getPersona } from "@/content/personas";
import { characterImage } from "@/lib/images";
import { ImageSlot } from "@/components/ImageSlot";
import { GradeBadge } from "@/components/GradeBadge";
import { CollectibleCard, EmptyShowcaseSlot } from "@/components/CollectibleCard";

type Params = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const user = getUserByHandle(handle);
  if (!user) return {};
  const persona = getPersona(user.personaId);
  return { title: `${user.nickname} (@${user.handle}) — ${persona?.title ?? "Poker Player"}` };
}

/** 공개 프로필: 성적표보다 캐릭터가 먼저 보인다. */
export default async function PublicProfilePage({ params }: Params) {
  const { handle } = await params;
  const player = getUserByHandle(handle);
  if (!player || !player.personaId) notFound();

  const viewer = await getCurrentUser();
  const isOwner = viewer?.id === player.id;

  const persona = getPersona(player.personaId);
  const origin = getPersona(player.originPersonaId);
  const { stage, certCount } = careerStage(player.id);
  const collection = listCollectibles(player.id);
  const trophyCount = collection.filter((c) => c.kind === "trophy").length;
  const showcase = getShowcase(player.id);
  const showcaseViews = await describeCollectibles(showcase.filter((c) => c !== null));
  const skills = await skillGrades(player.id);
  const pursuit = await currentPursuit(player.id);
  const latest = collection.length
    ? (await describeCollectibles([[...collection].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]]))[0]
    : null;

  return (
    <div className="stack">
      <section className="card row" style={{ alignItems: "flex-start", gap: 24 }}>
        <ImageSlot image={characterImage(player.personaId, stage.id)} alt={player.nickname ?? player.handle ?? ""} width={240} height={320} label="캐릭터" />
        <div className="stack" style={{ flex: 1, minWidth: 240 }}>
          <div>
            <h1 style={{ fontSize: 36 }}>{player.nickname}</h1>
            <p className="muted" style={{ margin: 0 }}>@{player.handle}</p>
          </div>
          <div>
            <p className="eyebrow">{stage.name}</p>
            <h2>{persona?.title}</h2>
            {origin && origin.id !== persona?.id && (
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>Origin · {origin.title}</p>
            )}
          </div>
          <div className="row">
            <span className="pill">{certCount} Certifications</span>
            <span className="pill">{trophyCount} Trophies</span>
          </div>
          {latest && (
            <p style={{ margin: 0 }}>
              <span className="muted">Latest Achievement · </span>
              {latest.name}{latest.grade ? ` ${latest.grade}` : ""}
            </p>
          )}
          {pursuit && (
            <p style={{ margin: 0 }}>
              <span className="muted">Current Pursuit · </span>
              {pursuit.goal}
            </p>
          )}
          {isOwner && (
            <div className="row">
              <Link href="/me/showcase" className="btn">쇼케이스 편집</Link>
            </div>
          )}
        </div>
      </section>

      <section className="stack">
        <h2>Showcase</h2>
        <div className="grid">
          {showcase.map((slot, i) => {
            const view = slot ? showcaseViews.find((v) => v.id === slot.id) : null;
            return view ? <CollectibleCard key={i} item={view} /> : <EmptyShowcaseSlot key={i} />;
          })}
        </div>
      </section>

      <section className="card stack">
        <h2>Skills</h2>
        <table>
          <tbody>
            {skills.map((s) => (
              <tr key={`${s.domain}-${s.skill}`}>
                <td className="muted">{s.domain}</td>
                <td>{s.skill}</td>
                <td style={{ textAlign: "right" }}><GradeBadge grade={s.grade} size={20} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
