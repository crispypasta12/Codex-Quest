"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export function useTypewriter(text: string, speed = 22) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index >= text.length) return;
    const timeout = window.setTimeout(() => setIndex((value) => value + 1), speed);
    return () => window.clearTimeout(timeout);
  }, [index, speed, text.length]);

  const skip = useCallback(() => setIndex(text.length), [text.length]);
  const visibleText = useMemo(() => text.slice(0, index), [index, text]);

  return {
    visibleText,
    isTyping: index < text.length,
    skip,
  };
}
