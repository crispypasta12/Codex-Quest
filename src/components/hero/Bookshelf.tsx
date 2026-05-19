import { useRef, useState } from "react";
import type React from "react";

import { Book } from "./Book";
import { BOOKS, type BookData } from "./books";

type TooltipState = {
  book: BookData;
  x: number;
  y: number;
};

function PixelCloud({
  x,
  y,
  dur = 30,
  delay = 0,
}: {
  x: number;
  y: number;
  dur?: number;
  delay?: number;
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <animateTransform
        attributeName="transform"
        type="translate"
        values={`${x - 60},${y};${x + 500},${y}`}
        dur={`${dur}s`}
        repeatCount="indefinite"
        begin={`-${delay}s`}
      />
      <rect x={4} y={4} width={32} height={4} fill="#c9b894" />
      <rect x={0} y={8} width={48} height={4} fill="#c9b894" />
      <rect x={4} y={12} width={40} height={4} fill="#c9b894" />
      <rect x={8} y={16} width={28} height={4} fill="#c9b894" />
    </g>
  );
}

export function Bookshelf() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  const handleHover = (
    book: BookData,
    event: React.MouseEvent<SVGGElement>,
  ) => {
    if (!sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    setTooltip({
      book,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const shelfWidth = 360;
  const shelfX = 30;
  const shelfYs = [120, 250, 380];
  const shelves = [
    [BOOKS[0], BOOKS[1], BOOKS[2]],
    [BOOKS[3], BOOKS[4]],
    [BOOKS[5], BOOKS[6]],
  ];

  return (
    <div className="bookshelf-scene" ref={sceneRef}>
      <svg
        viewBox="0 0 440 640"
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="crispEdges"
      >
        <defs>
          <linearGradient id="wood-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a4a2a" />
            <stop offset="100%" stopColor="#4a2f1e" />
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

        <ellipse cx={220} cy={300} rx={260} ry={300} fill="url(#warm-light)" />
        {shelfYs.map((sy, i) => (
          <ellipse
            key={i}
            cx={220}
            cy={sy + 10}
            rx={180}
            ry={50}
            fill="url(#warm-light)"
            opacity={0.6}
          />
        ))}

        <rect x={shelfX - 10} y={70} width={shelfWidth + 20} height={520} fill="#3a2412" />
        <rect x={shelfX - 8} y={72} width={shelfWidth + 16} height={516} fill="url(#wood-grad)" />
        <rect x={shelfX} y={80} width={shelfWidth} height={500} fill="#2a1810" />

        {[100, 180, 260, 340, 420, 500].map((y, i) => (
          <rect
            key={i}
            x={shelfX + 2}
            y={y}
            width={shelfWidth - 4}
            height={1}
            fill="#1a1008"
            opacity={0.5}
          />
        ))}

        {[230, 360, 490, 580].map((y, i) => (
          <g key={i}>
            <rect x={shelfX - 4} y={y} width={shelfWidth + 8} height={10} fill="#5a3a1e" />
            <rect x={shelfX - 4} y={y} width={shelfWidth + 8} height={3} fill="#7a4a2a" />
            <rect x={shelfX - 4} y={y + 8} width={shelfWidth + 8} height={2} fill="#3a2412" />
          </g>
        ))}

        <rect x={shelfX - 14} y={66} width={shelfWidth + 28} height={6} fill="#5a3a1e" />
        <rect x={shelfX - 14} y={72} width={shelfWidth + 28} height={3} fill="#3a2412" />
        <g>
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={shelfX + 20 + i * 45} y={56} width={20} height={10} fill="#5a3a1e" />
          ))}
        </g>

        <g>
          {Array.from({ length: 12 }).map((_, i) => {
            const cx = 60 + ((i * 37) % 340);
            const cy = 100 + ((i * 83) % 460);
            return (
              <circle key={i} cx={cx} cy={cy} r={1} fill="#ffd685">
                <animate
                  attributeName="opacity"
                  values="0;0.9;0"
                  dur={`${3 + (i % 3)}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.4}s`}
                />
                <animate
                  attributeName="cy"
                  values={`${cy};${cy - 20};${cy}`}
                  dur={`${4 + (i % 3)}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.4}s`}
                />
              </circle>
            );
          })}
        </g>

        {(() => {
          let cursorX = shelfX + 30;
          return shelves[0].map((book) => {
            const element = (
              <Book
                key={book.id}
                book={book}
                x={cursorX}
                baseY={230}
                onHover={handleHover}
                onLeave={() => setTooltip(null)}
              />
            );
            cursorX += book.width + 8;
            return element;
          });
        })()}
        <g transform="translate(280, 195)">
          <rect x={0} y={20} width={20} height={14} fill="#5a3a1e" />
          <rect x={1} y={21} width={18} height={3} fill="#7a4a2a" />
          <rect x={4} y={4} width={4} height={16} fill="#3a6b3f" />
          <rect x={8} y={2} width={4} height={18} fill="#4a7d34" />
          <rect x={12} y={6} width={4} height={14} fill="#3a6b3f" />
          <rect x={6} y={0} width={2} height={4} fill="#6ba84a" />
          <rect x={10} y={-2} width={2} height={4} fill="#6ba84a" />
        </g>

        {(() => {
          let cursorX = shelfX + 40;
          return shelves[1].map((book) => {
            const element = (
              <Book
                key={book.id}
                book={book}
                x={cursorX}
                baseY={360}
                onHover={handleHover}
                onLeave={() => setTooltip(null)}
              />
            );
            cursorX += book.width + 10;
            return element;
          });
        })()}
        <g transform="translate(280, 320)">
          <rect x={4} y={32} width={12} height={6} fill="#5a3a1e" />
          <rect x={3} y={28} width={14} height={4} fill="#7a4a2a" />
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

        {(() => {
          let cursorX = shelfX + 40;
          return shelves[2].map((book) => {
            const element = (
              <Book
                key={book.id}
                book={book}
                x={cursorX}
                baseY={490}
                onHover={handleHover}
                onLeave={() => setTooltip(null)}
              />
            );
            cursorX += book.width + 10;
            return element;
          });
        })()}
        <g transform="translate(270, 462)">
          <rect x={0} y={4} width={36} height={20} fill="#c98a52" />
          <rect x={0} y={4} width={36} height={2} fill="#9c6638" />
          <rect x={0} y={22} width={36} height={2} fill="#9c6638" />
          <rect x={-2} y={2} width={4} height={24} fill="#7a4a2a" />
          <rect x={34} y={2} width={4} height={24} fill="#7a4a2a" />
          <rect x={4} y={9} width={16} height={1} fill="#5a3a1e" />
          <rect x={4} y={13} width={20} height={1} fill="#5a3a1e" />
          <rect x={4} y={17} width={12} height={1} fill="#5a3a1e" />
        </g>

        {[20, 410].map((lx, i) => (
          <g key={i} transform={`translate(${lx}, 90)`}>
            <ellipse cx={10} cy={20} rx={36} ry={50} fill="url(#lantern-light)">
              <animate
                attributeName="opacity"
                values="0.7;1;0.7"
                dur="3.4s"
                repeatCount="indefinite"
                begin={`${i * 0.7}s`}
              />
            </ellipse>
            {[0, 6, 12, 18].map((y) => (
              <rect key={y} x={9} y={y} width={2} height={4} fill="#3a2412" />
            ))}
            <rect x={4} y={22} width={12} height={3} fill="#3a2412" />
            <rect x={2} y={25} width={16} height={2} fill="#5a3a1e" />
            <rect x={3} y={27} width={14} height={20} fill="#3a2412" />
            <rect x={5} y={29} width={10} height={16} fill="#b07020" />
            <rect x={6} y={30} width={8} height={14} fill="#f5b04c">
              <animate
                attributeName="fill"
                values="#f5b04c;#ffd685;#f5b04c"
                dur="2.6s"
                repeatCount="indefinite"
                begin={`${i * 0.4}s`}
              />
            </rect>
            <rect x={8} y={32} width={4} height={10} fill="#fff3c2" opacity={0.9} />
            <rect x={2} y={47} width={16} height={2} fill="#5a3a1e" />
            <rect x={4} y={49} width={12} height={2} fill="#3a2412" />
            <rect x={9} y={51} width={2} height={4} fill="#b07020" />
          </g>
        ))}

        <g opacity={0.18}>
          <PixelCloud x={20} y={20} dur={28} />
          <PixelCloud x={280} y={40} dur={36} delay={4} />
          <PixelCloud x={120} y={620} dur={32} delay={8} />
        </g>
      </svg>

      {tooltip && (
        <div className="book-tooltip visible" style={{ left: tooltip.x, top: tooltip.y }}>
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
