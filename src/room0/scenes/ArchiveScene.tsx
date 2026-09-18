"use client";

import { useState } from "react";
import { useGame } from "@/room0/state/GameProvider";
import { SCENE_ASSETS } from "@/room0/assets";
import { Hotspot, SceneImage } from "@/room0/components/SceneImage";
import {
  AUDIT_DATES,
  AUDIT_MONTHS,
  AUDIT_YEARS,
  INDEX_SNAPSHOTS,
  auditDay,
  auditKey,
  type AuditEntry,
} from "@/room0/data/audit";

/* NIGHT AUDIT ARCHIVE — 프런트 뒤 보관 서랍에서 꺼내는 오래된 영업 기록.
   서랍(PHYSICAL)이 색인이고, 꺼낸 기록(SYSTEM)이 그날 밤의 감사 로그다.
   날짜를 입력받지 않는다. 연도 → 월 → 일 을 실제로 넘겨서 찾는다. */

type View = null | "index" | "day" | "entry" | "sheet";

export function ArchiveScene({ onClose }: { onClose: () => void }) {
  const { game, dispatch, fx } = useGame();
  const [view, setView] = useState<View>("index");
  const [year, setYear] = useState<string | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [entry, setEntry] = useState<AuditEntry | null>(null);

  const key = year && month && date ? auditKey(year, month, date) : null;
  const day = year && month && date ? auditDay(year, month, date) : null;
  const isTheNight = key === "1987-OCT-17";

  const openDate = (d: string) => {
    if (!year || !month) return;
    fx("tap", "touch");
    setDate(d);
    setView("day");
    dispatch({ type: "archive/openDate", date: auditKey(year, month, d) });
  };

  const openEntry = (e: AuditEntry) => {
    fx("tap", "touch");
    setEntry(e);
    if (e.detail === "rebuild") {
      fx("reveal", "clue");
      dispatch({ type: "archive/rebuild" });
      setView("entry");
      return;
    }
    if (e.detail === "snap0212" || e.detail === "snap0214") {
      dispatch({ type: "archive/snapshot", at: e.detail === "snap0212" ? "0212" : "0214" });
      setView("entry");
      return;
    }
    dispatch({ type: "archive/entry", id: `audit-${key}-${e.time}`, log: e.note ?? e.label });
  };

  return (
    <div className="r0-detail" role="dialog" aria-modal="true" aria-label="야간 감사 기록">
      <div className="r0-detail__scrim" onClick={onClose} />
      <div className="r0-detail__stage r0-detail__stage--wide">
        {/* ── 서랍 / 색인 ─────────────────────────────────── */}
        {view === "index" && (
          <>
            <div className="r0-arch">
              <SceneImage
                scene={SCENE_ASSETS.drawer}
                className="r0-ps--inline"
                fallback={<div className="r0-ps__blank" aria-hidden />}
              />
            </div>

            <div className="r0-doc">
              <header className="r0-doc__head">
                <span>LEGACY PROPERTY ARCHIVE</span>
                <span className="r0-doc__sub">1984 — 1992</span>
              </header>

              <div className="r0-arch__pick">
                <span className="r0-arch__label">YEAR</span>
                <div className="r0-arch__row">
                  {AUDIT_YEARS.map((y) => (
                    <button
                      key={y}
                      type="button"
                      className="r0-arch__chip"
                      data-on={year === y ? "true" : undefined}
                      onClick={() => { fx("tap", "touch"); setYear(y); setMonth(null); setDate(null); }}
                    >
                      {y}
                    </button>
                  ))}
                </div>

                {year && (
                  <>
                    <span className="r0-arch__label">MONTH</span>
                    <div className="r0-arch__row">
                      {AUDIT_MONTHS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          className="r0-arch__chip"
                          data-on={month === m ? "true" : undefined}
                          onClick={() => { fx("tap", "touch"); setMonth(m); setDate(null); }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {year && month && (
                  <>
                    <span className="r0-arch__label">DATE INDEX</span>
                    <div className="r0-arch__row">
                      {AUDIT_DATES.map((d) => (
                        <button
                          key={d}
                          type="button"
                          className="r0-arch__chip"
                          data-seen={game.auditDatesOpened.includes(auditKey(year, month, d)) ? "true" : undefined}
                          onClick={() => openDate(d)}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <button type="button" className="r0-detail__close" onClick={onClose}>
              CLOSE DRAWER
            </button>
          </>
        )}

        {/* ── 하루치 감사 기록 ────────────────────────────── */}
        {view === "day" && day && (
          <>
            <div className="r0-doc">
              <header className="r0-doc__head">
                <span>NIGHT AUDIT</span>
                <span className="r0-doc__sub">{key?.replace(/-/g, " ")}</span>
              </header>

              <div className="r0-audit__summary">
                <p>
                  <span>OCCUPANCY</span>
                  {day.occupancy}
                </p>
                <p>
                  <span>ROOMS IN SERVICE</span>
                  {day.inService}
                </p>
                <p>
                  <span>NIGHT AUDIT</span>
                  {day.closed}
                </p>
              </div>

              {day.entries ? (
                <ul className="r0-doc__rows">
                  {day.entries.map((e) => (
                    <li key={e.time}>
                      <button
                        type="button"
                        className="r0-doc__row"
                        data-seen={game.inspected.includes(`audit-${key}-${e.time}`) ? "true" : undefined}
                        onClick={() => openEntry(e)}
                      >
                        <span className="r0-doc__no r0-doc__no--time">{e.time}</span>
                        <span className="r0-doc__state">{e.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="r0-doc__foot">
                  ENTRY LOG NOT RETAINED FOR THIS DATE. SUMMARY ONLY.
                </p>
              )}

              {isTheNight && game.entry0213Seen && (
                <button
                  type="button"
                  className="r0-doc__take"
                  onClick={() => { fx("tap", "touch"); setView("sheet"); }}
                >
                  {game.auditSheetFound ? "PRINTED COPY — ON RECORD" : "PULL THE PRINTED COPY"}
                </button>
              )}
            </div>
            <button type="button" className="r0-detail__close" onClick={() => { fx("tap", "touch"); setView("index"); }}>
              BACK TO INDEX
            </button>
          </>
        )}

        {/* ── 기록 한 줄의 상세 ───────────────────────────── */}
        {view === "entry" && entry && (
          <>
            <div className="r0-doc">
              <header className="r0-doc__head">
                <span>{entry.time}</span>
                <span className="r0-doc__sub">{entry.label}</span>
              </header>

              {entry.detail === "rebuild" && (
                <dl className="r0-field">
                  <div>
                    <dt>SOURCE</dt>
                    <dd data-redacted={game.auditSheetFound ? undefined : "true"}>
                      {game.auditSheetFound ? "MGR-01" : "▨▨▨-▨▨"}
                    </dd>
                  </div>
                  <div>
                    <dt>SECTOR</dt>
                    <dd>5W</dd>
                  </div>
                  <div>
                    <dt>OFFSET</dt>
                    <dd>0504</dd>
                  </div>
                  <div>
                    <dt>PREVIOUS INDEX</dt>
                    <dd>68 UNITS</dd>
                  </div>
                  <div>
                    <dt>RESULT</dt>
                    <dd>67 UNITS</dd>
                  </div>
                  <div>
                    <dt>STATUS</dt>
                    <dd>COMMITTED</dd>
                  </div>
                  {!game.auditSheetFound && (
                    <p className="r0-field__note">DIGITAL COPY INCOMPLETE — SOURCE FIELD NOT SCANNED.</p>
                  )}
                </dl>
              )}

              {(entry.detail === "snap0212" || entry.detail === "snap0214") && (
                <div className="r0-snap">
                  <p className="r0-snap__head">5F WEST</p>
                  <div className="r0-snap__rooms">
                    {INDEX_SNAPSHOTS[entry.detail].rooms.map((r) => (
                      <span key={r}>{r}</span>
                    ))}
                  </div>
                  <p className="r0-snap__total">
                    <span>TOTAL PROPERTY INDEX</span>
                    {INDEX_SNAPSHOTS[entry.detail].total}
                  </p>
                </div>
              )}
            </div>
            <button type="button" className="r0-detail__close" onClick={() => { fx("tap", "touch"); setView("day"); }}>
              BACK TO AUDIT
            </button>
          </>
        )}

        {/* ── 출력물 (PHYSICAL) ───────────────────────────── */}
        {view === "sheet" && (
          <>
            <div className="r0-sheetshot">
              <SceneImage
                scene={SCENE_ASSETS.auditSheet}
                className="r0-ps--inline"
                fallback={<div className="r0-ps__blank" aria-hidden />}
              >
                <span className="r0-sheetshot__line">02:13 PROPERTY INDEX REBUILD</span>
                <span className="r0-sheetshot__src">SOURCE MGR-01</span>
                <span className="r0-sheetshot__hand">M-01</span>
                <Hotspot
                  x={18}
                  y={38}
                  w={64}
                  h={26}
                  label="출력물의 SOURCE 칸"
                  seen={game.auditSheetFound}
                  onActivate={() => {
                    fx("reveal", "clue");
                    dispatch({ type: "archive/sheet" });
                  }}
                />
              </SceneImage>
            </div>
            <p className="r0-detail__hint">
              {game.auditSheetFound
                ? "인쇄된 값 옆에 같은 값이 손으로 한 번 더 적혀 있다."
                : "디지털 사본에서 빠진 줄이 여기에는 찍혀 있다."}
            </p>
            <button type="button" className="r0-detail__close" onClick={() => { fx("tap", "touch"); setView("day"); }}>
              PUT IT BACK
            </button>
          </>
        )}
      </div>
    </div>
  );
}
