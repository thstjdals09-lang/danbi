/* NIGHT AUDIT ARCHIVE — 1984 ~ 1992 의 야간 감사 기록.
   주변 날짜에도 실제 기록이 있어야 한다. 그래야 특정 날짜가 정답 버튼처럼 보이지 않는다. */

export const AUDIT_YEARS = ["1986", "1987", "1988"] as const;
export const AUDIT_MONTHS = ["SEP", "OCT", "NOV"] as const;
export const AUDIT_DATES = ["15", "16", "17", "18", "19"] as const;

export interface AuditEntry {
  time: string;
  label: string;
  /** 눌렀을 때의 한 줄. detail 이 있는 항목은 별도 화면으로 간다 */
  note?: string;
  detail?: "rebuild" | "snap0212" | "snap0214";
}

export interface AuditDay {
  /** 표지에 찍히는 값 */
  occupancy: string;
  inService: string;
  closed: string;
  /** 시간별 기록. 없으면 요약만 남은 날이다 */
  entries?: AuditEntry[];
}

/** 1987-OCT-17 — 그날 밤의 기록은 한 줄도 빠지지 않았다 */
const OCT_17_1987: AuditDay = {
  occupancy: "70%",
  /* 표지는 다른 날과 똑같이 마감 수치만 적는다. 변화는 02:12 와 02:14 를 직접 열어야 보인다 */
  inService: "67",
  closed: "COMPLETE",
  entries: [
    { time: "00:00", label: "DAY CLOSE START", note: "DAY CLOSE START — LEDGER LOCKED FOR THE NIGHT." },
    { time: "00:14", label: "GUEST LEDGER COMMIT", note: "GUEST LEDGER COMMIT — 41 FOLIOS WRITTEN." },
    { time: "01:05", label: "HOUSEKEEPING STATUS SYNC", note: "HOUSEKEEPING STATUS SYNC — 68 ROOMS REPORTED." },
    { time: "01:48", label: "PROPERTY INDEX VERIFY", note: "PROPERTY INDEX VERIFY — NO ERRORS RETURNED." },
    { time: "02:12", label: "ROOM INVENTORY", detail: "snap0212" },
    { time: "02:13", label: "PROPERTY INDEX REBUILD", detail: "rebuild" },
    { time: "02:14", label: "ROOM INVENTORY", detail: "snap0214" },
    { time: "02:20", label: "NIGHT AUDIT RESUME", note: "NIGHT AUDIT RESUME — NO OPERATOR NOTE ATTACHED." },
    { time: "03:00", label: "SYSTEM CHECK", note: "SYSTEM CHECK — STORAGE OK. CLOCK OK." },
    { time: "05:30", label: "DAY OPEN", note: "DAY OPEN — DESK HANDOVER SIGNED." },
  ],
};

/* 그 외의 날들. 평범한 영업일이다. */
const ORDINARY: Record<string, AuditDay> = {
  "1987-OCT-15": { occupancy: "74%", inService: "68", closed: "COMPLETE" },
  "1987-OCT-16": { occupancy: "72%", inService: "68", closed: "COMPLETE" },
  "1987-OCT-18": { occupancy: "69%", inService: "67", closed: "COMPLETE" },
  "1987-OCT-19": { occupancy: "71%", inService: "67", closed: "COMPLETE" },
  "1987-SEP-15": { occupancy: "66%", inService: "68", closed: "COMPLETE" },
  "1987-SEP-16": { occupancy: "70%", inService: "68", closed: "COMPLETE" },
  "1987-SEP-17": { occupancy: "73%", inService: "68", closed: "COMPLETE" },
  "1987-SEP-18": { occupancy: "75%", inService: "68", closed: "COMPLETE" },
  "1987-SEP-19": { occupancy: "77%", inService: "68", closed: "COMPLETE" },
  "1987-NOV-15": { occupancy: "58%", inService: "67", closed: "COMPLETE" },
  "1987-NOV-16": { occupancy: "61%", inService: "67", closed: "COMPLETE" },
  "1987-NOV-17": { occupancy: "60%", inService: "67", closed: "COMPLETE" },
  "1987-NOV-18": { occupancy: "63%", inService: "67", closed: "COMPLETE" },
  "1987-NOV-19": { occupancy: "59%", inService: "67", closed: "COMPLETE" },
};

/** 1986 / 1988 은 보존 상태가 고르지 않다 */
function fallback(year: string, month: string, date: string): AuditDay {
  const n = Number(date);
  if (year === "1986") {
    return { occupancy: `${62 + ((n * 3) % 17)}%`, inService: "68", closed: "COMPLETE" };
  }
  return { occupancy: `${55 + ((n * 5) % 21)}%`, inService: "67", closed: "COMPLETE" };
}

export function auditKey(year: string, month: string, date: string): string {
  return `${year}-${month}-${date}`;
}

export function auditDay(year: string, month: string, date: string): AuditDay {
  const key = auditKey(year, month, date);
  if (key === "1987-OCT-17") return OCT_17_1987;
  return ORDINARY[key] ?? fallback(year, month, date);
}

/** 02:12 / 02:14 의 객실 목록 */
export const INDEX_SNAPSHOTS = {
  snap0212: { time: "02:12", rooms: ["501", "502", "503", "504", "505", "506"], total: "68 UNITS" },
  snap0214: { time: "02:14", rooms: ["501", "502", "503", "505", "506"], total: "67 UNITS" },
} as const;
