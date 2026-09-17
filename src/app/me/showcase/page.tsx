import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth/session";
import { getPlayerSnapshot } from "@/lib/player";
import { CollectionObject } from "@/components/CollectionObject";
import { ShowcaseEditor } from "./ShowcaseEditor";

export const metadata = { title: "My Room — POKER PLAYER GROW" };

/** Collection(가진 모든 것)과 구분되는 Showcase(보여주고 싶은 것) 편집 */
export default async function ShowcasePage() {
  const user = await requireOnboardedUser();
  const player = await getPlayerSnapshot(user);
  if (!player) redirect("/onboarding/handle");

  const owned = player.collection.filter((i) => i.isOwned && i.ownedId !== null);

  return (
    <div className="shell">
      <header className="page-head">
        <div>
          <p className="eyebrow">My room · Showcase</p>
          <h1 className="display page-head__title">What do you show?</h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <p className="meta">
            Collection {owned.length} · Showcase {player.showcase.capacity} slots
          </p>
          <Link href={`/${player.handle}`} className="link" style={{ marginTop: 12 }}>
            View public profile →
          </Link>
        </div>
      </header>

      <section className="section">
        <div className="proofs">
          {player.showcase.slots.map((item, i) =>
            item ? (
              <div key={item.id} className="proof">
                <span className="eyebrow">0{i + 1}</span>
                <CollectionObject item={item} size="md" />
                <span className="proof__name">{item.name}</span>
              </div>
            ) : (
              <div key={`empty-${i}`} className="proof">
                <span className="eyebrow">0{i + 1}</span>
                <span className="proof__empty" style={{ width: 104, height: 116 }} />
                <span className="eyebrow">Empty</span>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="section">
        {owned.length === 0 ? (
          <div className="notice">
            아직 전시할 수집물이 없습니다.{" "}
            <Link href="/exams" className="link">
              첫 증명 시작하기
            </Link>
          </div>
        ) : (
          <ShowcaseEditor
            slots={player.showcase.slots.map((s) => s?.ownedId ?? null)}
            options={owned.map((c) => ({
              id: c.ownedId as number,
              label: `${c.name}${c.grade ? ` — ${c.grade}` : ""} · ${c.type.toUpperCase()}`,
            }))}
          />
        )}
      </section>
    </div>
  );
}
