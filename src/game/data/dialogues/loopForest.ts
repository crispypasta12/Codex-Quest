import {
  getLessonStatus,
  lessonList,
  loopForestLessons,
  type LessonId,
} from "@/game/data/lessons/loopForestFundamentals";
import type { DialogueSequence } from "@/lib/store";

export const byteIntroDialogue: DialogueSequence = {
  id: "byte-module-intro",
  lines: [
    {
      speaker: "Byte",
      role: "Robot Teacher",
      portrait: "byte",
      text: "Welcome to Loop Forest Fundamentals.",
    },
    {
      speaker: "Byte",
      role: "Robot Teacher",
      portrait: "byte",
      text: "This forest has four small trails: sequence, loops, conditions, and nested loops.",
    },
    {
      speaker: "Byte",
      role: "Robot Teacher",
      portrait: "byte",
      text: "Start at Sequence Trail. Each lesson unlocks the next one when you solve its robot puzzle.",
    },
  ],
};

export const moduleCompleteDialogue: DialogueSequence = {
  id: "byte-module-complete",
  lines: [
    {
      speaker: "Byte",
      role: "Robot Teacher",
      portrait: "byte",
      text: "Loop Forest Fundamentals is complete. You built sequences, loops, conditions, and nested loops.",
    },
    {
      speaker: "Byte",
      role: "Robot Teacher",
      portrait: "byte",
      text: "That is a sturdy little toolkit. The robots are already using it to keep the forest tidy.",
    },
  ],
};

export function byteReminderDialogue(activeLessonId: LessonId, completedLessons: string[]): DialogueSequence {
  const nextLesson =
    lessonList.find((lesson) => !completedLessons.includes(lesson.id)) ?? loopForestLessons[activeLessonId];

  return {
    id: "byte-reminder",
    lines: [
      {
        speaker: "Byte",
        role: "Robot Teacher",
        portrait: "byte",
        text: `Your next stop is ${nextLesson.boardName}. Look for its sign in Loop Forest.`,
      },
    ],
  };
}

export function lockedLessonDialogue(lessonId: LessonId): DialogueSequence {
  const lesson = loopForestLessons[lessonId];
  return {
    id: `locked-${lessonId}`,
    lines: [
      {
        speaker: "Byte",
        role: "Robot Teacher",
        portrait: "byte",
        text: lesson.lockedMessage ?? "Byte says: Finish the earlier trail first.",
      },
    ],
  };
}

export function completedLessonDialogue(lessonId: LessonId): DialogueSequence {
  const lesson = loopForestLessons[lessonId];
  return {
    id: `completed-${lessonId}`,
    lines: [
      {
        speaker: "Byte",
        role: "Robot Teacher",
        portrait: "byte",
        text: `${lesson.title} is complete. You can replay the puzzle from the lesson panel if you want another run.`,
      },
    ],
  };
}

export function lessonBoardDialogue(
  completedLessons: string[],
  activeLessonId: LessonId,
  lessonProgressById: Record<LessonId, number>,
): DialogueSequence {
  const lines = lessonList.map((lesson) => {
    const status = getLessonStatus(lesson, completedLessons, activeLessonId, lessonProgressById[lesson.id] ?? 0);
    return `${lesson.order}. ${lesson.boardName} - ${status}`;
  });

  return {
    id: "forest-sign",
    lines: [
      {
        speaker: "Forest Sign",
        role: "Lesson Board",
        portrait: "sign",
        text: `Loop Forest Fundamentals\n${lines.join("\n")}`,
      },
      {
        speaker: "Forest Sign",
        role: "Controls",
        portrait: "sign",
        text: "Move with WASD or arrow keys. Press E or Space near Byte, signs, and machines. Esc pauses or closes panels.",
      },
    ],
  };
}
