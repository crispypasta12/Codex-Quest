function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function StarField() {
  const rng = mulberry32(404);
  const stars = Array.from({ length: 80 }).map(() => ({
    x: rng() * 100,
    y: rng() * 100,
    size: rng() > 0.8 ? 2 : 1,
    delay: rng() * 5,
    duration: 2 + rng() * 4,
    lowOpacity: 0.2 + rng() * 0.3,
  }));

  return (
    <svg className="hero-stars" viewBox="0 0 100 100" preserveAspectRatio="none">
      {stars.map((s, i) => (
        <rect
          key={i}
          x={s.x}
          y={s.y}
          width={s.size * 0.15}
          height={s.size * 0.15}
          fill="#f4e8d0"
        >
          <animate
            attributeName="opacity"
            values={`${s.lowOpacity};1;${s.lowOpacity}`}
            dur={`${s.duration}s`}
            repeatCount="indefinite"
            begin={`${s.delay}s`}
          />
        </rect>
      ))}
    </svg>
  );
}
