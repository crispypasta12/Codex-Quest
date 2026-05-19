import type { QuestState } from "@/lib/store";

export type QuestObjective = {
  state: QuestState;
  label: string;
};

export const loopForestQuest = {
  id: "teach-berry-bot-to-loop",
  title: "Teach the Berry Bot to Loop",
  objectives: [
    { state: "TALK_TO_BYTE", label: "Talk to Byte" },
    { state: "FIND_BERRY_BOT", label: "Find the broken Berry Bot" },
    { state: "LEARN_LOOP", label: "Learn how loops work" },
    { state: "SOLVE_LOOP_PUZZLE", label: "Use a loop to collect 5 berries" },
    { state: "RETURN_TO_BYTE", label: "Return to Byte" },
  ] satisfies QuestObjective[],
};

export const questOrder: QuestState[] = [
  "TALK_TO_BYTE",
  "FIND_BERRY_BOT",
  "LEARN_LOOP",
  "SOLVE_LOOP_PUZZLE",
  "WATCH_BOT_WORK",
  "RETURN_TO_BYTE",
  "COMPLETED",
];

export function getCurrentObjective(state: QuestState) {
  if (state === "NOT_STARTED") return loopForestQuest.objectives[0];
  if (state === "WATCH_BOT_WORK") return loopForestQuest.objectives[3];
  if (state === "COMPLETED") return loopForestQuest.objectives.at(-1);
  return loopForestQuest.objectives.find((objective) => objective.state === state) ?? loopForestQuest.objectives[0];
}

export function isObjectiveDone(objective: QuestObjective, state: QuestState) {
  if (state === "COMPLETED") return true;
  const currentIndex = questOrder.indexOf(state);
  const objectiveIndex = questOrder.indexOf(objective.state);
  return objectiveIndex >= 0 && currentIndex > objectiveIndex;
}
