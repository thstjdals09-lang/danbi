import { isDevMode } from "@/lib/config";
import type { ImageRef } from "@/lib/images";

type Props = {
  image: ImageRef;
  alt: string;
  width: number | string;
  height: number | string;
  /** 이미지가 없을 때 슬롯에 표시할 짧은 라벨 */
  label?: string;
};

/** 외부 제작 이미지를 표시한다. 파일이 없으면 빈 슬롯(개발자 모드에서는 필요한 파일 경로)을 보여준다. */
export function ImageSlot({ image, alt, width, height, label }: Props) {
  return (
    <div className="image-slot" style={{ width, height, maxWidth: "100%" }}>
      {image.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image.src} alt={alt} />
      ) : (
        <span>
          {label ?? alt}
          {isDevMode() && (
            <>
              <br />
              <code style={{ color: "var(--dev)", wordBreak: "break-all" }}>{image.expectedPath}</code>
            </>
          )}
        </span>
      )}
    </div>
  );
}
