import type { AvatarState } from "@/lib/domain";
import { AssetSlot } from "./AssetSlot";

/** 원형 PFP. pfp 에셋이 없으면 계열 이니셜만 보이는 빈 슬롯 */
export async function Pfp({ avatar, size = 40, name }: { avatar: AvatarState; size?: number; name: string }) {
  const hasAsset = Boolean(avatar.assets.pfp.src);
  return (
    <div className="pfp" style={{ width: size, height: size }}>
      {hasAsset ? (
        <AssetSlot asset={avatar.assets.pfp} alt={`${name} PFP`} />
      ) : (
        <span className="pfp__initial" style={{ fontSize: size * 0.42 }} aria-label={`${name} PFP`}>
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}
    </div>
  );
}
