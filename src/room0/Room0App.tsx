"use client";

import { useEffect } from "react";
import { GameProvider, useGame } from "@/room0/state/GameProvider";
import { SystemFrame } from "@/room0/components/SystemFrame";
import { BootScene } from "@/room0/scenes/BootScene";
import { FloorMapScene } from "@/room0/scenes/FloorMapScene";
import { CCTVScene } from "@/room0/scenes/CCTVScene";
import { DiscoveryScene } from "@/room0/scenes/DiscoveryScene";
import { Room504Scene } from "@/room0/scenes/Room504Scene";
import { NotebookScene } from "@/room0/scenes/NotebookScene";
import { FrontDeskScene } from "@/room0/scenes/FrontDeskScene";

function Scene() {
  const { game } = useGame();
  switch (game.currentScene) {
    case "cctv":
      return <CCTVScene />;
    case "room504":
      return <Room504Scene />;
    case "notebook":
      return <NotebookScene />;
    case "frontdesk":
      return <FrontDeskScene />;
    case "map":
    default:
      return <FloorMapScene />;
  }
}

function Shell() {
  const { game, connected } = useGame();

  /* 새로고침해도 진행은 그대로지만, 단말에는 다시 접속해야 한다.
     (모바일 오디오 정책상 첫 사용자 입력이 필요하기도 하다) */
  if (!game.bootCompleted || !connected) return <BootScene />;
  if (game.currentScene === "discovery") return <DiscoveryScene />;

  return (
    <SystemFrame>
      <Scene />
    </SystemFrame>
  );
}

export function Room0App() {
  /* 게임이 열려 있는 동안에만 문서 전체를 잠근다. 나가면 원래대로 돌린다. */
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const prev = { htmlOverflow: root.style.overflow, bodyOverflow: body.style.overflow, bg: body.style.background };
    root.setAttribute("data-room0", "");
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.background = "#0a0b08";
    return () => {
      root.removeAttribute("data-room0");
      root.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.background = prev.bg;
    };
  }, []);

  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  );
}
