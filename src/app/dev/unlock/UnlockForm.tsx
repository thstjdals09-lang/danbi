"use client";

import { useActionState } from "react";
import { unlockDevAction, type UnlockFormState } from "../actions";

export function UnlockForm() {
  const [state, formAction, pending] = useActionState<UnlockFormState, FormData>(unlockDevAction, {});

  return (
    <form action={formAction} className="form">
      <label>
        비밀번호
        <input name="password" type="password" inputMode="numeric" autoComplete="off" required autoFocus />
      </label>
      {state.error && <p className="error">{state.error}</p>}
      <button className="btn btn-dev" type="submit" disabled={pending}>
        잠금 해제
      </button>
    </form>
  );
}
