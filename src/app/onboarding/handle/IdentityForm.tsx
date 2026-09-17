"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveIdentityAction, type IdentityFormState } from "../actions";

function suggestHandle(nickname: string): string {
  return nickname.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
}

export function IdentityForm({ needsAccount, initialNickname }: { needsAccount: boolean; initialNickname: string }) {
  const [state, formAction, pending] = useActionState<IdentityFormState, FormData>(saveIdentityAction, {});
  const [nickname, setNickname] = useState(state.values?.nickname ?? initialNickname);
  const [handle, setHandle] = useState(state.values?.handle ?? suggestHandle(initialNickname));
  const [handleTouched, setHandleTouched] = useState(false);

  return (
    <form action={formAction}>
      <div className="field">
        <label htmlFor="nickname">Player name</label>
        <input
          id="nickname"
          name="nickname"
          minLength={2}
          maxLength={16}
          required
          placeholder="RiverMind"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            if (!handleTouched) setHandle(suggestHandle(e.target.value));
          }}
        />
      </div>

      <div className="field">
        <label htmlFor="handle">Public ID</label>
        <input
          id="handle"
          name="handle"
          required
          pattern="[a-z0-9_]{3,20}"
          placeholder="rivermind"
          value={handle}
          onChange={(e) => {
            setHandleTouched(true);
            setHandle(e.target.value.toLowerCase());
          }}
        />
        <span className="field__hint">pokerplayergrow / {handle || "your_id"}</span>
      </div>

      {needsAccount && (
        <>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
            <span className="field__hint">8자 이상. 이 플레이어는 이 계정에 영구히 기록됩니다.</span>
          </div>
        </>
      )}

      {state.error && <p className="form-error">{state.error}</p>}

      <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn" type="submit" disabled={pending}>
          {needsAccount ? "Create my player" : "Complete my player"} <span className="arrow">→</span>
        </button>
        {needsAccount && (
          <Link href="/login" className="link link--mute">
            Already a player? Sign in
          </Link>
        )}
      </div>
    </form>
  );
}
