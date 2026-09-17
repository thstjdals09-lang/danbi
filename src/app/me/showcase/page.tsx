import { requireOnboardedUser } from "@/lib/auth/session";
import { describeCollectibles } from "@/lib/career";
import { SHOWCASE_SLOTS, getShowcase, listCollectibles } from "@/lib/repo/collection";
import { CollectibleCard } from "@/components/CollectibleCard";
import { ShowcaseEditor } from "./ShowcaseEditor";

export default async function ShowcasePage() {
  const user = await requireOnboardedUser();
  const collection = await describeCollectibles(listCollectibles(user.id));
  const slots = getShowcase(user.id).map((c) => c?.id ?? null);

  return (
    <div className="stack">
      <div>
        <p className="eyebrow">Showcase</p>
        <h1>무엇을 가장 자랑하고 싶나요?</h1>
        <p className="muted">
          Collection {collection.length} · Showcase {SHOWCASE_SLOTS} Slots — 선택한 수집물만 공개 프로필에 전시됩니다.
        </p>
      </div>

      {collection.length === 0 ? (
        <div className="card">
          <p className="muted">아직 수집물이 없습니다. Academy에서 첫 인증을 획득하세요.</p>
        </div>
      ) : (
        <ShowcaseEditor
          slots={slots}
          options={collection.map((c) => ({ id: c.id, label: `${c.name}${c.grade ? ` (${c.grade})` : ""}` }))}
        />
      )}

      <section className="stack">
        <h2>Collection</h2>
        <div className="grid">
          {collection.map((item) => (
            <CollectibleCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
