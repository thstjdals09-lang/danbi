import type { CSSProperties } from "react";
import type { Certification, CollectionItem } from "@/lib/domain";
import { AssetSlot } from "./AssetSlot";
import { Medal } from "./Medal";

function isCertification(item: CollectionItem): item is Certification {
  return item.type === "certification" && "code" in item;
}

/** 수집물을 "오브젝트"로 그린다: 인증은 메달, 기어/트로피는 에셋 슬롯 */
export async function CollectionObject({ item, size = "md" }: { item: CollectionItem; size?: "sm" | "md" | "lg" }) {
  if (isCertification(item)) {
    return <Medal grade={item.isOwned ? item.grade : null} code={item.code} size={size} image={item.image} />;
  }
  const px = size === "sm" ? 72 : size === "lg" ? 160 : 104;
  return (
    <div className="object-thumb" style={{ width: px, height: px, "--accent": item.accent } as CSSProperties}>
      <AssetSlot asset={item.image} alt={item.name} mark={item.name.slice(0, 1)} label={item.slotLabel ?? item.type} compact contain />
    </div>
  );
}
