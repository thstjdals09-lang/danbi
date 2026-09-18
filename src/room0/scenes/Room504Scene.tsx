"use client";

import { useState } from "react";
import { useGame } from "@/room0/state/GameProvider";
import { SCENE_ASSETS, asset } from "@/room0/assets";
import { Hotspot, SceneImage, patchStyle } from "@/room0/components/SceneImage";

/* ROOM 504 — 한 장의 실제 공간 사진 위에서 조사가 일어난다.
   코드는 방을 그리지 않는다. 터치 영역과 확대 화면만 담당한다.
   좌표는 전부 사진 기준 % 이므로, 최종 아트를 교체할 때 이 파일의 숫자만 맞추면 된다. */

interface Spot {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  log?: string;
}

const SPOTS: Spot[] = [
  {
    id: "window",
    label: "창",
    x: 0, y: 12, w: 12.5, h: 40,
    log: "FIFTH FLOOR. THE COURTYARD BELOW HAS BEEN BRICKED OVER.",
  },
  {
    id: "bed",
    label: "침대",
    x: 2, y: 56, w: 46, h: 16,
    log: "THE BED IS MADE. THE DUST ON IT IS UNDISTURBED.",
  },
  {
    id: "rug",
    label: "카펫",
    x: 3, y: 71, w: 34, h: 10,
    log: "A RECTANGLE OF LESS-FADED CARPET. SOMETHING STOOD HERE. NOT THIS FURNITURE.",
  },
];

/* 사진에 남아 있는 벽시계를 같은 벽지로 덮는다. 그 자리에는 자국만 남는다. */
const CLOCK_PATCH = { x: 72.8, y: 13.2, w: 9.6, h: 14.0 };
const CLOCK_SOURCE = { x: 63.5, y: 13.2 };
/** 덜 바랜 원형 자국 */
const CLOCK_MARK = { x: 76.6, y: 17.9, w: 5.6, h: 4.2 };

export function Room504Scene() {
  const { game, dispatch, fx } = useGame();
  const [photoOpen, setPhotoOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [clockOpen, setClockOpen] = useState(false);

  const inspect = (s: Spot) => {
    fx("tap", "touch");
    if (s.log) dispatch({ type: "room/inspect", id: s.id, log: s.log });
  };

  const openPhoto = () => {
    fx("tap", "clue");
    setFlipped(false);
    setPhotoOpen(true);
    dispatch({ type: "room/photoOpen" });
  };

  const flipPhoto = () => {
    const next = !flipped;
    setFlipped(next);
    if (next && !game.photoBackInspected) {
      fx("reveal", "clue");
      dispatch({ type: "room/photoFlip" });
    } else {
      fx("tap", "touch");
    }
  };

  const tapClock = () => {
    const willFind = game.clockMarkTapCount >= 1 && !game.clockMarkFound;
    if (willFind) fx("reveal", "clue");
    else fx("tap", "touch");
    dispatch({ type: "room/clockTap" });
    if (willFind || game.clockMarkFound) setClockOpen(true);
  };

  const tapPhone = () => {
    fx("deny", "touch");
    dispatch({ type: "room/phone" });
  };

  const leave = () => {
    fx("door", "touch");
    dispatch({ type: "scene/go", scene: "map" });
  };

  return (
    <div className="r0-scene r0-scene--image">
      <SceneImage
        scene={SCENE_ASSETS.room}
        fallback={<div className="r0-ps__blank" aria-hidden />}
        overlay={
          <>
            {/* 시계는 이 방에 없다 */}
            <span className="r0-ps__patch r0-ps__patch--soft" style={patchStyle(SCENE_ASSETS.room, CLOCK_PATCH, CLOCK_SOURCE)} />
            {/* 걸려 있던 자리에 남은 자국 */}
            <span
              className="r0-room__ghost"
              data-seen={game.clockMarkTapCount > 0 ? "true" : undefined}
              style={{
                left: `${CLOCK_MARK.x}%`,
                top: `${CLOCK_MARK.y}%`,
                width: `${CLOCK_MARK.w}%`,
                height: `${CLOCK_MARK.h}%`,
              }}
            />
          </>
        }
      >
        {SPOTS.map((s) => (
          <Hotspot
            key={s.id}
            x={s.x}
            y={s.y}
            w={s.w}
            h={s.h}
            label={s.label}
            seen={game.inspected.includes(s.id)}
            onActivate={() => inspect(s)}
          />
        ))}
        <Hotspot x={28.5} y={23.5} w={11.5} h={11} label="벽에 걸린 액자" seen={game.photoInspected} onActivate={openPhoto} />
        <Hotspot x={72.5} y={14} w={12} h={13} label="빈 벽의 둥근 자국" seen={game.clockMarkFound} onActivate={tapClock} />
        <Hotspot x={9} y={43} w={15} h={13} label="협탁 위 전화기" seen={game.inspected.includes("phone")} onActivate={tapPhone} />
        <Hotspot x={85} y={30} w={14} h={42} label="복도로 나가기" onActivate={leave} />
      </SceneImage>

      {/* 액자 확대 — 실제 인화지처럼 뒤집는다 */}
      {photoOpen && (
        <div className="r0-detail" role="dialog" aria-modal="true" aria-label="사진">
          <div className="r0-detail__scrim" onClick={() => setPhotoOpen(false)} />
          <div className="r0-detail__stage">
            <button
              type="button"
              className={`r0-photo${flipped ? " r0-photo--back" : ""}`}
              onClick={flipPhoto}
              aria-label={flipped ? "사진 앞면 보기" : "사진 뒤집기"}
            >
              <img
                className="r0-photo__face r0-photo__face--front"
                src={asset(SCENE_ASSETS.photoFront.file)}
                alt=""
                draggable={false}
              />
              <img
                className="r0-photo__face r0-photo__face--rear"
                src={asset(SCENE_ASSETS.photoBack.file)}
                alt=""
                draggable={false}
              />
            </button>
            <p className="r0-detail__hint">{flipped ? "PENCIL, ON THE REVERSE." : "TAP TO TURN IT OVER."}</p>
            <button
              type="button"
              className="r0-detail__close"
              onClick={() => {
                fx("tap", "touch");
                setPhotoOpen(false);
              }}
            >
              PUT IT BACK
            </button>
          </div>
        </div>
      )}

      {/* 벽의 자국 확대 */}
      {clockOpen && (
        <div className="r0-detail" role="dialog" aria-modal="true" aria-label="벽의 자국">
          <div className="r0-detail__scrim" onClick={() => setClockOpen(false)} />
          <div className="r0-detail__stage">
            <div className="r0-markshot">
              <img src={asset(SCENE_ASSETS.clockMark.file)} alt="" draggable={false} />
              <span className="r0-markshot__read">02:13</span>
            </div>
            <p className="r0-detail__hint">THE HANDS LEFT THEIR SHADOW. THEY DID NOT MOVE AGAIN.</p>
            <button
              type="button"
              className="r0-detail__close"
              onClick={() => {
                fx("tap", "touch");
                setClockOpen(false);
              }}
            >
              STEP BACK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
