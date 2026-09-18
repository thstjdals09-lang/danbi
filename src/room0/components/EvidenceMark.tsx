"use client";

import { SCENE_ASSETS, asset } from "@/room0/assets";
import type { EvidenceDef } from "@/room0/state/types";

/* 기록은 출처마다 다르게 생겼다.
   CCTV 는 아카이브 프레임 조각, 평면도는 도면 조각, 사진은 실제 인화지,
   객실 기록은 행정 서류, 벽의 표시는 현장 관찰 메모.
   탐정 보드의 빨간 실 대신, 서류철에 서로 다른 출처가 섞여 있는 느낌을 낸다. */

export function EvidenceMark({ def, locked }: { def: EvidenceDef; locked?: boolean }) {
  if (locked) {
    return (
      <span className="r0-mark r0-mark--locked" aria-hidden>
        <span className="r0-mark__seal">▨</span>
      </span>
    );
  }

  switch (def.kind) {
    case "cctv":
      return (
        <span className="r0-mark r0-mark--cctv" aria-hidden>
          <img src={asset(SCENE_ASSETS.corridor.file)} alt="" draggable={false} />
          <span className="r0-mark__scan" />
          <span className="r0-mark__osd">04:17</span>
        </span>
      );

    case "photo":
      return (
        <span className="r0-mark r0-mark--photo" aria-hidden>
          <img src={asset(SCENE_ASSETS.photoBack.file)} alt="" draggable={false} />
        </span>
      );

    case "plan":
      return (
        <span className="r0-mark r0-mark--plan" aria-hidden>
          <svg viewBox="0 0 40 40">
            <rect x="6" y="4" width="28" height="10" className="r0-mark__room" />
            <rect x="6" y="16" width="28" height="8" className="r0-mark__solid" />
            <rect x="6" y="26" width="28" height="10" className="r0-mark__room" />
            <line x1="3" y1="4" x2="3" y2="36" className="r0-mark__dim" />
          </svg>
        </span>
      );

    case "record":
      return (
        <span className="r0-mark r0-mark--record" aria-hidden>
          <svg viewBox="0 0 40 40">
            <rect x="7" y="5" width="26" height="30" className="r0-mark__paper" />
            <line x1="11" y1="13" x2="29" y2="13" className="r0-mark__rule" />
            <line x1="11" y1="19" x2="29" y2="19" className="r0-mark__rule" />
            <line x1="11" y1="25" x2="24" y2="25" className="r0-mark__rule" />
            <rect x="21" y="27" width="11" height="6" className="r0-mark__stamp" />
          </svg>
        </span>
      );

    case "object":
      return (
        <span className="r0-mark r0-mark--object" aria-hidden>
          <svg viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="12" className="r0-mark__ring" />
            <circle cx="20" cy="20" r="1.6" className="r0-mark__nail" />
          </svg>
        </span>
      );

    case "field":
    default:
      return (
        <span className="r0-mark r0-mark--field" aria-hidden>
          <span className="r0-mark__scratch">{def.code}</span>
        </span>
      );
  }
}
