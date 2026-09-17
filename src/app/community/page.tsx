import type { CSSProperties } from "react";
import Link from "next/link";
import { listPublicPlayers } from "@/lib/repo/users";
import { listCollectibles } from "@/lib/repo/collection";
import { playerLevel } from "@/lib/player-rules";
import { originPersonaOf, identityOf } from "@/lib/player";
import { personaAsset } from "@/lib/assets";
import { AssetSlot } from "@/components/AssetSlot";

export const metadata = { title: "Community — POKER PLAYER GROW" };

/** 다른 플레이어의 프로필을 발견하는 곳 (Proof Loop: 발견 → 새로운 목표) */
export default async function CommunityPage() {
  const players = listPublicPlayers(60).flatMap((user) => {
    const persona = originPersonaOf(user);
    if (!persona || !user.handle) return [];
    const owned = listCollectibles(user.id);
    return [
      {
        handle: user.handle,
        nickname: user.nickname ?? user.handle,
        persona,
        identity: identityOf(user, persona),
        level: playerLevel(owned),
        certifications: owned.filter((c) => c.kind === "certification").length,
      },
    ];
  });

  return (
    <div className="shell">
      <header className="page-head">
        <div>
          <p className="eyebrow">Community · Players</p>
          <h1 className="display page-head__title">Players.</h1>
        </div>
        <p className="muted" style={{ maxWidth: 340, fontSize: 13.5, lineHeight: 1.8 }}>
          모든 플레이어는 다른 방식으로 강합니다. 누군가의 증명이 당신의 다음 목표가 됩니다.
        </p>
      </header>

      {players.length === 0 ? (
        <p className="notice" style={{ marginTop: 40 }}>
          아직 공개된 플레이어가 없습니다.{" "}
          <Link href="/onboarding/persona" className="link">첫 번째 플레이어 되기</Link>
        </p>
      ) : (
        <div className="players" style={{ borderLeft: "1px solid var(--line)", marginTop: 40 }}>
          {players.map((p) => (
            <Link key={p.handle} href={`/${p.handle}`} className="player-card" style={{ "--accent": p.persona.family.accent } as CSSProperties}>
              <div className="player-card__figure">
                <AssetSlot asset={personaAsset(p.persona.family.id, "bust")} alt={p.nickname} mark={p.persona.family.name.replace("THE ", "")} label="Bust" compact />
              </div>
              <div className="player-card__body">
                <div className="player-card__name">{p.nickname}</div>
                <p className="meta" style={{ marginTop: 6 }}>@{p.handle}</p>
                <p className="eyebrow" style={{ marginTop: 14, color: "var(--accent)" }}>
                  Lv.{p.level} · {p.identity.name}
                </p>
                <p className="eyebrow" style={{ marginTop: 4 }}>{p.certifications} certifications</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
