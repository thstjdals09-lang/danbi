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
    <form action={formAction} className="card stack">
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {slots.map((current, slot) => (
          <label key={slot}>
            Slot {slot + 1}
            <select name={`slot-${slot}`} defaultValue={current ?? ""}>
              <option value="">— 비워두기 —</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="row">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          쇼케이스 저장
        </button>
        {state.saved && <span className="muted">저장되었습니다. (같은 수집물은 한 슬롯에만 전시됩니다)</span>}
      </div>
    </form>
  );
}
