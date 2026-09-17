"use client";

import { useActionState } from "react";
import type { AuthFormState } from "./actions";

type Props = {
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  submitLabel: string;
  newPassword?: boolean;
};

export function AuthForm({ action, submitLabel, newPassword }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction}>
      <div className="field">
        <label htmlFor="auth-email">Email</label>
        <input id="auth-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          name="password"
          type="password"
          autoComplete={newPassword ? "new-password" : "current-password"}
          minLength={8}
          required
        />
      </div>
      {state.error && <p className="form-error">{state.error}</p>}
      <div>
        <button className="btn" type="submit" disabled={pending}>
          {submitLabel} <span className="arrow">→</span>
        </button>
      </div>
    </form>
  );
}
