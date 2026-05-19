"use client";

import { Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect } from "react";

import { getLesson, lessonList } from "@/game/data/lessons/loopForestFundamentals";
import { loopForestAudio } from "@/lib/audio";
import { useGameStore } from "@/lib/store";

import { DialogueBox } from "./Dialogue/DialogueBox";
import { InteractionHint } from "./HUD/InteractionHint";
import { KeysFooter } from "./HUD/KeysFooter";
import { PlayerCard } from "./HUD/PlayerCard";
import { QuestTracker } from "./HUD/QuestTracker";
import { PhaserCanvas } from "./PhaserCanvas";
import { PauseOverlay } from "./PauseOverlay";
import { RepeatLoopPanel } from "./Quest/RepeatLoopPanel";
import { RewardPopup } from "./Quest/RewardPopup";

export function GameSection() {
  const hasEntered = useGameStore((state) => state.hasEntered);
  const setHasEntered = useGameStore((state) => state.setHasEntered);
  const setOnboardingOpen = useGameStore((state) => state.setOnboardingOpen);
  const setPauseOpen = useGameStore((state) => state.setPauseOpen);
  const resetCurrentLesson = useGameStore((state) => state.resetCurrentLesson);
  const sound = useGameStore((state) => state.sound);
  const volume = useGameStore((state) => state.volume);
  const setSound = useGameStore((state) => state.setSound);
  const activeLessonId = useGameStore((state) => state.activeLessonId);
  const completedLessons = useGameStore((state) => state.completedLessons);
  const lessonProgress = useGameStore((state) => state.lessonProgress);
  const activeLesson = getLesson(activeLessonId);
  const completedCount = lessonList.filter((lesson) => completedLessons.includes(lesson.id)).length;

  useEffect(() => {
    loopForestAudio.setMuted(!sound);
    loopForestAudio.setVolume(volume);
    if (hasEntered && sound) loopForestAudio.start();
  }, [hasEntered, sound, volume]);

  function enterForest() {
    setHasEntered(true);
    setOnboardingOpen(false);
    loopForestAudio.setMuted(!sound);
    loopForestAudio.setVolume(volume);
    loopForestAudio.start();
    loopForestAudio.play("unlock");
  }

  return (
    <section id="game-section" className="game-section">
      <div className="game-section-inner">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-ui text-[10px] uppercase tracking-[0.14em] text-teal-bright">
              Chapter 01 · 25-30 min
            </p>
            <h2 className="font-title text-[28px] leading-none text-ink">
              Loop Forest Fundamentals
            </h2>
          </div>
          <p className="font-ui text-[10px] uppercase tracking-[0.12em] text-ink-mute">
            {completedCount === 4 ? "Module saved · Fundamentals complete" : "WASD / arrows · E to interact"}
          </p>
        </header>
        <div className="game-frame">
          <PhaserCanvas />
          <div className="hud-layer" aria-live="polite">
            <div className="hud-top-left">
              <PlayerCard />
              <QuestTracker />
            </div>
            <div className="hud-top-right">
              <div className="hud-card lesson-chip">
                <span>Lesson {activeLesson.order}</span>
                <strong>{lessonProgress}%</strong>
              </div>
              <div className="hud-card lesson-chip">
                <span>Module</span>
                <strong>{completedCount}/4</strong>
              </div>
              <button className="icon-btn" type="button" onClick={() => setPauseOpen(true)} aria-label="Pause">
                <Pause size={18} />
              </button>
              <button
                className="icon-btn"
                type="button"
                onClick={() => {
                  setSound(!sound);
                  loopForestAudio.play("ui");
                }}
                aria-label={sound ? "Mute audio" : "Unmute audio"}
              >
                {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button
                className="icon-btn"
                type="button"
                onClick={() => {
                  resetCurrentLesson();
                  loopForestAudio.play("ui");
                  window.dispatchEvent(new CustomEvent("loopforest:reset-world"));
                }}
                aria-label="Reset current lesson"
              >
                <RotateCcw size={18} />
              </button>
            </div>
            <div className="hud-bottom-left">
              <KeysFooter />
            </div>
            <div className="hud-bottom-right">
              <InteractionHint />
            </div>
          </div>

          {!hasEntered ? (
            <div className="onboarding-overlay" role="dialog" aria-label="Loop Forest controls">
              <div className="onboarding-panel">
                <p className="qp-eyebrow">Chapter 01</p>
                <h3 className="qp-title">Loop Forest Fundamentals</h3>
                <p className="qp-desc">
                  Meet Byte and complete four robot quests across Lantern Path, Berry Hollow, Forked Bridge,
                  and Harvest Rows.
                </p>
                <div className="controls-grid">
                  <span><kbd className="kbd">WASD</kbd> or arrows</span>
                  <span>Move through the forest</span>
                  <span><kbd className="kbd">E</kbd> or <kbd className="kbd">Space</kbd></span>
                  <span>Interact with Byte and machines</span>
                  <span><kbd className="kbd">Esc</kbd></span>
                  <span>Pause or close panels</span>
                </div>
                <button className="btn-run" type="button" onClick={enterForest}>
                  Enter Loop Forest
                </button>
              </div>
            </div>
          ) : null}

          <DialogueBox />
          <RepeatLoopPanel />
          <RewardPopup />
          <PauseOverlay />
        </div>
      </div>
    </section>
  );
}
