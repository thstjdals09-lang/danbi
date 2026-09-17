"use client";

import { useActionState, useState } from "react";
import { saveIdentityAction } from "../actions";

export function IdentityForm() {
  const [state, formAction, pending] = useActionState(saveIdentityAction, {});
  const [handle, setHandle] = useState("");

  return (
    <form action={formAction} className="form">
      <label>
        닉네임
        <input name="nickname" minLength={2} maxLength={16} required placeholder="QUEENBEE" />
      </label>
      <label>
        공개 ID
        <input
          name="handle"
          required
          pattern="[a-z0-9_]{3,20}"
          placeholder="queenbee"
          value={handle}
          onChange={(e) => setHandle(e.target.value.toLowerCase())}
        />
      </label>
      <p className="muted" style={{ margin: 0, fontSize: 14 }}>
        프로필 주소: <strong>/{handle || "your_id"}</strong>
      </p>
      {state.error && <p className="error">{state.error}</p>}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        내 플레이어 완성하기
      </button>
    </form>
  );
}
