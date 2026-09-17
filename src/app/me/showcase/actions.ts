"use server";

import { revalidatePath } from "next/cache";
import { requireOnboardedUser } from "@/lib/auth/session";
import { SHOWCASE_SLOTS, saveShowcase } from "@/lib/repo/collection";

export type ShowcaseFormState = { saved?: boolean };

export async function saveShowcaseAction(_prev: ShowcaseFormState, formData: FormData): Promise<ShowcaseFormState> {
  const user = await requireOnboardedUser();
  const ids = Array.from({ length: SHOWCASE_SLOTS }, (_, slot) => {
    const value = Number(formData.get(`slot-${slot}`));
    return Number.isInteger(value) && value > 0 ? value : null;
  });
  saveShowcase(user.id, ids);
  revalidatePath("/me/showcase");
  revalidatePath(`/${user.handle}`);
  return { saved: true };
}
