// hero.jsx — landing hero with animated pixel bookshelf, lanterns, particles.

const { useState, useEffect, useRef, useMemo } = React;

// ---------- Book data ----------
const BOOKS = [
  {
    id: 'loops',
    title: 'Loops',
    desc: 'Repeat. Iterate. Echo. The first spell every programmer learns.',
    chapter: 'Ch. 1',
    pages: 24,
    color: '#f5b04c',
    edge: '#b07020',
    glow: '#ffd685',
    spine: 'loops',
    height: 110,
    width: 28,
    tilt: -3,
  },
  {
    id: 'functions',
    title: 'Functions',
    desc: 'Wrap intent into a name and call it forever.',
    chapter: 'Ch. 2',
    pages: 31,
    color: '#5b9b94',
    edge: '#2d6b62',
    glow: '#7fc4bd',
    spine: 'lambda',
    height: 132,
    width: 26,
    tilt: 2,
  },
  {
    id: 'algorithms',
    title: 'Algorithms',
    desc: 'Recipes for thinking. Patterns that move mountains.',
    chapter: 'Ch. 3',
    pages: 48,
    color: '#e85a6e',
    edge: '#a02a3a',
    glow: '#ff8a9a',
    spine: 'maze',
    height: 144,
    width: 32,
    tilt: -1,
  },
  {
    id: 'datastructures',
    title: 'Data Structures',
    desc: 'How memory remembers shape. Trees, graphs, lists, dreams.',
    chapter: 'Ch. 4',
    pages: 42,
    color: '#8b6db0',
    edge: '#5a3f80',
    glow: '#b594d9',
    spine: 'tree',
    height: 138,
    width: 30,
    tilt: 4,
  },
  {
    id: 'networking',
    title: 'Networking',
    desc: 'Voices across the wires. Whispers between machines.',
    chapter: 'Ch. 5',
    pages: 36,
    color: '#7faedb',
    edge: '#4a76b0',
    glow: '#cce7ff',
    spine: 'nodes',
    height: 120,
    width: 28,
    tilt: -2,
  },
  {
    id: 'memory',
    title: 'Memory',
    desc: 'A grid of small rooms holding everything you know.',
    chapter: 'Ch. 6',
    pages: 28,
    color: '#c4905e',
    edge: '#7a4a2a',
    glow: '#d49a5a',
    spine: 'grid',
    height: 128,
    width: 30,
    tilt: 1,
  },
  {
    id: 'security',
    title: 'Security',
    desc: 'Locks, keys, and the quiet art of saying no.',
    chapter: 'Ch. 7',
    pages: 33,
    color: '#3a6b3f',
    edge: '#1f3d2a',
    glow: '#6ba85a',
    spine: 'lock',
    height: 116,
    width: 26,
    tilt: -3,
  },
];

// ---------- Spine symbol renderers ----------
function SpineSymbol({ kind, color }) {
  const c = color || '#ffd685';
  const props = { fill: c, opacity: 0.92 };
  switch (kind) {
    case 'loops':
      // infinity using two circles
      return (
        <g>
          <rect x={-5} y={-2} width={2} height={2} {...props} />
          <rect x={-7} y={0} width={2} height={2} {...props} />
          <rect x={-5} y={2} width={2} height={2} {...props} />
          <rect x={-3} y={0} width={2} height={2} {...props} />
          <rect x={-1} y={-2} width={2} height={2} {...props} />
          <rect x={1} y={0} width={2} height={2} {...props} />
          <rect x={-1} y={2} width={2} height={2} {...props} />
          <rect x={3} y={0} width={2} height={2} {...props} />
          <rect x={5} y={-2} width={2} height={2} {...props} />
          <rect x={5} y={2} width={2} height={2} {...props} />
        </g>
      );
    case 'lambda':
      return (
        <g>
          <rect x={-4} y={-5} width={2} height={2} {...props} />
          <rect x={-2} y={-3} width={2} height={2} {...props} />
          <rect x={0} y={-1} width={2} height={2} {...props} />
          <rect x={2} y={1} width={2} height={2} {...props} />
          <rect x={4} y={3} width={2} height={2} {...props} />
          <rect x={-2} y={1} width={2} height={2} {...props} />
          <rect x={-4} y={3} width={2} height={2} {...props} />
        </g>
      );
    case 'maze':
      return (
        <g>
          {[[-6,-5],[-4,-5],[-2,-5],[0,-5],[2,-5],[4,-5],
            [-6,-3],[4,-3],
            [-6,-1],[-4,-1],[-2,-1],[0,-1],[4,-1],
            [-6,1],[0,1],[4,1],
            [-6,3],[-4,3],[-2,3],[0,3],[2,3],[4,3]].map(([x,y],i) => (
            <rect key={i} x={x} y={y} width={2} height={2} {...props} />
          ))}
        </g>
      );
    case 'tree':
      return (
        <g>
          <rect x={-1} y={-6} width={2} height={2} {...props} />
          <rect x={-1} y={-4} width={2} height={2} {...props} />
          <rect x={-3} y={-2} width={2} height={2} {...props} />
          <rect x={1} y={-2} width={2} height={2} {...props} />
          <rect x={-5} y={0} width={2} height={2} {...props} />
          <rect x={-1} y={0} width={2} height={2} {...props} />
          <rect x={3} y={0} width={2} height={2} {...props} />
          <rect x={-5} y={2} width={2} height={2} {...props} />
          <rect x={-1} y={2} width={2} height={2} {...props} />
          <rect x={3} y={2} width={2} height={2} {...props} />
        </g>
      );
    case 'nodes':
      return (
        <g>
          <rect x={-5} y={-5} width={3} height={3} {...props} />
          <rect x={2} y={-5} width={3} height={3} {...props} />
          <rect x={-2} y={0} width={3} height={3} {...props} />
          <rect x={-5} y={4} width={3} height={3} {...props} />
          <rect x={2} y={4} width={3} height={3} {...props} />
          {/* connecting dots */}
          <rect x={-2} y={-2} width={1} height={1} {...props} opacity={0.5} />
          <rect x={0} y={-1} width={1} height={1} {...props} opacity={0.5} />
          <rect x={-1} y={3} width={1} height={1} {...props} opacity={0.5} />
          <rect x={1} y={2} width={1} height={1} {...props} opacity={0.5} />
        </g>
      );
    case 'grid':
      return (
        <g>
          {[0,1,2,3].map(r => [0,1,2,3].map(c => (
            <rect key={`${r}-${c}`} x={-5 + c*3} y={-5 + r*3} width={2} height={2} {...props} opacity={(r+c)%2 ? 0.9 : 0.4} />
          )))}
        </g>
      );
    case 'lock':
      return (
        <g>
          <rect x={-3} y={-5} width={2} height={2} {...props} />
          <rect x={-1} y={-5} width={2} height={2} {...props} />
          <rect x={1} y={-5} width={2} height={2} {...props} />
          <rect x={-3} y={-3} width={2} height={2} {...props} />
          <rect x={1} y={-3} width={2} height={2} {...props} />
          <rect x={-5} y={-1} width={10} height={2} {...props} />
          <rect x={-5} y={1} width={10} height={2} {...props} />
          <rect x={-5} y={3} width={10} height={2} {...props} />
          <rect x={-1} y={0} width={2} height={3} fill="#1a1408" />
        </g>
      );
    default: return null;
  }
}

// ---------- Single book ----------
function Book({ book, x, baseY, onHover, onLeave }) {
  const ref = useRef(null);
  const { width: w, height: h, color, edge, glow, tilt, spine } = book;

  return (
    <g
      className="book-group"
      style={{ '--book-glow': glow }}
      transform={`translate(${x}, ${baseY - h}) rotate(${tilt}, ${w/2}, ${h})`}
      onMouseEnter={(e) => onHover(book, e)}
      onMouseLeave={onLeave}
      onMouseMove={(e) => onHover(book, e)}
    >
      {/* Shadow under book */}
      <rect x={2} y={h - 2} width={w - 2} height={3} fill="rgba(0,0,0,0.4)" />

      {/* Book body */}
      <rect x={0} y={0} width={w} height={h} fill={edge} />
      <rect x={1} y={1} width={w - 2} height={h - 2} fill={color} />

      {/* Spine details - top & bottom bands */}
      <rect x={1} y={6} width={w - 2} height={2} fill={edge} />
      <rect x={1} y={h - 8} width={w - 2} height={2} fill={edge} />

      {/* Page edge highlight on right side */}
      <rect x={w - 2} y={1} width={1} height={h - 2} fill="rgba(255,255,255,0.15)" />

      {/* Spine title - vertical */}
      <text
        x={w / 2}
        y={h / 2}
        fill={glow}
        fontFamily="Pixelify Sans, monospace"
        fontSize={Math.min(10, w * 0.42)}
        textAnchor="middle"
        transform={`rotate(-90, ${w / 2}, ${h / 2})`}
        style={{ letterSpacing: '0.5px' }}
      >
        {book.title.toUpperCase()}
      </text>

      {/* Bottom symbol */}
      <g transform={`translate(${w / 2}, ${h - 16})`}>
        <SpineSymbol kind={spine} color={glow} />
      </g>

      {/* Sparkle/glow dots that animate */}
      <g className="book-sparkles" opacity={0.0}>
        <circle cx={w/2 - 6} cy={20} r={1.5} fill={glow}>
          <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite" begin={`${book.id.length * 0.3}s`} />
        </circle>
        <circle cx={w/2 + 5} cy={40} r={1.5} fill={glow}>
          <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite" begin={`${book.id.length * 0.5}s`} />
        </circle>
      </g>
    </g>
  );
}

// ---------- The bookshelf scene ----------
function Bookshelf({ onCTA }) {
  const [tooltip, setTooltip] = useState(null);
  const sceneRef = useRef(null);

  const handleHover = (book, e) => {
    if (!sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    setTooltip({
      book,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Shelf geometry — three shelves
  const shelfWidth = 360;
  const shelfX = 30;
  const shelfYs = [120, 250, 380]; // top y of each shelf

  // Distribute books across shelves
  const shelves = [
    [BOOKS[0], BOOKS[1], BOOKS[2]],       // top shelf: Loops, Functions, Algorithms
    [BOOKS[3], BOOKS[4]],                 // middle: Data Structures, Networking
    [BOOKS[5], BOOKS[6]],                 // bottom: Memory, Security
  ];

  return (
    <div className="bookshelf-scene" ref={sceneRef}>
      <svg viewBox="0 0 440 640" preserveAspectRatio="xMidYMid meet" shapeRendering="crispEdges">
        <defs>
          <linearGradient id="wood-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a4a2a" />
            <stop offset="100%" stopColor="#4a2f1e" />
          </linearGradient>
          <linearGradient id="wood-edge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9c6638" />
            <stop offset="100%" stopColor="#5a3a1e" />
          </linearGradient>
          <radialGradient id="warm-light" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#f5b04c" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#f5b04c" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#f5b04c" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lantern-light" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffd685" stopOpacity="0.7" />
            <stop offset="40%" stopColor="#f5b04c" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f5b04c" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient warm glow behind shelf */}
        <ellipse cx={220} cy={300} rx={260} ry={300} fill="url(#warm-light)" />

        {/* Magical glow halo behind books */}
        {shelfYs.map((sy, i) => (
          <ellipse key={i} cx={220} cy={sy + 10} rx={180} ry={50} fill="url(#warm-light)" opacity={0.6} />
        ))}

        {/* === Bookshelf frame === */}
        {/* Outer frame */}
        <rect x={shelfX - 10} y={70} width={shelfWidth + 20} height={520} fill="#3a2412" />
        <rect x={shelfX - 8} y={72} width={shelfWidth + 16} height={516} fill="url(#wood-grad)" />

        {/* Back panel */}
        <rect x={shelfX} y={80} width={shelfWidth} height={500} fill="#2a1810" />

        {/* Wood grain lines */}
        {[100, 180, 260, 340, 420, 500].map((y, i) => (
          <rect key={i} x={shelfX + 2} y={y} width={shelfWidth - 4} height={1} fill="#1a1008" opacity={0.5} />
        ))}

        {/* Shelf planks (the ledges books sit on) */}
        {[230, 360, 490, 580].map((y, i) => (
          <g key={i}>
            <rect x={shelfX - 4} y={y} width={shelfWidth + 8} height={10} fill="#5a3a1e" />
            <rect x={shelfX - 4} y={y} width={shelfWidth + 8} height={3} fill="#7a4a2a" />
            <rect x={shelfX - 4} y={y + 8} width={shelfWidth + 8} height={2} fill="#3a2412" />
          </g>
        ))}

        {/* Top cornice */}
        <rect x={shelfX - 14} y={66} width={shelfWidth + 28} height={6} fill="#5a3a1e" />
        <rect x={shelfX - 14} y={72} width={shelfWidth + 28} height={3} fill="#3a2412" />
        {/* Decorative top trim */}
        <g>
          {Array.from({length: 8}).map((_, i) => (
            <rect key={i} x={shelfX + 20 + i*45} y={56} width={20} height={10} fill="#5a3a1e" />
          ))}
        </g>

        {/* Magic floating sparkles inside shelf */}
        <g>
          {Array.from({length: 12}).map((_, i) => {
            const cx = 60 + ((i * 37) % 340);
            const cy = 100 + ((i * 83) % 460);
            return (
              <circle key={i} cx={cx} cy={cy} r={1} fill="#ffd685">
                <animate attributeName="opacity" values="0;0.9;0" dur={`${3 + (i%3)}s`} repeatCount="indefinite" begin={`${i * 0.4}s`} />
                <animate attributeName="cy" values={`${cy};${cy - 20};${cy}`} dur={`${4 + (i%3)}s`} repeatCount="indefinite" begin={`${i * 0.4}s`} />
              </circle>
            );
          })}
        </g>

        {/* === Books === */}
        {/* Shelf 1 (top) — books rest on plank y=230 */}
        {(() => {
          let cursorX = shelfX + 30;
          return shelves[0].map((book, i) => {
            const el = (
              <Book key={book.id} book={book} x={cursorX} baseY={230}
                onHover={handleHover} onLeave={() => setTooltip(null)} />
            );
            cursorX += book.width + 8;
            return el;
          });
        })()}
        {/* A small decoration on shelf 1 - tiny potted plant */}
        <g transform="translate(280, 195)">
          <rect x={0} y={20} width={20} height={14} fill="#5a3a1e" />
          <rect x={1} y={21} width={18} height={3} fill="#7a4a2a" />
          {/* leaves */}
          <rect x={4} y={4} width={4} height={16} fill="#3a6b3f" />
          <rect x={8} y={2} width={4} height={18} fill="#4a7d34" />
          <rect x={12} y={6} width={4} height={14} fill="#3a6b3f" />
          <rect x={6} y={0} width={2} height={4} fill="#6ba84a" />
          <rect x={10} y={-2} width={2} height={4} fill="#6ba84a" />
        </g>

        {/* Shelf 2 (middle) — books rest on plank y=360 */}
        {(() => {
          let cursorX = shelfX + 40;
          return shelves[1].map((book, i) => {
            const el = (
              <Book key={book.id} book={book} x={cursorX} baseY={360}
                onHover={handleHover} onLeave={() => setTooltip(null)} />
            );
            cursorX += book.width + 10;
            return el;
          });
        })()}
        {/* Crystal / orb decoration on shelf 2 */}
        <g transform="translate(280, 320)">
          <rect x={4} y={32} width={12} height={6} fill="#5a3a1e" />
          <rect x={3} y={28} width={14} height={4} fill="#7a4a2a" />
          {/* orb */}
          <g>
            <circle cx={10} cy={20} r={9} fill="#5b9b94" />
            <circle cx={10} cy={20} r={9} fill="#7fc4bd" opacity={0.6}>
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx={7} cy={17} r={2} fill="#b8e6e1" opacity={0.9} />
            <circle cx={10} cy={20} r={11} fill="none" stroke="#7fc4bd" strokeWidth={0.5} opacity={0.4}>
              <animate attributeName="r" values="9;13;9" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
            </circle>
          </g>
        </g>

        {/* Shelf 3 (bottom) — books rest on plank y=490 */}
        {(() => {
          let cursorX = shelfX + 40;
          return shelves[2].map((book, i) => {
            const el = (
              <Book key={book.id} book={book} x={cursorX} baseY={490}
                onHover={handleHover} onLeave={() => setTooltip(null)} />
            );
            cursorX += book.width + 10;
            return el;
          });
        })()}
        {/* Old scroll on shelf 3 */}
        <g transform="translate(270, 462)">
          <rect x={0} y={4} width={36} height={20} fill="#c98a52" />
          <rect x={0} y={4} width={36} height={2} fill="#9c6638" />
          <rect x={0} y={22} width={36} height={2} fill="#9c6638" />
          <rect x={-2} y={2} width={4} height={24} fill="#7a4a2a" />
          <rect x={34} y={2} width={4} height={24} fill="#7a4a2a" />
          {/* squiggle lines */}
          <rect x={4} y={9} width={16} height={1} fill="#5a3a1e" />
          <rect x={4} y={13} width={20} height={1} fill="#5a3a1e" />
          <rect x={4} y={17} width={12} height={1} fill="#5a3a1e" />
        </g>

        {/* === Lanterns on either side === */}
        {[20, 410].map((lx, i) => (
          <g key={i} transform={`translate(${lx}, 90)`}>
            <ellipse cx={10} cy={20} rx={36} ry={50} fill="url(#lantern-light)">
              <animate attributeName="opacity" values="0.7;1;0.7" dur="3.4s" repeatCount="indefinite" begin={`${i * 0.7}s`} />
            </ellipse>
            {/* chain */}
            {[0, 6, 12, 18].map(y => (
              <rect key={y} x={9} y={y} width={2} height={4} fill="#3a2412" />
            ))}
            {/* lantern top */}
            <rect x={4} y={22} width={12} height={3} fill="#3a2412" />
            <rect x={2} y={25} width={16} height={2} fill="#5a3a1e" />
            {/* lantern body (warm) */}
            <rect x={3} y={27} width={14} height={20} fill="#3a2412" />
            <rect x={5} y={29} width={10} height={16} fill="#b07020" />
            <rect x={6} y={30} width={8} height={14} fill="#f5b04c">
              <animate attributeName="fill" values="#f5b04c;#ffd685;#f5b04c" dur="2.6s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
            </rect>
            <rect x={8} y={32} width={4} height={10} fill="#fff3c2" opacity={0.9} />
            {/* lantern bottom */}
            <rect x={2} y={47} width={16} height={2} fill="#5a3a1e" />
            <rect x={4} y={49} width={12} height={2} fill="#3a2412" />
            {/* hanging tassel */}
            <rect x={9} y={51} width={2} height={4} fill="#b07020" />
          </g>
        ))}

        {/* Pixel cloud drifting */}
        <g opacity={0.18}>
          <PixelCloud x={20} y={20} dur={28} />
          <PixelCloud x={280} y={40} dur={36} delay={4} />
          <PixelCloud x={120} y={620} dur={32} delay={8} />
        </g>
      </svg>

      {/* Tooltip overlay */}
      {tooltip && (
        <div
          className="book-tooltip visible"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="tt-title">{tooltip.book.title}</div>
          <div className="tt-desc">{tooltip.book.desc}</div>
          <div className="tt-meta">
            <span>{tooltip.book.chapter}</span>
            <span>· {tooltip.book.pages} lessons</span>
          </div>
        </div>
      )}
    </div>
  );
}

function PixelCloud({ x, y, dur = 30, delay = 0 }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <animateTransform attributeName="transform" type="translate"
        values={`${x - 60},${y};${x + 500},${y}`} dur={`${dur}s`} repeatCount="indefinite" begin={`-${delay}s`} />
      <rect x={4} y={4} width={32} height={4} fill="#c9b894" />
      <rect x={0} y={8} width={48} height={4} fill="#c9b894" />
      <rect x={4} y={12} width={40} height={4} fill="#c9b894" />
      <rect x={8} y={16} width={28} height={4} fill="#c9b894" />
    </g>
  );
}

// ---------- Stars / night sky background ----------
function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() > 0.8 ? 2 : 1,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 4,
    }));
  }, []);

  return (
    <svg className="hero-stars" viewBox="0 0 100 100" preserveAspectRatio="none">
      {stars.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width={s.size * 0.15} height={s.size * 0.15} fill="#f4e8d0">
          <animate attributeName="opacity" values={`${0.2 + Math.random() * 0.3};1;${0.2}`} dur={`${s.duration}s`} repeatCount="indefinite" begin={`${s.delay}s`} />
        </rect>
      ))}
    </svg>
  );
}

// ---------- Floating particles ----------
function FloatingParticles() {
  const parts = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 14 + Math.random() * 10,
      size: 1 + Math.random() * 1.5,
      color: ['#f5b04c', '#ffd685', '#7fc4bd', '#b594d9'][i % 4],
    }));
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 3 }}>
      {parts.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${p.x}%`,
          bottom: '-10px',
          width: `${p.size * 3}px`,
          height: `${p.size * 3}px`,
          background: p.color,
          borderRadius: '1px',
          opacity: 0.6,
          boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
          animation: `floatUp ${p.duration}s linear ${p.delay}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% { transform: translateY(-110vh) translateX(${Math.random() > 0.5 ? '40px' : '-40px'}); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ---------- Title logo ----------
function TitleLogo() {
  return (
    <h1 className="hero-title">
      <span>The </span>
      <span className="accent">Code Academy</span>
      <span style={{ display: 'block', fontSize: '0.5em', color: 'var(--ink-dim)', fontFamily: 'var(--font-body)', fontWeight: 300, letterSpacing: '0.04em', marginTop: 12 }}>
        a cozy place to learn how machines think
      </span>
    </h1>
  );
}

// ---------- Main Hero ----------
function Hero({ onEnter }) {
  // Parallax on scroll
  const heroRef = useRef(null);
  useEffect(() => {
    function onScroll() {
      const sy = window.scrollY;
      if (heroRef.current) {
        const stars = heroRef.current.querySelector('.hero-stars');
        const clouds = heroRef.current.querySelector('.bookshelf-scene');
        const content = heroRef.current.querySelector('.hero-content');
        if (stars) stars.style.transform = `translateY(${sy * 0.3}px)`;
        if (clouds) clouds.style.transform = `translateY(${sy * 0.1}px)`;
        if (content) content.style.opacity = Math.max(0, 1 - sy / 600);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="hero" ref={heroRef}>
      <StarField />
      <FloatingParticles />
      <div className="hero-content">
        <div className="hero-left">
          <div className="hero-tag">
            <span className="pulse"></span>
            <span>Loop Forest · Open Now</span>
          </div>
          <TitleLogo />
          <p className="hero-sub">
            A cozy pixel world where computer science is a kind of magic.
            Walk through Loop Forest. Befriend tired machines. Learn
            <em>loops, functions, algorithms,</em> and how everything talks
            to everything else — at your own pace, by the lantern light.
          </p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={onEnter}>
              Enter The Academy
            </button>
            <button className="btn-ghost">
              Read the Codex
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="num">7</span>
              <span className="label">Chapters</span>
            </div>
            <div className="hero-stat">
              <span className="num">240+</span>
              <span className="label">Lessons</span>
            </div>
            <div className="hero-stat">
              <span className="num">∞</span>
              <span className="label">Loops</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <Bookshelf onCTA={onEnter} />
        </div>
      </div>
    </section>
  );
}

window.Hero = Hero;
