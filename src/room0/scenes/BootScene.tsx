"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/room0/state/GameProvider";

type Line = { text: string; kind?: "head" | "warn" | "gap" | "dim"; pause?: number };

const COLD_BOOT: Line[] = [
  { text: "NULL HOTEL", kind: "head" },
  { text: "PROPERTY MANAGEMENT SYSTEM", kind: "head" },
  { text: "REV 4.11 / TERMINAL 3 / WEST DESK", kind: "dim" },
  { text: "", kind: "gap" },
  { text: "POWER ON SELF TEST .......... OK" },
  { text: "GUEST INDEX ................. PARTIAL" },
  { text: "SURVEILLANCE ARCHIVE ........ MOUNTED" },
  { text: "FLOOR RECORDS ............... RECOVERING", pause: 620 },
  { text: "", kind: "gap" },
  { text: "67 ROOMS FOUND.", pause: 640 },
  { text: "1 ROOM UNACCOUNTED FOR.", pause: 900 },
  { text: "", kind: "gap" },
  { text: "DO NOT ENTER ROOM 504.", kind: "warn", pause: 1700 },
];

const WARM_BOOT: Line[] = [
  { text: "NULL HOTEL", kind: "head" },
  { text: "PROPERTY MANAGEMENT SYSTEM", kind: "head" },
  { text: "REV 4.11 / TERMINAL 3 / WEST DESK", kind: "dim" },
  { text: "", kind: "gap" },
  { text: "SESSION FOUND. RESUMING." },
  { text: "FLOOR RECORD 5F-W ........... LOADED", pause: 600 },
];

export function BootScene() {
  const { dispatch, fx, startAudio, markConnected, reducedMotion, restored, game } = useGame();
  const script = useMemo(() => (restored ? WARM_BOOT : COLD_BOOT), [restored]);
  const [shown, setShown] = useState(reducedMotion ? script.length : 0);
  const [erased, setErased] = useState(false);
  const [ready, setReady] = useState(reducedMotion);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setShown(script.length);
      setErased(!restored);
      setReady(true);
      return;
    }
    if (shown >= script.length) {
      const t = window.setTimeout(() => {
        if (!restored) setErased(true);
        setReady(true);
      }, restored ? 350 : 260);
      return () => window.clearTimeout(t);
    }
    const line = script[shown];
    const delay = line.pause ?? (line.kind === "gap" ? 80 : 130);
    timer.current = window.setTimeout(() => setShown((n) => n + 1), delay);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [shown, script, reducedMotion, restored]);

  const connect = () => {
    startAudio();
    fx("door", "recover");
    markConnected();
    dispatch({ type: "boot/complete" });
  };

  return (
    <div className="r0-boot">
      <div className="r0-boot__crt" aria-hidden />
      <div className="r0-boot__inner">
        <pre className="r0-boot__feed">
          {script.slice(0, shown).map((line, i) => {
            const isWarn = line.kind === "warn";
            return (
              <span
                key={`${line.text}-${i}`}
                className={[
                  "r0-boot__line",
                  line.kind ? `r0-boot__line--${line.kind}` : "",
                  isWarn && erased ? "r0-boot__line--erased" : "",
                ].join(" ")}
              >
                {isWarn && erased ? "LINE CLEARED BY SUPERVISOR" : line.text || " "}
              </span>
            );
          })}
          {erased && !restored && (
            <span className="r0-boot__line r0-boot__line--dim">FLOOR RECORD 5F-W ....... 5 ROOMS ON FILE</span>
          )}
          {restored && (
            <span className="r0-boot__line r0-boot__line--dim">
              RECORDS ON FILE ............. {String(game.evidenceCollected.length).padStart(2, "0")}
            </span>
          )}
        </pre>

        {ready && (
          <button type="button" className="r0-boot__connect" onClick={connect}>
            <span className="r0-boot__prompt" aria-hidden>
              &gt;
            </span>
            {restored ? "RECONNECT" : "CONNECT"}
            <span className="r0-boot__cursor" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
