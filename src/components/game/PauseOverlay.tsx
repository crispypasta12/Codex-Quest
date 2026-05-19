"use client";

import { RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import { useEffect } from "react";

import { useGameStore } from "@/lib/store";
import { loopForestAudio } from "@/lib/audio";

export function PauseOverlay() {
  const pauseOpen = useGameStore((state) => state.pauseOpen);
  const setPauseOpen = useGameStore((state) => state.setPauseOpen);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const resetCurrentLesson = useGameStore((state) => state.resetCurrentLesson);
  const sound = useGameStore((state) => state.sound);
  const volume = useGameStore((state) => state.volume);
  const setSound = useGameStore((state) => state.setSound);
  const setVolume = useGameStore((state) => state.setVolume);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        const state = useGameStore.getState();
        if (state.activeDialogue || state.puzzleOpen || state.rewardOpen || state.onboardingOpen) return;
        event.preventDefault();
        setPauseOpen(!state.pauseOpen);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setPauseOpen]);

  if (!pauseOpen) return null;

  return (
    <div className="pause-overlay" role="dialog" aria-label="Pause menu">
      <div className="pause-panel">
        <button className="icon-btn pause-close" type="button" onClick={() => setPauseOpen(false)} aria-label="Close pause menu">
          <X size={18} />
        </button>
        <p className="qp-eyebrow">Loopvale Academy</p>
        <h3 className="qp-title">Paused</h3>
        <p className="qp-desc">
          Progress is saved locally on this device. These controls are here for playtesting the module flow.
        </p>
        <div className="controls-grid pause-controls">
          <span><kbd className="kbd">WASD</kbd> or arrows</span>
          <span>Move through Loop Forest</span>
          <span><kbd className="kbd">E</kbd> or <kbd className="kbd">Space</kbd></span>
          <span>Talk, read signs, and open lessons</span>
          <span><kbd className="kbd">Esc</kbd></span>
          <span>Pause or close dialogue</span>
        </div>
        <div className="audio-controls" aria-label="Audio settings">
          <button
            className="btn-cancel"
            type="button"
            onClick={() => {
              setSound(!sound);
              loopForestAudio.setMuted(sound);
              loopForestAudio.play("ui");
            }}
          >
            {sound ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {sound ? "Mute" : "Unmute"}
          </button>
          <label>
            <span>Volume</span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(volume * 100)}
              onChange={(event) => {
                const nextVolume = Number(event.target.value) / 100;
                setVolume(nextVolume);
                loopForestAudio.setVolume(nextVolume);
              }}
            />
          </label>
        </div>
        <div className="qp-actions">
          <button className="btn-run" type="button" onClick={() => setPauseOpen(false)}>
            Resume
          </button>
          <button
            className="btn-cancel"
            type="button"
            onClick={() => {
              resetCurrentLesson();
              setPauseOpen(false);
              window.dispatchEvent(new CustomEvent("loopforest:reset-world"));
            }}
          >
            <RotateCcw size={14} /> Reset Current
          </button>
          <button
            className="btn-cancel"
            type="button"
            onClick={() => {
              resetProgress();
              setPauseOpen(false);
              window.dispatchEvent(new CustomEvent("loopforest:reset-world"));
            }}
          >
            <RotateCcw size={14} /> Reset All
          </button>
        </div>
      </div>
    </div>
  );
}
