/* ROOM 0 정적 빌드 진입점. Next 런타임 없이 단독으로 마운트한다.
   (게임 자체는 서버/DB를 쓰지 않으므로 정적 호스팅으로 충분하다) */
import { createRoot } from "react-dom/client";
import { Room0App } from "@/room0/Room0App";

const el = document.getElementById("root");
if (el) createRoot(el).render(<Room0App />);
