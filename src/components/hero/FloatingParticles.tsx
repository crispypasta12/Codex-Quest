import type React from "react";

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function FloatingParticles() {
  const rng = mulberry32(1729);
  const parts = Array.from({ length: 24 }).map((_, i) => ({
    x: rng() * 100,
    delay: rng() * 8,
    duration: 14 + rng() * 10,
    size: 1 + rng() * 1.5,
    color: ["#f5b04c", "#ffd685", "#7fc4bd", "#b594d9"][i % 4],
    drift: rng() > 0.5 ? "40px" : "-40px",
  }));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 3,
      }}
    >
      {parts.map((p, i) => (
        <div
          key={i}
          style={
            {
              position: "absolute",
              left: `${p.x}%`,
              bottom: "-10px",
              width: `${p.size * 3}px`,
              height: `${p.size * 3}px`,
              background: p.color,
              borderRadius: "1px",
              opacity: 0.6,
              boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
              animation: `floatUp${i} ${p.duration}s linear ${p.delay}s infinite`,
            } as React.CSSProperties
          }
        />
      ))}
      <style>
        {parts
          .map(
            (p, i) => `
              @keyframes floatUp${i} {
                0% { transform: translateY(0) translateX(0); opacity: 0; }
                10% { opacity: 0.7; }
                90% { opacity: 0.7; }
                100% { transform: translateY(-110vh) translateX(${p.drift}); opacity: 0; }
              }
            `,
          )
          .join("\n")}
      </style>
    </div>
  );
}
