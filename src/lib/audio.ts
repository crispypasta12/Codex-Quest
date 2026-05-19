type SoundName =
  | "ui"
  | "dialogue"
  | "interact"
  | "success"
  | "failure"
  | "reward"
  | "unlock"
  | "footstep";

type LoopForestAudio = {
  start: () => void;
  stop: () => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  play: (name: SoundName) => void;
};

function toneFor(name: SoundName) {
  switch (name) {
    case "success":
      return [523, 659, 784];
    case "failure":
      return [220, 196];
    case "reward":
      return [440, 660, 880, 990];
    case "unlock":
      return [392, 523, 659];
    case "dialogue":
      return [520];
    case "interact":
      return [360];
    case "footstep":
      return [96];
    case "ui":
    default:
      return [420];
  }
}

export function createSounds(): LoopForestAudio {
  let context: AudioContext | null = null;
  let master: GainNode | null = null;
  let ambientOsc: OscillatorNode | null = null;
  let ambientGain: GainNode | null = null;
  let muted = false;
  let volume = 0.65;

  function ensureContext() {
    if (typeof window === "undefined") return null;
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;
    if (!context) {
      context = new AudioCtor();
      master = context.createGain();
      master.gain.value = muted ? 0 : volume;
      master.connect(context.destination);
    }
    if (context.state === "suspended") void context.resume();
    return context;
  }

  function setMasterGain() {
    if (!master || !context) return;
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.linearRampToValueAtTime(muted ? 0 : volume, context.currentTime + 0.08);
  }

  return {
    start() {
      const ctx = ensureContext();
      if (!ctx || !master || ambientOsc) return;
      ambientOsc = ctx.createOscillator();
      ambientGain = ctx.createGain();
      ambientOsc.type = "sine";
      ambientOsc.frequency.value = 92;
      ambientGain.gain.value = 0.018;
      ambientOsc.connect(ambientGain);
      ambientGain.connect(master);
      ambientOsc.start();
    },
    stop() {
      if (!context) return;
      ambientOsc?.stop();
      ambientOsc?.disconnect();
      ambientGain?.disconnect();
      ambientOsc = null;
      ambientGain = null;
    },
    setMuted(nextMuted) {
      muted = nextMuted;
      setMasterGain();
    },
    setVolume(nextVolume) {
      volume = Math.max(0, Math.min(1, nextVolume));
      setMasterGain();
    },
    play(name) {
      const ctx = ensureContext();
      if (!ctx || !master || muted) return;
      const output = master;
      const notes = toneFor(name);
      notes.forEach((frequency, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startAt = ctx.currentTime + index * 0.065;
        const duration = name === "footstep" ? 0.045 : 0.12;
        osc.type = name === "footstep" ? "triangle" : "sine";
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(name === "footstep" ? 0.025 : 0.055, startAt + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
        osc.connect(gain);
        gain.connect(output);
        osc.start(startAt);
        osc.stop(startAt + duration + 0.02);
      });
    },
  };
}

export const loopForestAudio = createSounds();
