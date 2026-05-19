"use client";

import { useCallback, useEffect, useState } from "react";

import { useGameStore } from "@/lib/store";

import { Portrait } from "./Portrait";
import { useTypewriter } from "./useTypewriter";

export function DialogueBox() {
  const dialogue = useGameStore((state) => state.activeDialogue);
  const closeDialogue = useGameStore((state) => state.closeDialogue);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    setLineIndex(0);
  }, [dialogue?.id]);

  const line = dialogue?.lines[lineIndex];
  const { visibleText, isTyping, skip } = useTypewriter(line?.text ?? "");

  const finishDialogue = useCallback(() => {
    if (!dialogue) return;
    closeDialogue();
    window.dispatchEvent(
      new CustomEvent("loopforest:dialogue-complete", {
        detail: { id: dialogue.id },
      }),
    );
  }, [closeDialogue, dialogue]);

  const advance = useCallback(() => {
    if (!dialogue) return;
    if (isTyping) {
      skip();
      return;
    }
    if (lineIndex < dialogue.lines.length - 1) {
      setLineIndex((value) => value + 1);
      return;
    }
    finishDialogue();
  }, [dialogue, finishDialogue, isTyping, lineIndex, skip]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!dialogue) return;
      if (event.key === " " || event.key === "Enter" || event.key.toLowerCase() === "e") {
        event.preventDefault();
        advance();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        finishDialogue();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [advance, dialogue, finishDialogue]);

  if (!dialogue || !line) return null;

  return (
    <div className="dialogue-root" role="dialog" aria-label={`${line.speaker} dialogue`}>
      <div className="dialogue-box" onClick={advance}>
        <div className="dialogue-portrait">
          <Portrait type={line.portrait} />
        </div>
        <div className="dialogue-body">
          <div className="dialogue-name">
            {line.speaker}
            {line.role ? <span className="role">{line.role}</span> : null}
          </div>
          <div className="dialogue-text">
            {visibleText}
            {isTyping ? <span className="caret" /> : null}
          </div>
          <div className="dialogue-actions">
            <span>
              {lineIndex + 1}/{dialogue.lines.length}
            </span>
            <button className="dialogue-continue" type="button" onClick={advance}>
              {isTyping ? "Skip" : "Continue"}
              <span className="arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
