"use client";

import { useGameStore } from "@/lib/store";

export function InteractionHint() {
  const hint = useGameStore((state) => state.interactionHint);
  const blocked = useGameStore(
    (state) => state.activeDialogue || state.puzzleOpen || state.pauseOpen || state.onboardingOpen,
  );

  if (!hint || blocked) return null;

  return (
    <div className="interaction-hint">
      <span className="kbd">E</span>
      <span>{hint.action}</span>
      <span>{hint.label}</span>
    </div>
  );
}
