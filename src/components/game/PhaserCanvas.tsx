"use client";

import { useEffect, useRef } from "react";

export function PhaserCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: import("phaser").Game | undefined;
    let cancelled = false;

    async function boot() {
      const Phaser = await import("phaser");
      const { LoopForestScene } = await import("@/phaser/LoopForestScene");

      if (!hostRef.current || cancelled) return;

      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: hostRef.current,
        width: 960,
        height: 600,
        backgroundColor: "#0d1a08",
        pixelArt: true,
        roundPixels: true,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: 960,
          height: 600,
        },
        scene: [LoopForestScene],
      });
    }

    boot();

    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  }, []);

  return <div ref={hostRef} className="game-canvas phaser-canvas-host" />;
}
