"use client";

import { useMemo, useState } from "react";

import {
  getLesson,
  getLessonStatus,
  isLessonUnlocked,
  lessonList,
  type LessonDefinition,
} from "@/game/data/lessons/loopForestFundamentals";
import { completedLessonDialogue, lockedLessonDialogue } from "@/game/data/dialogues/loopForest";
import { useGameStore } from "@/lib/store";

export function QuestTracker() {
  const activeLessonId = useGameStore((state) => state.activeLessonId);
  const completedLessons = useGameStore((state) => state.completedLessons);
  const lessonProgressById = useGameStore((state) => state.lessonProgressById);
  const startLesson = useGameStore((state) => state.startLesson);
  const openDialogue = useGameStore((state) => state.openDialogue);
  const openPuzzle = useGameStore((state) => state.openPuzzle);
  const [compact, setCompact] = useState(false);
  const activeLesson = getLesson(activeLessonId);
  const completedCount = lessonList.filter((lesson) => completedLessons.includes(lesson.id)).length;
  const currentObjective = useMemo(
    () => getCurrentObjective(activeLesson, completedLessons, lessonProgressById[activeLessonId] ?? 0),
    [activeLesson, activeLessonId, completedLessons, lessonProgressById],
  );

  return (
    <div className={`hud-card quest-tracker module-tracker ${compact ? "compact" : ""}`}>
      <div className="quest-header">
        <span className="pixel-icon icon-quest" />
        <span className="title">Loop Forest Fundamentals</span>
        <span className="progress-pill">{completedCount}/4</span>
        <button className="toggle" type="button" onClick={() => setCompact((value) => !value)}>
          {compact ? "Open" : "Hide"}
        </button>
      </div>
      <div className="quest-current">
        {completedCount === 4 ? "Complete: Loop Forest Fundamentals" : `Now: ${currentObjective}`}
      </div>
      <div className="quest-objectives lesson-board-mini">
        {lessonList.map((lesson) => {
          const status = getLessonStatus(
            lesson,
            completedLessons,
            activeLessonId,
            lessonProgressById[lesson.id] ?? 0,
          );
          return (
            <button
              className={`quest-objective lesson-status ${status.toLowerCase().replace(/\s+/g, "-")}`}
              key={lesson.id}
              type="button"
              onClick={() => {
                if (!isLessonUnlocked(lesson, completedLessons)) {
                  openDialogue(lockedLessonDialogue(lesson.id));
                  return;
                }
                startLesson(lesson.id);
                if (completedLessons.includes(lesson.id)) {
                  openDialogue(completedLessonDialogue(lesson.id));
                  window.setTimeout(() => openPuzzle(lesson.id), 260);
                  return;
                }
                openDialogue(lesson.npcDialogue);
              }}
            >
              <span className={`pixel-icon ${statusIconClass(status)}`} />
              <span>{lesson.boardName}</span>
              <em>{status}</em>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function statusIconClass(status: string) {
  if (status === "Completed") return "icon-complete";
  if (status === "Locked") return "icon-locked";
  if (status === "In Progress") return "icon-lesson";
  return "icon-module";
}

function getCurrentObjective(
  lesson: LessonDefinition,
  completedLessons: string[],
  progress: number,
) {
  if (completedLessons.includes(lesson.id)) {
    const next = lessonList.find((item) => !completedLessons.includes(item.id));
    return next ? `Find ${next.boardName}` : "Talk to Byte";
  }

  if (progress >= 80) return lesson.objectives.at(-1) ?? lesson.objectives[0];
  if (progress >= 45) return lesson.objectives[2] ?? lesson.objectives[0];
  if (progress >= 20) return lesson.objectives[1] ?? lesson.objectives[0];
  return lesson.objectives[0];
}
