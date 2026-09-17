import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { personaAsset, testFragmentAsset } from "@/lib/assets";
import { FAMILIES, FAMILY_ORDER, PERSONA_AXES } from "@/content/personas";
import { AssetSlot } from "@/components/AssetSlot";
import { PersonaTest } from "./PersonaTest";

export const metadata = { title: "Poker Persona Test — POKER PLAYER GROW" };

/** 가입 전에도 진행할 수 있다. 결과는 로그인 상태면 계정에, 아니면 쿠키에 보관된다. */
export default async function PersonaTestPage() {
  const user = await getCurrentUser();
  if (user?.handle) redirect("/");
  if (user?.personaId) redirect("/onboarding/persona/result");

  const fragments: Record<string, ReactNode> = {};
  for (const axis of PERSONA_AXES) {
    for (const option of axis.options) {
      fragments[`${axis.key}-${option.value}`] = (
        <AssetSlot
          asset={testFragmentAsset(axis.key, option.value)}
          alt={option.title}
          mark={option.value.toUpperCase()}
          label="Fragment"
          compact
        />
      );
    }
  }

  const backdrops: Record<string, ReactNode> = {};
  for (const id of FAMILY_ORDER) {
    backdrops[id] = <AssetSlot asset={personaAsset(id, "reveal")} alt="" mark={FAMILIES[id].name} label="Reveal" />;
  }

  return <PersonaTest axes={PERSONA_AXES} fragments={fragments} backdrops={backdrops} />;
}
