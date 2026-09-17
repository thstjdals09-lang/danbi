import type { CollectibleView } from "@/lib/career";
import { ImageSlot } from "./ImageSlot";
import { GradeBadge } from "./GradeBadge";

export function CollectibleCard({ item }: { item: CollectibleView }) {
  return (
    <div className="card stack" style={{ alignItems: "center", textAlign: "center", gap: 8 }}>
      <ImageSlot image={item.image} alt={item.name} width={88} height={88} />
      <strong>{item.name}</strong>
      {item.kind === "certification" && <GradeBadge grade={item.grade} size={22} />}
      <span className="muted" style={{ fontSize: 12 }}>{item.subtitle}</span>
      <div className="row" style={{ justifyContent: "center", fontSize: 12 }}>
        <span className="pill" title="획득 난이도">{"★".repeat(item.difficulty)}</span>
        <span className="pill" title="희귀도">Owned by {item.rarity}%</span>
      </div>
    </div>
  );
}

export function EmptyShowcaseSlot() {
  return (
    <div className="card" style={{ minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span className="muted">빈 슬롯</span>
    </div>
  );
}
