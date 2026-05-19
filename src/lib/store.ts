import { create } from "zustand";

type QuestStep = "find_byte" | "go_to_berrybot" | "in_loop_panel" | "running_loop" | "done";

type GameState = {
  questStep: QuestStep;
  xp: number;
  level: number;
  sound: boolean;
  setQuestStep: (questStep: QuestStep) => void;
};

export const useGameStore = create<GameState>((set) => ({
  questStep: "find_byte",
  xp: 0,
  level: 1,
  sound: true,
  setQuestStep: (questStep) => set({ questStep }),
}));
