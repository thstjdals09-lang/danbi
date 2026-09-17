"use client";

import { useActionState } from "react";
import { unlockDevAction, type UnlockFormState } from "../actions";

export function UnlockForm() {
  const [state, formAction, pending] = useActionState<UnlockFormState, FormData>(unlockDevAction, {});

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="field">
        <label htmlFor="dev-password">Password</label>
        <input id="dev-password" name="password" type="password" inputMode="numeric" autoComplete="off" required autoFocus />
      </div>
      {state.error && <p className="form-error">{state.error}</p>}
      <div>
        <button className="btn btn--dev" type="submit" disabled={pending}>
          잠금 해제
        </button>
      </div>
    </form>
  );
}
