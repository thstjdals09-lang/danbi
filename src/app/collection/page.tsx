import type { CSSProperties } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth/session";
import { formatDate, getPlayerSnapshot } from "@/lib/player";
import type { CollectionItem, CollectionType } from "@/lib/domain";
import { personaAsset } from "@/lib/assets";
import { AssetSlot } from "@/components/AssetSlot";
import { CollectionObject } from "@/components/CollectionObject";
import { Stars } from "@/components/Medal";
import { ShowcaseToggle } from "@/components/ShowcaseToggle";
import { toggleEquipAction } from "./actions";

export const metadata = { title: "Collection — POKER PLAYER GROW" };

const TABS: { id: string; label: string; type: CollectionType }[] = [
  { id: "avatars", label: "Avatars", type: "avatar" },
  { id: "certifications", label: "Certifications", type: "certification" },
  { id: "gear", label: "Gear", type: "gear" },
  { id: "trophies", label: "Trophies", type: "trophy" },
  { id: "background", label: "Background", type: "background" },
];

/** Collection = 내가 가진 모든 것 (잠긴 목표 포함). Showcase = 보여주고 싶은 것. */
export default async function CollectionPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireOnboardedUser();
  const player = await getPlayerSnapshot(user);
  if (!player) redirect("/onboarding/handle");

  const { tab = "avatars" } = await searchParams;
  const active = TABS.find((t) => t.id === tab) ?? TABS[0];
  const items = player.collection.filter((i) => i.type === active.type);
  const owned = player.collection.filter((i) => i.isOwned && i.type !== "avatar");
  const total = player.collection.filter((i) => i.type !== "avatar");
  const family = player.avatar.originPersona.family;

  return (
    <div className="shell" style={{ "--accent": family.accent } as CSSProperties}>
      <header className="page-head">
        <div>
          <p className="eyebrow">Avatar system · Collection</p>
          <h1 className="display page-head__title">Collection.</h1>
        </div>
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
          <span className="meta">
            Owned {owned.length} / {total.length} · Showcase {player.showcase.slots.filter(Boolean).length} / {player.showcase.capacity}
          </span>
          <Link href="/me/showcase" className="link">My room →</Link>
        </div>
      </header>

      <nav className="tabs" aria-label="Collection categories">
        {TABS.map((t) => {
          const list = player.collection.filter((i) => i.type === t.type);
          return (
            <Link key={t.id} href={`/collection?tab=${t.id}`} aria-current={t.id === active.id ? "page" : undefined}>
              {t.label}
              <sup>
                {list.filter((i) => i.isOwned).length}/{list.length}
              </sup>
            </Link>
          );
        })}
      </nav>

      {active.type === "avatar" ? (
        <div className="avatars">
          {items.map((item) => (
            <AvatarCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="items">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <p className="notice" style={{ marginTop: 40 }}>
        수집물은 모두 실력으로만 얻습니다. 희귀도(보유율)와 난이도(★)는 서로 다른 값입니다 — 오래돼서 희귀한 것과 어려워서 희귀한 것은 다릅니다.
      </p>
    </div>
  );
}

async function AvatarCard({ item }: { item: CollectionItem }) {
  const familyId = item.id.split(":")[1];
  return (
    <div className={`avatar-card${item.isOwned ? "" : " is-locked"}`} style={{ "--accent": item.accent } as CSSProperties}>
      <div className="avatar-card__head">
        <div className="avatar-card__name" style={{ color: item.isOwned ? "var(--accent)" : undefined }}>{item.name}</div>
        <ul className="keyword-list" style={{ marginTop: 10, gap: 3, fontSize: 9.5 }}>
          {item.description.split(" · ").map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </div>
      <div className="avatar-card__figure">
        <AssetSlot asset={personaAsset(familyId, "bust")} alt={item.name} mark={item.name.replace("THE ", "")} label="Bust" compact />
      </div>
      <div className="avatar-card__foot">
        <p className="eyebrow eyebrow--ink">{item.isOwned ? "Origin · Equipped" : "Locked"}</p>
        <p className="meta" style={{ marginTop: 6, fontSize: 10 }}>
          {item.isOwned ? `Since ${formatDate(item.earnedAt ?? "")}` : item.source} · {item.rarity.ownedPercent}% of players
        </p>
      </div>
    </div>
  );
}

async function ItemCard({ item }: { item: CollectionItem }) {
  return (
    <article className={`item${item.isOwned ? "" : " is-locked"}`}>
      <div className="item__object">
        <CollectionObject item={item} size="lg" />
      </div>
      <div>
        <p className="eyebrow">
          {item.type === "certification" ? item.source : [item.rarity.tier, item.slotLabel].filter(Boolean).join(" · ") || item.source}
        </p>
        <h2 className="item__name" style={{ marginTop: 8 }}>{item.name}</h2>
      </div>
      <dl className="cred-meta">
        {item.grade && (
          <>
            <dt>Grade</dt>
            <dd>{item.grade} Rank</dd>
          </>
        )}
        <dt>Difficulty</dt>
        <dd><Stars value={item.difficulty} /></dd>
        <dt>Rarity</dt>
        <dd>{item.rarity.ownedPercent}% own</dd>
        <dt>{item.isOwned ? "Earned" : "Unlock"}</dt>
        <dd>{item.isOwned ? `${formatDate(item.earnedAt ?? "")} · ${item.season}` : item.source}</dd>
      </dl>
      <div className="item__actions">
        {item.isOwned && item.ownedId !== null ? (
          <>
            {(item.type === "gear" || item.type === "background") && (
              <form action={toggleEquipAction}>
                <input type="hidden" name="collectibleId" value={item.ownedId} />
                <button type="submit" className="link">
                  {item.isEquipped ? "✓ Equipped · Unequip" : "Equip"}
                </button>
              </form>
            )}
            <ShowcaseToggle collectibleId={item.ownedId} isShowcased={item.isShowcased} label="Showcase" />
          </>
        ) : item.type === "certification" ? (
          <Link href={`/exams/${item.id.split(":")[1]}`} className="link">Take exam →</Link>
        ) : (
          <span className="eyebrow">Locked</span>
        )}
      </div>
    </article>
  );
}
