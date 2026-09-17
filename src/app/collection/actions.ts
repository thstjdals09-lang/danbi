"use server";

import { revalidatePath } from "next/cache";
import { requireOnboardedUser } from "@/lib/auth/session";
import { getGear } from "@/content/gear";
import {
  addToShowcase,
  getCollectibleById,
  listCollectibles,
  removeFromShowcase,
  setEquipped,
  type ShowcaseAddResult,
} from "@/lib/repo/collection";

export type ShowcaseActionState = { showcased: boolean; status?: ShowcaseAddResult | "removed" };

function refresh(handle: string | null) {
  revalidatePath("/");
  revalidatePath("/collection");
  revalidatePath("/me/showcase");
  if (handle) revalidatePath(`/${handle}`);
}

/** intent=add: 쇼케이스 첫 빈 슬롯에 전시 / intent=remove: 전시 해제 */
export async function toggleShowcaseAction(prev: ShowcaseActionState, formData: FormData): Promise<ShowcaseActionState> {
  const user = await requireOnboardedUser();
  const collectibleId = Number(formData.get("collectibleId"));

  if (formData.get("intent") === "remove") {
    removeFromShowcase(user.id, collectibleId);
    refresh(user.handle);
    return { showcased: false, status: "removed" };
  }

  const status = addToShowcase(user.id, collectibleId);
  refresh(user.handle);
  return { showcased: status === "added" || status === "already" ? true : prev.showcased, status };
}

/** 기어 장착/해제. 같은 부위에 장착된 다른 기어는 자동으로 해제된다. */
export async function toggleEquipAction(formData: FormData): Promise<void> {
  const user = await requireOnboardedUser();
  const item = getCollectibleById(user.id, Number(formData.get("collectibleId")));
  if (!item || item.kind !== "gear") return;

  if (item.equipped) {
    setEquipped(user.id, [item.id], false);
  } else {
    const slot = getGear(item.key)?.slot;
    const sameSlot = listCollectibles(user.id).filter(
      (c) => c.kind === "gear" && c.equipped && getGear(c.key)?.slot === slot,
    );
    setEquipped(user.id, sameSlot.map((c) => c.id), false);
    setEquipped(user.id, [item.id], true);
  }
  refresh(user.handle);
}
