"use client";

import { useState } from "react";
import { asset, type SceneAsset } from "@/room0/assets";

/* PHYSICAL SPACE 렌더 레이어.
   - 장면은 이미지 한 장이다. 코드는 그 위에 조명 / 노이즈 / hotspot 만 얹는다.
   - 이미지가 아직 없으면 기존 SVG 플레이스홀더로 대체하고 TODO 를 표시한다.
   - 박스가 이미지 비율을 그대로 쓰므로 hotspot 좌표(%)가 어느 화면에서든 그림과 정확히 일치하고,
     핵심 오브젝트가 crop 으로 잘리지 않는다. */

type State = "loading" | "ready" | "missing";

export function SceneImage({
  scene,
  fallback,
  children,
  overlay,
  className,
  grade = true,
}: {
  scene: SceneAsset;
  /** 에셋 파일이 없을 때 그릴 임시 장면 */
  fallback?: React.ReactNode;
  /** hotspot 등 이미지 위에 놓이는 요소 */
  children?: React.ReactNode;
  /** 조명/노이즈보다 아래에 깔리는 오버레이 (예: CCTV 벽 패치) */
  overlay?: React.ReactNode;
  className?: string;
  grade?: boolean;
}) {
  const [state, setState] = useState<State>("loading");

  return (
    <div
      className={`r0-ps${className ? ` ${className}` : ""}`}
      data-state={state}
      style={{ ["--ar" as string]: String(scene.ratio) }}
    >
      <div className="r0-ps__box">
        {state !== "missing" && (
          <img
            className="r0-ps__img"
            src={asset(scene.file)}
            alt=""
            draggable={false}
            decoding="async"
            onLoad={() => setState("ready")}
            onError={() => setState("missing")}
          />
        )}
        {state === "missing" && fallback}
        {overlay}
        {grade && <div className="r0-ps__grade" aria-hidden />}
        {grade && <div className="r0-ps__grain" aria-hidden />}
        {children}
        {state === "missing" && (
          <p className="r0-ps__todo">TODO ASSET — {scene.file}</p>
        )}
      </div>
    </div>
  );
}

/* 장면 안의 터치 영역. 좌표는 이미지 기준 % 이고, 버튼처럼 보이지 않는다. */
export function Hotspot({
  x,
  y,
  w,
  h,
  label,
  onActivate,
  seen,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  onActivate: () => void;
  seen?: boolean;
}) {
  return (
    <button
      type="button"
      className="r0-hs"
      data-seen={seen ? "true" : undefined}
      aria-label={label}
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
      onClick={onActivate}
    />
  );
}

/** 같은 이미지의 다른 부분을 잘라 덮는 패치. (예: 04:17 이 아닐 때 504 문을 가리는 벽면) */
export function patchStyle(
  scene: SceneAsset,
  target: { x: number; y: number; w: number; h: number },
  source: { x: number; y: number },
): React.CSSProperties {
  const px = (100 * source.x) / (100 - target.w);
  const py = (100 * source.y) / (100 - target.h);
  return {
    left: `${target.x}%`,
    top: `${target.y}%`,
    width: `${target.w}%`,
    height: `${target.h}%`,
    backgroundImage: `url(${asset(scene.file)})`,
    backgroundSize: `${(100 / target.w) * 100}% ${(100 / target.h) * 100}%`,
    backgroundPosition: `${px}% ${py}%`,
  };
}
