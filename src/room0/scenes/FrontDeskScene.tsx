"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/room0/state/GameProvider";
import { SCENE_ASSETS, asset } from "@/room0/assets";
import { Hotspot, SceneImage } from "@/room0/components/SceneImage";
import { roomTone } from "@/room0/fx/audio";
import { ArchiveScene } from "@/room0/scenes/ArchiveScene";

/* FRONT DESK / GF — CASE 01 의 무대.
   실제 프런트 사진 한 장 위에 조사 대상이 놓여 있고,
   열쇠함 · 전화기는 PHYSICAL, 키 기록 · 교환대 배선표는 SYSTEM 으로 펼쳐진다. */

type Panel = null | "keylog" | "cabinet" | "routing" | "phone" | "archive";

/* 오래된 반납 기록. 3317 을 눈에 띄게 배치하지 않는다. */
const KEY_LOG: { id: string; label: string; state: string; odd?: boolean }[] = [
  { id: "k501", label: "501", state: "RETURNED" },
  { id: "k502", label: "502", state: "RETURNED" },
  { id: "k503", label: "503", state: "RETURNED" },
  { id: "k3317", label: "3317", state: "NO PHYSICAL KEY", odd: true },
  { id: "k505", label: "505", state: "RETURNED" },
  { id: "k506", label: "506", state: "RETURNED" },
];

/* 교환대 배선표. 한 줄이 비어 있다. */
const ROUTING: { room: string; ext: string }[] = [
  { room: "501", ext: "3314" },
  { room: "502", ext: "3315" },
  { room: "503", ext: "3316" },
  { room: "", ext: "" },
  { room: "505", ext: "3318" },
  { room: "506", ext: "3319" },
];

/* 열쇠함 사진 위의 고리 위치(%). 가운데가 비어 있다. */
const HOOKS = [
  { id: "h502", number: "502", x: 2.5, y: 26, w: 15.0, h: 43, plateY: 75.8 },
  { id: "h503", number: "503", x: 22.0, y: 26, w: 15.5, h: 43, plateY: 75.8 },
  { id: "hempty", number: "", x: 42.0, y: 26, w: 15.4, h: 43, plateY: 75.8 },
  { id: "h505", number: "505", x: 61.5, y: 26, w: 15.3, h: 43, plateY: 75.8 },
  { id: "h506", number: "506", x: 81.7, y: 26, w: 15.5, h: 43, plateY: 75.8 },
];

/* 전화기 사진의 키패드 영역(%) — 이 영역만 확대해서 실제로 누른다 */
const PAD = { x: 40.5, y: 44.0, w: 27.5, h: 23.5 };
const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["CLR", "0", "CALL"],
];

export function FrontDeskScene() {
  const { game, dispatch, fx } = useGame();
  const [panel, setPanel] = useState<Panel>(null);
  const [entry, setEntry] = useState("");
  const [calling, setCalling] = useState(false);
  const ringTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (ringTimer.current) window.clearTimeout(ringTimer.current);
  }, []);

  const open = (p: Panel, log?: string) => {
    fx("tap", "touch");
    setPanel(p);
    if (p === "keylog") dispatch({ type: "desk/keyLog" });
    if (log) dispatch({ type: "desk/inspect", id: String(p), log });
  };

  const press = (k: string) => {
    if (calling) return;
    if (k === "CLR") {
      fx("tap", "touch");
      setEntry("");
      return;
    }
    if (k === "CALL") {
      if (entry.length < 4) {
        fx("deny", "deny");
        dispatch({ type: "desk/inspect", id: "dial-short", log: "INTERNAL EXTENSIONS ARE FOUR DIGITS." });
        return;
      }
      setCalling(true);
      roomTone.call("ringback");
      fx(null, "touch");
      const num = entry;
      ringTimer.current = window.setTimeout(() => {
        setCalling(false);
        setEntry("");
        if (num === "3317") {
          roomTone.call("distant");
          fx(null, "anomaly");
        } else {
          roomTone.call("disconnect");
        }
        dispatch({ type: "desk/dial", number: num });
      }, 3200);
      return;
    }
    if (entry.length >= 4) return;
    roomTone.dtmf(k);
    fx(null, "touch");
    setEntry(entry + k);
  };

  return (
    <div className="r0-scene r0-scene--image">
      <SceneImage scene={SCENE_ASSETS.desk} fallback={<div className="r0-ps__blank" aria-hidden />}>
        <Hotspot
          x={34} y={24} w={31} h={34}
          label="열쇠 보관함"
          seen={game.cabinetInspected}
          onActivate={() => open("cabinet")}
        />
        <Hotspot
          x={18} y={56} w={28} h={12}
          label="프런트 전화기"
          seen={game.dialed.length > 0}
          onActivate={() => open("phone")}
        />
        <Hotspot
          x={37} y={59.5} w={25} h={9}
          label="열쇠 반납 기록"
          seen={game.keyLogOpened}
          onActivate={() => open("keylog")}
        />
        <Hotspot
          x={59} y={57.5} w={25} h={13}
          label="교환대 카드 색인"
          seen={game.routingInspected}
          onActivate={() => open("routing")}
        />
        <Hotspot
          x={81} y={68} w={15} h={9}
          label="호출 벨"
          onActivate={() =>
            open(null, "THE BELL STILL WORKS. NOBODY COMES.")
          }
        />
        {game.archiveUnlocked && (
          <Hotspot
            x={22} y={74} w={34} h={16}
            label="보관 서랍"
            seen={game.auditDatesOpened.length > 0}
            onActivate={() => open("archive")}
          />
        )}
        {game.phoneRinging && <span className="r0-desk__signal" aria-hidden />}
      </SceneImage>

      {game.phoneRinging && (
        <p className="r0-desk__note" role="status">
          RING SIGNAL DETECTED — SOURCE NOT AT THIS DESK.
        </p>
      )}

      {panel === "archive" && <ArchiveScene onClose={() => setPanel(null)} />}

      {/* ── KEY CONTROL / LEGACY LOG (SYSTEM) ───────────────── */}
      {panel === "keylog" && (
        <div className="r0-detail" role="dialog" aria-modal="true" aria-label="키 컨트롤">
          <div className="r0-detail__scrim" onClick={() => setPanel(null)} />
          <div className="r0-detail__stage r0-detail__stage--wide">
            <div className="r0-doc">
              <header className="r0-doc__head">
                <span>KEY CONTROL</span>
                <span className="r0-doc__sub">LEGACY LOG / 5F</span>
              </header>
              <ul className="r0-doc__rows">
                {KEY_LOG.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      className="r0-doc__row"
                      data-odd={row.odd ? "true" : undefined}
                      onClick={() => {
                        if (row.odd) {
                          fx("deny", "clue");
                          dispatch({ type: "desk/key3317" });
                        } else {
                          fx("tap", "touch");
                          dispatch({
                            type: "desk/inspect",
                            id: `keylog-${row.id}`,
                            log: `KEY ${row.label} — ON FILE. LAST RETURN LOGGED.`,
                          });
                        }
                      }}
                    >
                      <span className="r0-doc__no">{row.label}</span>
                      <span className="r0-doc__state">{row.state}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="r0-doc__foot">RETURNS ONLY. ISSUE RECORDS WERE NOT RETAINED.</p>
            </div>
            <button type="button" className="r0-detail__close" onClick={() => { fx("tap", "touch"); setPanel(null); }}>
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* ── KEY CABINET (PHYSICAL) ──────────────────────────── */}
      {panel === "cabinet" && (
        <div className="r0-detail" role="dialog" aria-modal="true" aria-label="열쇠 보관함">
          <div className="r0-detail__scrim" onClick={() => setPanel(null)} />
          <div className="r0-detail__stage r0-detail__stage--wide">
            <div className="r0-cab">
              <SceneImage
                scene={SCENE_ASSETS.cabinet}
                className="r0-ps--inline"
                fallback={<div className="r0-ps__blank" aria-hidden />}
              >
                {HOOKS.map((h) => (
                  <span key={`p-${h.id}`} className="r0-cab__plate" style={{ left: `${h.x + h.w / 2}%`, top: `${h.plateY}%` }}>
                    {h.number}
                  </span>
                ))}
                {HOOKS.map((h) => (
                  <Hotspot
                    key={h.id}
                    x={h.x}
                    y={h.y}
                    w={h.w}
                    h={h.h}
                    label={h.number ? `${h.number} 열쇠` : "비어 있는 자리"}
                    onActivate={() => {
                      if (!h.number) {
                        fx("reveal", "clue");
                        dispatch({ type: "desk/cabinet" });
                        return;
                      }
                      fx("tap", "touch");
                      dispatch({
                        type: "desk/inspect",
                        id: `hook-${h.id}`,
                        log: `${h.number} — KEY ON HOOK. FOB WORN SMOOTH.`,
                      });
                    }}
                  />
                ))}
              </SceneImage>
            </div>
            <p className="r0-detail__hint">하나의 자리에는 번호판도, 열쇠도 없다.</p>
            <button type="button" className="r0-detail__close" onClick={() => { fx("tap", "touch"); setPanel(null); }}>
              STEP BACK
            </button>
          </div>
        </div>
      )}

      {/* ── SWITCHBOARD ROUTING (SYSTEM) ────────────────────── */}
      {panel === "routing" && (
        <div className="r0-detail" role="dialog" aria-modal="true" aria-label="교환대 배선표">
          <div className="r0-detail__scrim" onClick={() => setPanel(null)} />
          <div className="r0-detail__stage r0-detail__stage--wide">
            <div className="r0-doc r0-doc--routing">
              <header className="r0-doc__head">
                <span>SWITCHBOARD</span>
                <span className="r0-doc__sub">INTERNAL ROUTING / WEST</span>
              </header>
              <table className="r0-route">
                <thead>
                  <tr>
                    <th>ROOM</th>
                    <th>EXT</th>
                  </tr>
                </thead>
                <tbody>
                  {ROUTING.map((r, i) => (
                    <tr key={i} data-blank={r.room ? undefined : "true"}>
                      <td>{r.room || "—"}</td>
                      <td>{r.ext || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                className="r0-doc__take"
                onClick={() => {
                  fx("reveal", "clue");
                  dispatch({ type: "desk/routing" });
                }}
              >
                {game.routingInspected ? "ON RECORD" : "COPY TO RECORD"}
              </button>
            </div>
            <button type="button" className="r0-detail__close" onClick={() => { fx("tap", "touch"); setPanel(null); }}>
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* ── FRONT DESK TELEPHONE (PHYSICAL) ─────────────────── */}
      {panel === "phone" && (
        <div className="r0-detail" role="dialog" aria-modal="true" aria-label="프런트 전화기">
          <div className="r0-detail__scrim" onClick={() => { if (!calling) setPanel(null); }} />
          <div className="r0-detail__stage r0-detail__stage--wide">
            <div className="r0-dial" data-calling={calling ? "true" : undefined}>
              <div
                className="r0-dial__pad"
                style={{
                  backgroundImage: `url(${asset(SCENE_ASSETS.deskPhone.file)})`,
                  backgroundSize: `${(100 / PAD.w) * 100}% ${(100 / PAD.h) * 100}%`,
                  backgroundPosition: `${(100 * PAD.x) / (100 - PAD.w)}% ${(100 * PAD.y) / (100 - PAD.h)}%`,
                }}
              >
                {KEYS.map((row, r) =>
                  row.map((k, c) => (
                    <button
                      key={k}
                      type="button"
                      className="r0-dial__key"
                      data-fn={k.length > 1 ? "true" : undefined}
                      style={{ gridRow: r + 1, gridColumn: c + 1 }}
                      onClick={() => press(k)}
                    >
                      {k}
                    </button>
                  )),
                )}
              </div>
              <div className="r0-dial__window">
                <span className="r0-dial__entry">{calling ? "CALLING" : entry || "————"}</span>
              </div>
            </div>
            <p className="r0-detail__hint">
              {calling ? "RINGBACK ..." : "INTERNAL LINE. FOUR DIGITS."}
            </p>
            <button
              type="button"
              className="r0-detail__close"
              disabled={calling}
              onClick={() => { fx("tap", "touch"); setPanel(null); }}
            >
              PUT IT DOWN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
