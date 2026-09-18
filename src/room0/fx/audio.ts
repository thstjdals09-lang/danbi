/* ROOM 0 — 환경음 레이어.
   오디오 파일을 쓰지 않고 WebAudio 로 생성한다: HVAC 잡음, 형광등 버즈, CRT 험.
   모바일 autoplay 제한 때문에 반드시 첫 사용자 입력(CONNECT) 이후에 start() 한다.
   사운드 없이도 모든 퍼즐이 해결 가능해야 하므로, 여기서 나는 소리는 전부 장식이다. */

export type Cue = "tap" | "deny" | "reveal" | "anomaly" | "recover" | "record" | "door";

type Ctx = AudioContext & { resume(): Promise<void> };

class RoomTone {
  private ctx: Ctx | null = null;
  private master: GainNode | null = null;
  private bed: GainNode | null = null;
  private muted = false;
  private started = false;

  get ready(): boolean {
    return this.started;
  }

  /** 사용자 제스처 안에서 호출할 것. */
  start(muted: boolean): void {
    this.muted = muted;
    if (this.started) {
      void this.ctx?.resume();
      this.applyMute();
      return;
    }
    const AC: typeof AudioContext | undefined =
      typeof window === "undefined"
        ? undefined
        : window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;

    try {
      const ctx = new AC() as Ctx;
      const master = ctx.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(ctx.destination);

      const bed = ctx.createGain();
      bed.gain.value = 0;
      bed.connect(master);

      // HVAC — 필터링된 노이즈
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.2;
      }
      noise.buffer = buffer;
      noise.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 420;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.5;
      noise.connect(lp).connect(noiseGain).connect(bed);
      noise.start();

      // 형광등 버즈 — 120Hz 근처, 아주 약하게
      const buzz = ctx.createOscillator();
      buzz.type = "sawtooth";
      buzz.frequency.value = 119.5;
      const buzzFilter = ctx.createBiquadFilter();
      buzzFilter.type = "bandpass";
      buzzFilter.frequency.value = 240;
      buzzFilter.Q.value = 6;
      const buzzGain = ctx.createGain();
      buzzGain.gain.value = 0.012;
      buzz.connect(buzzFilter).connect(buzzGain).connect(bed);
      buzz.start();

      // CRT 험 — 고역 한 줄
      const crt = ctx.createOscillator();
      crt.type = "sine";
      crt.frequency.value = 7860;
      const crtGain = ctx.createGain();
      crtGain.gain.value = 0.0025;
      crt.connect(crtGain).connect(bed);
      crt.start();

      bed.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 3);

      this.ctx = ctx;
      this.master = master;
      this.bed = bed;
      this.started = true;
      void ctx.resume();
    } catch {
      /* 오디오를 못 열어도 게임은 그대로 진행된다. */
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyMute();
  }

  private applyMute(): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(this.muted ? 0 : 1, t, 0.08);
  }

  /** 전화 키패드 — 실제 DTMF 두 음. */
  dtmf(key: string): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || this.muted) return;
    const PAIRS: Record<string, [number, number]> = {
      "1": [697, 1209], "2": [697, 1336], "3": [697, 1477],
      "4": [770, 1209], "5": [770, 1336], "6": [770, 1477],
      "7": [852, 1209], "8": [852, 1336], "9": [852, 1477],
      "0": [941, 1336],
    };
    const pair = PAIRS[key];
    if (!pair) return;
    const t = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.055, t + 0.01);
    gain.gain.setValueAtTime(0.055, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    gain.connect(master);
    for (const f of pair) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      osc.connect(gain);
      osc.start(t);
      osc.stop(t + 0.18);
    }
  }

  /** 통화 상태음. ringback / distant(멀리서 울리는 벨) / near / disconnect / static */
  call(kind: "ringback" | "distant" | "near" | "disconnect" | "static"): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || this.muted) return;
    const t0 = ctx.currentTime;

    const ringPair = (at: number, dur: number, peak: number, cutoff: number) => {
      const gain = ctx.createGain();
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = cutoff;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(peak, at + 0.03);
      gain.gain.setValueAtTime(peak, at + dur - 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      gain.connect(lp).connect(master);
      for (const f of [440, 480]) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = f;
        osc.connect(gain);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      }
    };

    /* 실제 벨 — 두 음을 빠르게 두드린다 */
    const bell = (at: number, peak: number, cutoff: number) => {
      const gain = ctx.createGain();
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = cutoff;
      const trem = ctx.createOscillator();
      const tremGain = ctx.createGain();
      trem.frequency.value = 20;
      tremGain.gain.value = peak;
      trem.connect(tremGain.gain);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(peak, at + 0.02);
      gain.gain.setValueAtTime(peak, at + 0.85);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.0);
      gain.connect(lp).connect(master);
      for (const f of [1050, 1370]) {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = f;
        osc.connect(gain);
        osc.start(at);
        osc.stop(at + 1.02);
      }
      trem.start(at);
      trem.stop(at + 1.02);
    };

    const click = (at: number, peak: number) => {
      const src = ctx.createBufferSource();
      const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.06), ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i += 1) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3;
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 900;
      const g = ctx.createGain();
      g.gain.value = peak;
      src.connect(bp).connect(g).connect(master);
      src.start(at);
    };

    switch (kind) {
      case "ringback":
        ringPair(t0 + 0.2, 1.1, 0.03, 1200);
        ringPair(t0 + 1.8, 1.1, 0.03, 1200);
        break;
      case "distant":
        /* 건물 어딘가에서 울린다 — 작고 어둡게 */
        bell(t0 + 0.1, 0.012, 700);
        bell(t0 + 2.0, 0.012, 700);
        break;
      case "near":
        bell(t0, 0.075, 4200);
        bell(t0 + 2.0, 0.075, 4200);
        break;
      case "static": {
        const src = ctx.createBufferSource();
        const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 2.2), ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i += 1) d[i] = (Math.random() * 2 - 1) * 0.5;
        src.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 1800;
        bp.Q.value = 0.7;
        const g = ctx.createGain();
        g.gain.value = 0.02;
        src.connect(bp).connect(g).connect(master);
        src.start(t0);
        break;
      }
      case "disconnect":
      default:
        click(t0, 0.08);
        break;
    }
  }

  /** 짧은 시스템 반응음. */
  cue(name: Cue): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || this.muted) return;
    const t = ctx.currentTime;

    const blip = (
      freq: number,
      dur: number,
      type: OscillatorType,
      peak: number,
      slideTo?: number,
      offset = 0,
    ) => {
      const at = t + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, at);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), at + dur);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(peak, at + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      osc.connect(gain).connect(master);
      osc.start(at);
      osc.stop(at + dur + 0.02);
    };

    const burst = (dur: number, peak: number, cutoff: number) => {
      const src = ctx.createBufferSource();
      const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i += 1) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = cutoff;
      const gain = ctx.createGain();
      gain.gain.value = peak;
      src.connect(bp).connect(gain).connect(master);
      src.start(t);
    };

    switch (name) {
      case "tap":
        blip(1400, 0.035, "square", 0.02);
        break;
      case "deny":
        blip(180, 0.16, "square", 0.05, 120);
        break;
      case "reveal":
        blip(880, 0.09, "triangle", 0.05);
        blip(1320, 0.14, "sine", 0.03);
        break;
      case "anomaly":
        burst(0.42, 0.11, 1800);
        blip(70, 0.5, "sine", 0.06);
        break;
      case "recover":
        burst(0.7, 0.09, 900);
        blip(110, 0.9, "sine", 0.09, 220);
        break;
      case "record":
        blip(2100, 0.03, "square", 0.025);
        blip(1600, 0.03, "square", 0.02, undefined, 0.07);
        break;
      case "door":
        burst(0.55, 0.08, 320);
        break;
      default:
        break;
    }
  }
}

export const roomTone = new RoomTone();
