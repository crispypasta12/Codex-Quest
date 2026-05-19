"use client";

import { useEffect } from "react";

import { getLesson, getNextLesson } from "@/game/data/lessons/loopForestFundamentals";
import { loopForestAudio } from "@/lib/audio";
import { useGameStore } from "@/lib/store";

export function RewardPopup() {
  const rewardOpen = useGameStore((state) => state.rewardOpen);
  const rewardLessonId = useGameStore((state) => state.rewardLessonId ?? state.activeLessonId);
  const moduleCompleted = useGameStore((state) => state.moduleCompleted);
  const closeReward = useGameStore((state) => state.closeReward);

  useEffect(() => {
    if (rewardOpen) loopForestAudio.play(moduleCompleted ? "reward" : "unlock");
  }, [moduleCompleted, rewardOpen]);

  if (!rewardOpen) return null;

  const lesson = getLesson(rewardLessonId);
  const nextLesson = getNextLesson(lesson.id);

  return (
    <div className="reward-popup" role="dialog" aria-label="Lesson complete">
      <div className="reward-inner">
        <div className="reward-eyebrow">{moduleCompleted ? "Module Complete" : "Lesson Complete"}</div>
        <h3 className="reward-title">{lesson.title}</h3>
        <p className="reward-desc">
          {moduleCompleted
            ? "Loop Forest Fundamentals is complete."
            : nextLesson
              ? `Unlocked Lesson ${nextLesson.order}: ${nextLesson.title}.`
              : "You completed this lesson."}
        </p>
        <div className="reward-rewards">
          <span className="reward-pill"><span className="glyph" />+{lesson.rewards.xp} XP</span>
          {lesson.rewards.badges.map((badge) => (
            <span className="reward-pill" key={badge}><span className="glyph" />{badge}</span>
          ))}
          {(lesson.rewards.stickers ?? []).map((sticker) => (
            <span className="reward-pill" key={sticker}><span className="glyph" />{sticker}</span>
          ))}
        </div>
        <button className="btn-close" type="button" onClick={closeReward}>
          Keep Exploring
        </button>
      </div>
    </div>
  );
}
