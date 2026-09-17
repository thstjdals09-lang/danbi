"use client";

import { useActionState } from "react";
import { saveShowcaseAction, type ShowcaseFormState } from "./actions";

type Props = {
  slots: (number | null)[];
  options: { id: number; label: string }[];
};

export function ShowcaseEditor({ slots, options }: Props) {
  const [state, formAction, pending] = useActionState<ShowcaseFormState, FormData>(saveShowcaseAction, {});

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "28px 40px" }}>
        {slots.map((current, slot) => (
          <div key={slot} className="field">
            <label htmlFor={`slot-${slot}`}>Slot 0{slot + 1}</label>
            <select id={`slot-${slot}`} name={`slot-${slot}`} defaultValue={current ?? ""}>
              <option value="">— Empty —</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <button type="submit" className="btn" disabled={pending}>
          Save showcase
        </button>
        {state.saved && <span className="eyebrow">Saved · 같은 수집물은 한 슬롯에만 전시됩니다</span>}
      </div>
    </form>
  );
}
