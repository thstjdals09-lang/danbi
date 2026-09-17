"use client";

import { useState } from "react";

type Props = {
  title: string;
  text: string;
  /** 공유할 경로 (예: "/queenbee"). 비우면 사이트 첫 화면 */
  path?: string;
  /** 저장할 이미지 경로. 에셋이 아직 없으면 null */
  saveSrc?: string | null;
  saveName?: string;
};

/** Share / Save 준비 구조: Web Share API → 클립보드 복사 순으로 시도한다. */
export function ShareActions({ title, text, path = "/", saveSrc, saveName = "pfp" }: Props) {
  const [status, setStatus] = useState<string | null>(null);

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setStatus("Link copied");
    } catch {
      setStatus(null);
    }
  }

  return (
    <div className="share-row" style={{ alignItems: "center" }}>
      <button type="button" className="link" onClick={share}>
        Share
      </button>
      {saveSrc ? (
        <a className="link" href={saveSrc} download={saveName}>
          Save PFP
        </a>
      ) : (
        <span className="link link--mute" aria-disabled title="PFP 에셋이 준비되면 저장할 수 있습니다" style={{ cursor: "default", opacity: 0.5 }}>
          Save PFP
        </span>
      )}
      {status && <span className="eyebrow">{status}</span>}
    </div>
  );
}
