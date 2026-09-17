import type { ReactNode } from "react";
import { personaAsset } from "@/lib/assets";
import { AssetSlot } from "@/components/AssetSlot";

/** 로그인/가입 공통 레이아웃: 좌측 폼, 우측 캐릭터 슬롯 */
export function AuthShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="shell auth">
      <div className="auth__form">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display" style={{ fontSize: "clamp(48px, 5.4vw, 80px)", marginTop: 18 }}>{title}</h1>
        </div>
        {children}
      </div>
      <div className="auth__figure">
        <AssetSlot asset={personaAsset("shark", "full")} alt="Poker player character" mark="PLAYER" label="Hero · Full" />
      </div>
    </section>
  );
}
