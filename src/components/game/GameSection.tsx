import { PhaserCanvas } from "./PhaserCanvas";

export function GameSection() {
  return (
    <section id="game-section" className="game-section">
      <div className="game-section-inner">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-ui text-[10px] uppercase tracking-[0.14em] text-teal-bright">
              Chapter 01
            </p>
            <h2 className="font-title text-[28px] leading-none text-ink">
              Loop Forest
            </h2>
          </div>
          <p className="font-ui text-[10px] uppercase tracking-[0.12em] text-ink-mute">
            World render scaffold · WASD / arrows to move
          </p>
        </header>
        <div className="game-frame">
          <PhaserCanvas />
        </div>
      </div>
    </section>
  );
}
