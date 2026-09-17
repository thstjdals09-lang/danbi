"use client";

import { useActionState } from "react";
import type { AuthFormState } from "./actions";

type Props = {
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  submitLabel: string;
};

export function AuthForm({ action, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="form">
      <label>
        이메일
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        비밀번호
        <input name="password" type="password" autoComplete="current-password" minLength={8} required />
      </label>
      {state.error && <p className="error">{state.error}</p>}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {submitLabel}
      </button>
    </form>
  );
}
