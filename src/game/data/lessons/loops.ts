import { loopForestLessons } from "./loopForestFundamentals";

const loopConfig = loopForestLessons["loops-01"].puzzleConfig as {
  command: string;
  correctRepeat: number;
};

export const loopLesson = {
  id: "loops-01",
  title: "Loop Grove",
  shortName: "Loops",
  prompt: loopForestLessons["loops-01"].concept,
  hint: loopForestLessons["loops-01"].hint,
  command: loopConfig.command,
  correctRepeat: loopConfig.correctRepeat,
  explanation: loopForestLessons["loops-01"].successExplanation,
  python: loopForestLessons["loops-01"].codeExamples.python,
  javascript: loopForestLessons["loops-01"].codeExamples.javascript,
};
