import type { CSSProperties } from "react";
import type { AvatarState, GearItem } from "@/lib/domain";
import type { GearSlot } from "@/content/gear";
import { AssetSlot } from "./AssetSlot";

type Props = {
  avatar: AvatarState;
  /** 어떤 캐릭터 에셋을 기본 레이어로 쓸지 */
  variant?: "full" | "reveal" | "bust";
  /** 장착 기어를 에디토리얼 주석(callout)으로 표시 */
  showCallouts?: boolean;
  /** 방금 획득해 강조할 기어 id */
  highlight?: string[];
  showStage?: boolean;
  priority?: boolean;
};

/** 부위별 주석 위치 (캐릭터 프레임 기준 %). side: 텍스트가 놓이는 쪽 */
const CALLOUT_POSITION: Record<GearSlot, { top: number; side: "left" | "right" }> = {
  background: { top: 8, side: "right" },
  headgear: { top: 15, side: "left" },
  eyewear: { top: 22, side: "right" },
  headphones: { top: 28, side: "left" },
  tag: { top: 36, side: "right" },
  pin: { top: 43, side: "left" },
  jacket: { top: 50, side: "right" },
  patch: { top: 57, side: "left" },
  bag: { top: 65, side: "right" },
  protector: { top: 76, side: "left" },
};

/** 배경 → 캐릭터 → 기어 오버레이 순으로 쌓는 레이어 순서 */
const LAYER_ORDER: GearSlot[] = ["jacket", "patch", "pin", "tag", "bag", "headphones", "eyewear", "headgear", "protector"];

/**
 * 플레이어 캐릭터. 단일 PNG 가 아니라 AvatarState 를 레이어로 조립한다.
 *   background gear → base persona asset → gear overlays → callouts
 * 오버레이 에셋이 없는 기어도 callout 으로 캐릭터 위에 반영되어, 기어 획득이 항상 눈에 보인다.
 */
export async function PlayerFigure({ avatar, variant = "full", showCallouts = true, highlight = [], showStage = true }: Props) {
  const family = avatar.originPersona.family;
  const base = avatar.assets[variant].src ? avatar.assets[variant] : avatar.assets.full;
  const background = avatar.equippedGear.find((g) => g.slot === "background");
  const layers = avatar.equippedGear
    .filter((g) => g.slot !== "background" && g.overlay.src)
    .sort((a, b) => LAYER_ORDER.indexOf(a.slot) - LAYER_ORDER.indexOf(b.slot));

  return (
    <div className="figure" style={{ "--accent": family.accent } as CSSProperties}>
      <div className="figure__frame">
        {background?.icon.src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="figure__layer" src={background.icon.src} alt="" aria-hidden />
        )}
        <AssetSlot asset={base} alt={`${family.name} — ${avatar.currentIdentity.name}`} mark={family.name} label={`${variant.toUpperCase()} · ${family.name}`} />
        {layers.map((g) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={g.id} className="figure__layer" src={g.overlay.src as string} alt="" aria-hidden />
        ))}
      </div>

      {showStage && <div className="figure__stage">{avatar.careerStage.name}</div>}

      {showCallouts && avatar.equippedGear.length > 0 && (
        <div className="callouts">
          {avatar.equippedGear.map((g, i) => (
            <Callout key={g.id} gear={g} isNew={highlight.includes(g.id)} delay={i * 0.12} />
          ))}
        </div>
      )}
      <div className="figure__accent" />
    </div>
  );
}

function Callout({ gear, isNew, delay }: { gear: GearItem; isNew: boolean; delay: number }) {
  const pos = CALLOUT_POSITION[gear.slot];
  const style: CSSProperties = {
    top: `${pos.top}%`,
    [pos.side === "left" ? "left" : "right"]: "5%",
    animationDelay: `${delay}s`,
  };
  return (
    <div
      className={`callout${pos.side === "left" ? " callout--flip" : ""}${isNew ? " callout--new" : ""}`}
      style={style}
      data-new={isNew || undefined}
    >
      <span className="callout__dot" />
      <span className="callout__line" />
      <span className="callout__text">
        {gear.name}
        <small>{isNew ? `NEW · ${gear.slotLabel}` : gear.slotLabel}</small>
      </span>
    </div>
  );
}
