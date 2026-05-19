import type { DialogueSequence } from "@/lib/store";

export type LessonId = "sequence-01" | "loops-01" | "conditions-01" | "nested-loops-01";

export type PuzzleType = "sequence_ordering" | "simple_loop" | "conditional_logic" | "nested_loop";

export type LessonStatus = "Locked" | "Available" | "In Progress" | "Completed";

export type LessonReward = {
  xp: number;
  badges: string[];
  stickers?: string[];
  unlocks?: LessonId;
};

export type LessonDefinition = {
  id: LessonId;
  order: number;
  title: string;
  boardName: string;
  worldName: string;
  concept: string;
  locationName: string;
  unlockRequirement?: LessonId;
  lockedMessage?: string;
  npcDialogue: DialogueSequence;
  objectives: string[];
  puzzleType: PuzzleType;
  puzzleConfig: Record<string, unknown>;
  successExplanation: string;
  codeExamples: {
    python: string[];
    javascript: string[];
  };
  hint: string;
  rewards: LessonReward;
};

export const lessonOrder: LessonId[] = ["sequence-01", "loops-01", "conditions-01", "nested-loops-01"];

export const loopForestLessons: Record<LessonId, LessonDefinition> = {
  "sequence-01": {
    id: "sequence-01",
    order: 1,
    title: "Sequence Trail",
    boardName: "Sequence Trail",
    worldName: "Lantern Path",
    concept: "Commands run in order. Changing the order changes the result.",
    locationName: "Lantern Path",
    npcDialogue: {
      id: "lesson-intro-sequence-01",
      lines: [
        {
          speaker: "Byte",
          role: "Robot Teacher",
          portrait: "byte",
          text: "Before we learn loops, we need to understand sequence.",
        },
        {
          speaker: "Byte",
          role: "Robot Teacher",
          portrait: "byte",
          text: "A sequence is just a list of steps.",
        },
        {
          speaker: "Byte",
          role: "Robot Teacher",
          portrait: "byte",
          text: "Computers follow instructions exactly in the order we give them.",
        },
        {
          speaker: "Byte",
          role: "Robot Teacher",
          portrait: "byte",
          text: "If the steps are mixed up, the result can go wrong.",
        },
      ],
    },
    objectives: [
      "Talk to Byte at Sequence Trail",
      "Order the seed delivery commands",
      "Run the delivery bot",
      "Earn the Sequence Sprout Badge",
    ],
    puzzleType: "sequence_ordering",
    puzzleConfig: {
      correctCommands: [
        "Pick Up Seed",
        "Move Forward",
        "Move Forward",
        "Turn Right",
        "Move Forward",
        "Plant Seed",
      ],
      starterCommands: [
        "Move Forward",
        "Plant Seed",
        "Pick Up Seed",
        "Turn Right",
        "Move Forward",
        "Move Forward",
      ],
    },
    hint: "Put pickup before planting, then guide the bot two steps forward, right, and one more step to the planter.",
    successExplanation:
      "Great! You built a sequence. The bot followed each command one after another, exactly in order.",
    codeExamples: {
      python: [
        "pick_up_seed()",
        "move_forward()",
        "move_forward()",
        "turn_right()",
        "move_forward()",
        "plant_seed()",
      ],
      javascript: [
        "pickUpSeed();",
        "moveForward();",
        "moveForward();",
        "turnRight();",
        "moveForward();",
        "plantSeed();",
      ],
    },
    rewards: {
      xp: 40,
      badges: ["Sequence Sprout Badge"],
      unlocks: "loops-01",
    },
  },
  "loops-01": {
    id: "loops-01",
    order: 2,
    title: "Loop Grove",
    boardName: "Loop Grove",
    worldName: "Berry Hollow",
    concept: "Loops repeat a command or group of commands.",
    locationName: "Berry Hollow",
    unlockRequirement: "sequence-01",
    lockedMessage: "Byte says: Let's build a sequence first.",
    npcDialogue: {
      id: "lesson-intro-loops-01",
      lines: [
        {
          speaker: "Berry Bot",
          role: "Collector",
          portrait: "bot",
          text: "beep... berry routine missing... collect berry... collect berry... collect berry...",
        },
        {
          speaker: "Byte",
          role: "Robot Teacher",
          portrait: "byte",
          text: "See the problem? The bot is trying to list the same command over and over.",
        },
        {
          speaker: "Byte",
          role: "Robot Teacher",
          portrait: "byte",
          text: "Let's use a loop: repeat 5 times, collect berry. Then press Run and watch the pattern happen.",
        },
      ],
    },
    objectives: [
      "Open Loop Grove",
      "Set Repeat 5 Times",
      "Collect every berry",
      "Earn the Loop Apprentice Badge",
    ],
    puzzleType: "simple_loop",
    puzzleConfig: {
      command: "Collect Berry",
      correctRepeat: 5,
      options: [3, 5, 7],
    },
    hint: "The forest has 5 berry bushes. Choose Repeat 5 Times, then run Collect Berry once inside the loop.",
    successExplanation:
      "You used a loop. Instead of writing the same command five times, you repeated one instruction.",
    codeExamples: {
      python: ["for i in range(5):", "    collect_berry()"],
      javascript: ["for (let i = 0; i < 5; i++) {", "    collectBerry();", "}"],
    },
    rewards: {
      xp: 50,
      badges: ["Loop Apprentice Badge"],
      stickers: ["Berry Bot Sticker"],
      unlocks: "conditions-01",
    },
  },
  "conditions-01": {
    id: "conditions-01",
    order: 3,
    title: "Conditional Crossing",
    boardName: "Conditional Crossing",
    worldName: "Forked Bridge",
    concept: "Conditions let programs make decisions.",
    locationName: "Forked Bridge",
    unlockRequirement: "loops-01",
    lockedMessage: "Byte says: Let's master loops first.",
    npcDialogue: {
      id: "lesson-intro-conditions-01",
      lines: [
        {
          speaker: "Byte",
          role: "Robot Teacher",
          portrait: "byte",
          text: "Now your robot can follow steps and repeat actions.",
        },
        {
          speaker: "Byte",
          role: "Robot Teacher",
          portrait: "byte",
          text: "But what if it needs to make a choice?",
        },
        {
          speaker: "Byte",
          role: "Robot Teacher",
          portrait: "byte",
          text: "That is where conditions help.",
        },
        {
          speaker: "Byte",
          role: "Robot Teacher",
          portrait: "byte",
          text: "A condition asks a question, like: Is the basket full?",
        },
        {
          speaker: "Byte",
          role: "Robot Teacher",
          portrait: "byte",
          text: "If the answer is yes, the robot does one thing. If not, it does something else.",
        },
      ],
    },
    objectives: [
      "Open Conditional Crossing",
      "Build an if/else rule",
      "Fill the basket to 3/3",
      "Earn the Condition Compass Badge",
    ],
    puzzleType: "conditional_logic",
    puzzleConfig: {
      capacity: 3,
      condition: "Basket is full",
      correctThen: "Return Home",
      correctElse: "Collect Berry",
      actions: ["Return Home", "Collect Berry"],
    },
    hint: "When the basket is full, the bot should return home. Before that, it should collect another berry.",
    successExplanation:
      "Nice! You used a condition. The bot checked whether the basket was full. When it became true, the bot returned home.",
    codeExamples: {
      python: ["if basket_is_full():", "    return_home()", "else:", "    collect_berry()"],
      javascript: ["if (basketIsFull()) {", "    returnHome();", "} else {", "    collectBerry();", "}"],
    },
    rewards: {
      xp: 60,
      badges: ["Condition Compass Badge"],
      unlocks: "nested-loops-01",
    },
  },
  "nested-loops-01": {
    id: "nested-loops-01",
    order: 4,
    title: "Nested Berry Fields",
    boardName: "Nested Berry Fields",
    worldName: "Harvest Rows",
    concept: "A nested loop is a loop inside another loop.",
    locationName: "Harvest Rows",
    unlockRequirement: "conditions-01",
    lockedMessage: "Byte says: Cross the condition bridge first.",
    npcDialogue: {
      id: "lesson-intro-nested-loops-01",
      lines: [
        {
          speaker: "Byte",
          role: "Robot Teacher",
          portrait: "byte",
          text: "You have learned sequences, loops, and conditions.",
        },
        {
          speaker: "Byte",
          role: "Robot Teacher",
          portrait: "byte",
          text: "Now let's combine repetition with structure.",
        },
        {
          speaker: "Byte",
          role: "Robot Teacher",
          portrait: "byte",
          text: "A nested loop is a loop inside another loop.",
        },
        {
          speaker: "Byte",
          role: "Robot Teacher",
          portrait: "byte",
          text: "The outer loop can move through rows.",
        },
        {
          speaker: "Byte",
          role: "Robot Teacher",
          portrait: "byte",
          text: "The inner loop can collect berries in each row.",
        },
      ],
    },
    objectives: [
      "Open Nested Berry Fields",
      "Set the outer loop to 3 rows",
      "Set the inner loop to 5 berries",
      "Earn the Nested Loop Gardener Badge",
    ],
    puzzleType: "nested_loop",
    puzzleConfig: {
      rows: 3,
      berriesPerRow: 5,
    },
    hint: "Use the outer loop for 3 rows. Inside it, repeat Collect Berry 5 times, then move to the next row.",
    successExplanation:
      "Excellent! You used a nested loop. The outer loop handled each row, and the inner loop collected berries inside that row.",
    codeExamples: {
      python: [
        "for row in range(3):",
        "    for berry in range(5):",
        "        collect_berry()",
        "    move_to_next_row()",
      ],
      javascript: [
        "for (let row = 0; row < 3; row++) {",
        "    for (let berry = 0; berry < 5; berry++) {",
        "        collectBerry();",
        "    }",
        "    moveToNextRow();",
        "}",
      ],
    },
    rewards: {
      xp: 80,
      badges: ["Nested Loop Gardener Badge"],
    },
  },
};

export const lessonList = lessonOrder.map((id) => loopForestLessons[id]);

export function getLesson(id: LessonId) {
  return loopForestLessons[id];
}

export function getLessonWorldName(id: LessonId) {
  return loopForestLessons[id].worldName;
}

export function getNextLesson(id: LessonId) {
  const index = lessonOrder.indexOf(id);
  return index >= 0 ? loopForestLessons[lessonOrder[index + 1]] : undefined;
}

export function isLessonUnlocked(lesson: LessonDefinition, completedLessons: string[]) {
  return !lesson.unlockRequirement || completedLessons.includes(lesson.unlockRequirement);
}

export function getLessonStatus(
  lesson: LessonDefinition,
  completedLessons: string[],
  activeLessonId?: LessonId,
  activeProgress = 0,
): LessonStatus {
  if (completedLessons.includes(lesson.id)) return "Completed";
  if (!isLessonUnlocked(lesson, completedLessons)) return "Locked";
  if (activeLessonId === lesson.id && activeProgress > 0) return "In Progress";
  return "Available";
}
