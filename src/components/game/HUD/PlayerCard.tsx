"use client";

import { useGameStore } from "@/lib/store";

export function PlayerCard() {
  const xp = useGameStore((state) => state.xp);
  const level = useGameStore((state) => state.level);
  const badges = useGameStore((state) => state.badges);
  const xpInLevel = Math.min(100, xp % 100 || (xp > 0 ? 100 : 0));

  return (
    <div className="hud-card hud-player">
      <div className="hud-avatar">L</div>
      <div className="hud-player-info">
        <div className="hud-name">
          <span className="name">Learner</span>
          <span className="level">Lv. {level}</span>
        </div>
        <div className="xp-bar" aria-label={`${xp} experience points`}>
          <div className="xp-fill" style={{ width: `${xpInLevel}%` }} />
        </div>
        <div className="hud-xp-meta">
          <span><span className="pixel-icon icon-xp" />{xp} XP</span>
          <span><span className="pixel-icon icon-complete" />{badges.length ? `${badges.length} badge${badges.length === 1 ? "" : "s"}` : "No badge yet"}</span>
        </div>
      </div>
    </div>
  );
}
