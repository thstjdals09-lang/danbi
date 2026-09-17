import type { CSSProperties } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getPlayerSnapshot, formatDate } from "@/lib/player";
import { syncEarnedProgress } from "@/lib/progress";
import { countPublicPlayers, getUserById } from "@/lib/repo/users";
import { db } from "@/lib/db";
import { personaAsset } from "@/lib/assets";
import { getExamSource } from "@/lib/exams/registry";
import { GEAR } from "@/content/gear";
import { TROPHIES } from "@/content/trophies";
import { FAMILIES } from "@/content/personas";
import { AssetSlot } from "@/components/AssetSlot";
import { PlayerFigure } from "@/components/PlayerFigure";
import { Pfp } from "@/components/Pfp";
import { GradeGlyph } from "@/components/Medal";

export default async function RootPage() {
  const user = await getCurrentUser();
  if (!user) return <Landing />;
  if (!user.personaId) redirect("/onboarding/persona");
  if (!user.handle) redirect("/onboarding/handle");
  return <MyPlayer userId={user.id} />;
}

/* ---------------------------------------------------------------- Landing */

async function Landing() {
  const exams = await getExamSource().listExams();
  const proofs = (db().prepare("SELECT COUNT(*) AS n FROM exam_attempts").get() as { n: number }).n;
  const hero = FAMILIES.architect;
  const stats = [
    { value: countPublicPlayers(), label: "Players" },
    { value: proofs, label: "Proofs" },
    { value: exams.length + GEAR.length + TROPHIES.length, label: "Collectibles" },
  ];

  return (
    <>
      <section className="shell landing">
        <div className="landing__copy">
          <div>
            <p className="eyebrow">Poker Player Grow</p>
            <h1 className="display landing__title" style={{ marginTop: 28 }}>
              <span>Play.</span>
              <span>Prove.</span>
              <span>Become.</span>
            </h1>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <p className="landing__lede">A stylish digital identity for poker players.</p>
            <p className="landing__kr">
              실력은 캐릭터가 되고,
              <br />
              캐릭터는 새로운 가능성이 된다.
            </p>
            <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/onboarding/persona" className="btn">
                내 플레이어 만들기 <span className="arrow">→</span>
              </Link>
              <Link href="/login" className="link link--mute">Sign in</Link>
            </div>
          </div>

          <div className="landing__stats">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="stat__value">{s.value.toLocaleString()}</div>
                <div className="eyebrow stat__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="landing__figure" style={{ "--accent": hero.accent } as CSSProperties}>
          <AssetSlot asset={personaAsset(hero.id, "full")} alt="Poker player character" mark="PLAYER" label="HERO · FULL" />
          <div className="landing__side-note">
            <p className="eyebrow eyebrow--ink" style={{ lineHeight: 1.9 }}>
              Better players.
              <br />A brighter you.
            </p>
          </div>
        </div>
      </section>

      <section className="shell">
        <div className="loop">
          {[
            ["Persona", "4개의 질문으로 16가지 중 나의 시작 플레이어를 만난다."],
            ["Exam", "실제 테이블 상황을 그대로 옮긴 시험으로 판단을 증명한다."],
            ["Proof", "등급과 인증은 레벨 하나가 아닌, 분야별 실력의 기록이 된다."],
            ["Growth", "인증과 기어가 쌓이며 캐릭터에 커리어의 흔적이 남는다."],
            ["Showcase", "가장 자랑하고 싶은 증명을 골라 나의 공개 프로필에 전시한다."],
          ].map(([name, desc], i) => (
            <div key={name} className="loop__step">
              <div className="loop__num">0{i + 1}</div>
              <div className="loop__name">{name}</div>
              <p className="loop__desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ---------------------------------------------------------------- My Player */

async function MyPlayer({ userId }: { userId: number }) {
  // 콘텐츠 규칙이 추가된 경우를 위해 획득 조건을 한 번 동기화한다 (idempotent).
  const before = getUserById(userId);
  if (!before) redirect("/login");
  syncEarnedProgress(before);
  const user = getUserById(userId)!;

  const player = await getPlayerSnapshot(user);
  if (!player) redirect("/onboarding/handle");

  const { avatar, pursuit, latestProof } = player;
  const family = avatar.originPersona.family;
  const ownedItems = player.collection.filter((i) => i.isOwned && i.type !== "avatar");
  const allItems = player.collection.filter((i) => i.type !== "avatar");
  const certified = player.certifications.filter((c) => c.isOwned).length;
  const filledSlots = player.showcase.slots.filter(Boolean).length;

  const tiles = [
    { label: "Skills", value: `${player.skills.filter((s) => s.grade).length}/${player.skills.length}`, href: `/${player.handle}#skills` },
    { label: "Certifications", value: String(certified), href: "/collection?tab=certifications" },
    { label: "Collection", value: `${ownedItems.length}/${allItems.length}`, href: "/collection" },
    { label: "Stats", value: String(player.proofCount), href: "/me/stats" },
    { label: "My Room", value: `${filledSlots}/${player.showcase.capacity}`, href: "/me/showcase" },
  ];

  return (
    <div style={{ "--accent": family.accent } as CSSProperties}>
      <section className="shell home">
        <div className="home__identity">
          <p className="eyebrow">My Player</p>
          <div>
            <div className="home__level">
              <small>Lv.</small>
              {player.level}
            </div>
            <h1 className="display home__family" style={{ marginTop: 14 }}>
              {family.name}
            </h1>
            {!avatar.currentIdentity.isOrigin && (
              <p className="eyebrow eyebrow--ink" style={{ marginTop: 14 }}>
                Current identity · {avatar.currentIdentity.name}
              </p>
            )}
          </div>

          <div className="home__player">
            <Pfp avatar={avatar} size={40} name={player.nickname} />
            <div>
              <div style={{ fontWeight: 500 }}>{player.nickname}</div>
              <Link href={`/${player.handle}`} className="meta">
                @{player.handle} · View profile
              </Link>
            </div>
          </div>

          <p className="quote">“{family.line.charAt(0) + family.line.slice(1).toLowerCase()}”</p>

          <ul className="keyword-list">
            {avatar.originPersona.keywords.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>

          <div style={{ marginTop: "auto" }}>
            <p className="eyebrow">Career stage</p>
            <p className="serif" style={{ fontSize: 24, marginTop: 6 }}>{avatar.careerStage.name}</p>
          </div>
        </div>

        <div className="home__figure">
          <PlayerFigure avatar={avatar} variant="full" />
        </div>

        <aside className="home__rail">
          <div className="rail-block">
            <p className="eyebrow">Next goal</p>
            {pursuit ? (
              <>
                <p className="rail-block__title">{pursuit.goal}</p>
                <p className="meta" style={{ marginTop: 6 }}>{pursuit.reward}</p>
                <div className="ring" style={{ "--p": pursuit.step / pursuit.steps } as CSSProperties}>
                  <span className="ring__label">
                    {pursuit.step}/{pursuit.steps}
                  </span>
                </div>
                <p className="muted" style={{ fontSize: 12.5, marginTop: 14 }}>
                  최고 {pursuit.bestScore}점 · 다음 등급 {pursuit.targetScore}점
                </p>
                <Link href={`/exams/${pursuit.examId}`} className="btn btn--sm" style={{ marginTop: 18 }}>
                  Take exam <span className="arrow">→</span>
                </Link>
              </>
            ) : (
              <p className="rail-block__title">All proofs complete</p>
            )}
          </div>

          <div className="rail-block">
            <p className="eyebrow">Latest proof</p>
            {latestProof ? (
              <Link href={`/exams/result/${latestProof.attemptId}`} className="proof-line">
                <GradeGlyph grade={latestProof.grade === "F" ? null : latestProof.grade} size={56} />
                <span>
                  <span style={{ display: "block", fontWeight: 500 }}>{latestProof.examTitle}</span>
                  <span className="meta">{formatDate(latestProof.createdAt)} · {latestProof.score}pt</span>
                </span>
              </Link>
            ) : (
              <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>아직 증명이 없습니다.</p>
            )}
          </div>
        </aside>
      </section>

      <nav className="shell" aria-label="Player sections">
        <div className="tiles">
          {tiles.map((t) => (
            <Link key={t.label} href={t.href} className="tile">
              <span>
                <span className="tile__value">{t.value}</span>
                <span className="eyebrow" style={{ display: "block", marginTop: 8 }}>{t.label}</span>
              </span>
              <span className="tile__arrow">→</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
