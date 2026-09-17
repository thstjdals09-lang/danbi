import type { AssetRef } from "@/lib/assets";
import { isDevUnlocked } from "@/lib/dev";

type Props = {
  asset: AssetRef;
  alt: string;
  /** 에셋이 없을 때 슬롯 중앙에 흐리게 표시할 이름 (예: THE SHARK) */
  mark?: string;
  /** 에셋이 없을 때 하단 라벨 (예: PORTRAIT) */
  label?: string;
  compact?: boolean;
  contain?: boolean;
  className?: string;
};

/**
 * 외부 제작 에셋 슬롯. 파일이 있으면 이미지를, 없으면 "자리만 있는" 프레임을 보여준다.
 * 임시 그림을 그려 넣지 않는다 — 빈 슬롯이 최종 디자인으로 굳어지지 않게 하기 위함.
 */
export async function AssetSlot({ asset, alt, mark, label = "ASSET", compact, contain, className }: Props) {
  const showPath = !asset.src && (await isDevUnlocked());
  return (
    <div className={`asset${contain ? " asset--contain" : ""}${className ? ` ${className}` : ""}`}>
      {asset.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset.src} alt={alt} />
      ) : (
        <div className={`asset-slot${compact ? " asset-slot--compact" : ""}`} role="img" aria-label={alt}>
          {mark && <div className="asset-slot__mark">{mark}</div>}
          <div className="asset-slot__foot">
            <span>{label}</span>
            {showPath && <span className="asset-slot__path">{asset.expected}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
