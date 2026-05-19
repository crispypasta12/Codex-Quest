import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  getLesson,
  lessonList,
  lessonOrder,
  loopForestLessons,
  type LessonId,
} from "@/game/data/lessons/loopForestFundamentals";

export type QuestState =
  | "NOT_STARTED"
  | "TALK_TO_BYTE"
  | "FIND_BERRY_BOT"
  | "LEARN_LOOP"
  | "SOLVE_LOOP_PUZZLE"
  | "WATCH_BOT_WORK"
  | "RETURN_TO_BYTE"
  | "COMPLETED";

export type DialogueLine = {
  speaker: string;
  role?: string;
  portrait?: "byte" | "bot" | "sign";
  text: string;
};

export type DialogueSequence = {
  id: string;
  lines: DialogueLine[];
};

export type InteractionHint = {
  id: string;
  label: string;
  action: string;
} | null;

export type PuzzleStatus = "idle" | "running" | "success" | "failure";

type LessonProgressMap = Record<LessonId, number>;

type PersistedProgress = {
  questState: QuestState;
  xp: number;
  level: number;
  completedLessons: string[];
  badges: string[];
  stickers: string[];
  lessonProgress: number;
  lessonProgressById: LessonProgressMap;
  activeLessonId: LessonId;
  moduleCompleted: boolean;
  playerPosition?: { x: number; y: number };
  sound: boolean;
  volume: number;
};

type GameState = PersistedProgress & {
  hasEntered: boolean;
  sound: boolean;
  volume: number;
  onboardingOpen: boolean;
  pauseOpen: boolean;
  rewardOpen: boolean;
  rewardLessonId: LessonId | null;
  interactionHint: InteractionHint;
  activeDialogue: DialogueSequence | null;
  puzzleOpen: boolean;
  activePuzzleLessonId: LessonId | null;
  puzzleStatus: PuzzleStatus;
  puzzleRepeat: number;
  puzzleCollected: number;
  puzzleMessage: string;
  setHasEntered: (hasEntered: boolean) => void;
  setSound: (sound: boolean) => void;
  setVolume: (volume: number) => void;
  setQuestState: (questState: QuestState) => void;
  setActiveLesson: (lessonId: LessonId) => void;
  startLesson: (lessonId: LessonId) => void;
  setInteractionHint: (interactionHint: InteractionHint) => void;
  openDialogue: (dialogue: DialogueSequence) => void;
  closeDialogue: () => void;
  openPuzzle: (lessonId?: LessonId) => void;
  closePuzzle: () => void;
  setPuzzleRepeat: (puzzleRepeat: number) => void;
  setPuzzleRunning: () => void;
  setPuzzleCollected: (puzzleCollected: number) => void;
  setPuzzleFailure: (message: string) => void;
  completePuzzle: (lessonId?: LessonId, message?: string) => void;
  resetPuzzle: () => void;
  grantLessonReward: (lessonId: LessonId) => void;
  grantLoopReward: () => void;
  closeReward: () => void;
  setPauseOpen: (pauseOpen: boolean) => void;
  setOnboardingOpen: (onboardingOpen: boolean) => void;
  setPlayerPosition: (playerPosition: { x: number; y: number }) => void;
  resetCurrentLesson: () => void;
  resetProgress: () => void;
};

function emptyLessonProgress(): LessonProgressMap {
  return {
    "sequence-01": 0,
    "loops-01": 0,
    "conditions-01": 0,
    "nested-loops-01": 0,
  };
}

function getDefaultRepeat(lessonId: LessonId | null) {
  if (lessonId === "loops-01") return 5;
  return 1;
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function totalsForCompleted(completedLessons: string[]) {
  const completedSet = new Set(completedLessons);
  const rewards = lessonList.filter((lesson) => completedSet.has(lesson.id)).map((lesson) => lesson.rewards);
  const xp = rewards.reduce((sum, reward) => sum + reward.xp, 0);
  return {
    xp,
    level: Math.floor(xp / 100) + 1,
    badges: unique(rewards.flatMap((reward) => reward.badges)),
    stickers: unique(rewards.flatMap((reward) => reward.stickers ?? [])),
    moduleCompleted: lessonOrder.every((lessonId) => completedSet.has(lessonId)),
  };
}

const initialProgress: PersistedProgress = {
  questState: "TALK_TO_BYTE",
  xp: 0,
  level: 1,
  completedLessons: [],
  badges: [],
  stickers: [],
  lessonProgress: 0,
  lessonProgressById: emptyLessonProgress(),
  activeLessonId: "sequence-01",
  moduleCompleted: false,
  sound: true,
  volume: 0.65,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialProgress,
      hasEntered: false,
      sound: true,
      volume: 0.65,
      onboardingOpen: true,
      pauseOpen: false,
      rewardOpen: false,
      rewardLessonId: null,
      interactionHint: null,
      activeDialogue: null,
      puzzleOpen: false,
      activePuzzleLessonId: null,
      puzzleStatus: "idle",
      puzzleRepeat: 5,
      puzzleCollected: 0,
      puzzleMessage: "",
      setHasEntered: (hasEntered) => set({ hasEntered, onboardingOpen: !hasEntered }),
      setSound: (sound) => set({ sound }),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      setQuestState: (questState) => set({ questState }),
      setActiveLesson: (activeLessonId) =>
        set((state) => ({
          activeLessonId,
          lessonProgress: state.lessonProgressById[activeLessonId] ?? 0,
        })),
      startLesson: (activeLessonId) =>
        set((state) => {
          const currentProgress = state.lessonProgressById[activeLessonId] ?? 0;
          const progress = state.completedLessons.includes(activeLessonId) ? 100 : Math.max(currentProgress, 20);
          return {
            activeLessonId,
            lessonProgress: progress,
            lessonProgressById: {
              ...emptyLessonProgress(),
              ...state.lessonProgressById,
              [activeLessonId]: progress,
            },
          };
        }),
      setInteractionHint: (interactionHint) => set({ interactionHint }),
      openDialogue: (activeDialogue) => set({ activeDialogue, interactionHint: null }),
      closeDialogue: () => set({ activeDialogue: null }),
      openPuzzle: (lessonId) =>
        set((state) => {
          const activePuzzleLessonId = lessonId ?? state.activeLessonId;
          return {
            activeLessonId: activePuzzleLessonId,
            activePuzzleLessonId,
            puzzleOpen: true,
            puzzleStatus: "idle",
            puzzleMessage: "",
            puzzleCollected: 0,
            puzzleRepeat: getDefaultRepeat(activePuzzleLessonId),
            interactionHint: null,
            lessonProgress: Math.max(state.lessonProgressById[activePuzzleLessonId] ?? 0, 45),
            lessonProgressById: {
              ...emptyLessonProgress(),
              ...state.lessonProgressById,
              [activePuzzleLessonId]: Math.max(state.lessonProgressById[activePuzzleLessonId] ?? 0, 45),
            },
          };
        }),
      closePuzzle: () => set({ puzzleOpen: false }),
      setPuzzleRepeat: (puzzleRepeat) => set({ puzzleRepeat, puzzleStatus: "idle", puzzleMessage: "" }),
      setPuzzleRunning: () => set({ puzzleStatus: "running", puzzleCollected: 0, puzzleMessage: "" }),
      setPuzzleCollected: (puzzleCollected) =>
        set((state) => {
          const lessonId = state.activePuzzleLessonId ?? state.activeLessonId;
          const progress = Math.max(state.lessonProgressById[lessonId] ?? 0, Math.min(84, 45 + puzzleCollected * 8));
          return {
            puzzleCollected,
            lessonProgress: progress,
            lessonProgressById: {
              ...emptyLessonProgress(),
              ...state.lessonProgressById,
              [lessonId]: progress,
            },
          };
        }),
      setPuzzleFailure: (puzzleMessage) => set({ puzzleStatus: "failure", puzzleMessage }),
      completePuzzle: (lessonId, message) =>
        set((state) => {
          const completedLessonId = lessonId ?? state.activePuzzleLessonId ?? state.activeLessonId;
          const lesson = getLesson(completedLessonId);
          const progress = 90;
          return {
            puzzleStatus: "success",
            puzzleCollected: completedLessonId === "loops-01" ? 5 : state.puzzleCollected,
            lessonProgress: progress,
            lessonProgressById: {
              ...emptyLessonProgress(),
              ...state.lessonProgressById,
              [completedLessonId]: progress,
            },
            questState: completedLessonId === "loops-01" ? "RETURN_TO_BYTE" : state.questState,
            puzzleMessage: message ?? lesson.successExplanation,
          };
        }),
      resetPuzzle: () =>
        set((state) => ({
          puzzleStatus: "idle",
          puzzleCollected: 0,
          puzzleMessage: "",
          puzzleRepeat: getDefaultRepeat(state.activePuzzleLessonId ?? state.activeLessonId),
        })),
      grantLessonReward: (lessonId) =>
        set((state) => {
          const hasLesson = state.completedLessons.includes(lessonId);
          const completedLessons = hasLesson ? state.completedLessons : [...state.completedLessons, lessonId];
          const totals = hasLesson
            ? {
                xp: state.xp,
                level: state.level,
                badges: state.badges,
                stickers: state.stickers,
                moduleCompleted: state.moduleCompleted,
              }
            : totalsForCompleted(completedLessons);

          return {
            ...totals,
            completedLessons,
            lessonProgress: 100,
            lessonProgressById: {
              ...emptyLessonProgress(),
              ...state.lessonProgressById,
              [lessonId]: 100,
            },
            rewardOpen: true,
            rewardLessonId: lessonId,
            moduleCompleted: lessonOrder.every((id) => completedLessons.includes(id)),
            questState: lessonId === "loops-01" ? "COMPLETED" : state.questState,
          };
        }),
      grantLoopReward: () => get().grantLessonReward("loops-01"),
      closeReward: () => set({ rewardOpen: false, rewardLessonId: null }),
      setPauseOpen: (pauseOpen) => set({ pauseOpen }),
      setOnboardingOpen: (onboardingOpen) => set({ onboardingOpen }),
      setPlayerPosition: (playerPosition) => set({ playerPosition }),
      resetCurrentLesson: () =>
        set((state) => {
          const startIndex = lessonOrder.indexOf(state.activeLessonId);
          const resetIds = new Set(startIndex >= 0 ? lessonOrder.slice(startIndex) : [state.activeLessonId]);
          const completedLessons = state.completedLessons.filter((lessonId) => !resetIds.has(lessonId as LessonId));
          const totals = totalsForCompleted(completedLessons);
          const lessonProgressById = { ...emptyLessonProgress(), ...state.lessonProgressById };
          resetIds.forEach((lessonId) => {
            lessonProgressById[lessonId] = 0;
          });
          return {
            ...totals,
            completedLessons,
            lessonProgress: 0,
            lessonProgressById,
            activePuzzleLessonId: null,
            rewardOpen: false,
            activeDialogue: null,
            puzzleOpen: false,
            puzzleStatus: "idle",
            puzzleRepeat: getDefaultRepeat(state.activeLessonId),
            puzzleCollected: 0,
            puzzleMessage: "",
            moduleCompleted: false,
          };
        }),
      resetProgress: () =>
        set({
          ...initialProgress,
          rewardOpen: false,
          rewardLessonId: null,
          activeDialogue: null,
          puzzleOpen: false,
          activePuzzleLessonId: null,
          puzzleStatus: "idle",
          puzzleRepeat: 5,
          puzzleCollected: 0,
          puzzleMessage: "",
          lessonProgress: 0,
          lessonProgressById: emptyLessonProgress(),
          playerPosition: undefined,
        }),
    }),
    {
      name: "loopvale-progress-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        questState: state.questState,
        xp: state.xp,
        level: state.level,
        completedLessons: state.completedLessons,
        badges: state.badges,
        stickers: state.stickers,
        playerPosition: state.playerPosition,
        lessonProgress: state.lessonProgress,
        lessonProgressById: state.lessonProgressById,
        activeLessonId: state.activeLessonId,
        moduleCompleted: state.moduleCompleted,
        sound: state.sound,
        volume: state.volume,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<PersistedProgress>;
        const completedLessons = persistedState.completedLessons ?? current.completedLessons;
        const totals = totalsForCompleted(completedLessons);
        const activeLessonId =
          persistedState.activeLessonId && persistedState.activeLessonId in loopForestLessons
            ? persistedState.activeLessonId
            : current.activeLessonId;

        return {
          ...current,
          ...persistedState,
          ...totals,
          activeLessonId,
          completedLessons,
          lessonProgressById: {
            ...emptyLessonProgress(),
            ...(persistedState.lessonProgressById ?? {}),
          },
          lessonProgress: persistedState.lessonProgressById?.[activeLessonId] ?? persistedState.lessonProgress ?? 0,
        };
      },
    },
  ),
);
