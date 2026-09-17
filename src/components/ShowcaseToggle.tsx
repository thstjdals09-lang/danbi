"use client";

import Link from "next/link";
import { useActionState } from "react";
import { toggleShowcaseAction, type ShowcaseActionState } from "@/app/collection/actions";

type Props = {
  collectibleId: number;
  isShowcased: boolean;
  /** 결과 화면처럼 강조된 버튼으로 보여줄지 */
  prominent?: boolean;
  label?: string;
};

/** Showcase 에 추가/제거. 슬롯이 가득 차면 My Room 으로 안내한다. */
export function ShowcaseToggle({ collectibleId, isShowcased, prominent, label = "Add to showcase" }: Props) {
  const [state, action, pending] = useActionState<ShowcaseActionState, FormData>(toggleShowcaseAction, {
    showcased: isShowcased,
  });

  if (state.status === "full") {
    return (
      <Link href="/me/showcase" className={prominent ? "btn btn--ghost" : "link"}>
        Showcase full · Edit my room
      </Link>
    );
  }

  return (
    <form action={action}>
      <input type="hidden" name="collectibleId" value={collectibleId} />
      <input type="hidden" name="intent" value={state.showcased ? "remove" : "add"} />
      {state.showcased ? (
        <button type="submit" className={prominent ? "btn btn--ghost" : "link link--mute"} disabled={pending}>
          ✓ In showcase · Remove
        </button>
      ) : (
        <button type="submit" className={prominent ? "btn" : "link"} disabled={pending}>
          {label}
        </button>
      )}
    </form>
  );
}
