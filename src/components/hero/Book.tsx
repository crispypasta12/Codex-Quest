import type React from "react";
import type { SVGProps } from "react";

import type { BookData } from "./books";

type SpineSymbolProps = {
  kind: BookData["spine"];
  color: string;
};

function PixelRect(props: SVGProps<SVGRectElement>) {
  return <rect width={2} height={2} {...props} />;
}

export function SpineSymbol({ kind, color }: SpineSymbolProps) {
  const props = { fill: color || "#ffd685", opacity: 0.92 };

  switch (kind) {
    case "loops":
      return (
        <g>
          {[
            [-5, -2],
            [-7, 0],
            [-5, 2],
            [-3, 0],
            [-1, -2],
            [1, 0],
            [-1, 2],
            [3, 0],
            [5, -2],
            [5, 2],
          ].map(([x, y], i) => (
            <PixelRect key={i} x={x} y={y} {...props} />
          ))}
        </g>
      );
    case "lambda":
      return (
        <g>
          {[
            [-4, -5],
            [-2, -3],
            [0, -1],
            [2, 1],
            [4, 3],
            [-2, 1],
            [-4, 3],
          ].map(([x, y], i) => (
            <PixelRect key={i} x={x} y={y} {...props} />
          ))}
        </g>
      );
    case "maze":
      return (
        <g>
          {[
            [-6, -5],
            [-4, -5],
            [-2, -5],
            [0, -5],
            [2, -5],
            [4, -5],
            [-6, -3],
            [4, -3],
            [-6, -1],
            [-4, -1],
            [-2, -1],
            [0, -1],
            [4, -1],
            [-6, 1],
            [0, 1],
            [4, 1],
            [-6, 3],
            [-4, 3],
            [-2, 3],
            [0, 3],
            [2, 3],
            [4, 3],
          ].map(([x, y], i) => (
            <PixelRect key={i} x={x} y={y} {...props} />
          ))}
        </g>
      );
    case "tree":
      return (
        <g>
          {[
            [-1, -6],
            [-1, -4],
            [-3, -2],
            [1, -2],
            [-5, 0],
            [-1, 0],
            [3, 0],
            [-5, 2],
            [-1, 2],
            [3, 2],
          ].map(([x, y], i) => (
            <PixelRect key={i} x={x} y={y} {...props} />
          ))}
        </g>
      );
    case "nodes":
      return (
        <g>
          <rect x={-5} y={-5} width={3} height={3} {...props} />
          <rect x={2} y={-5} width={3} height={3} {...props} />
          <rect x={-2} y={0} width={3} height={3} {...props} />
          <rect x={-5} y={4} width={3} height={3} {...props} />
          <rect x={2} y={4} width={3} height={3} {...props} />
          <rect x={-2} y={-2} width={1} height={1} {...props} opacity={0.5} />
          <rect x={0} y={-1} width={1} height={1} {...props} opacity={0.5} />
          <rect x={-1} y={3} width={1} height={1} {...props} opacity={0.5} />
          <rect x={1} y={2} width={1} height={1} {...props} opacity={0.5} />
        </g>
      );
    case "grid":
      return (
        <g>
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={-5 + c * 3}
                y={-5 + r * 3}
                width={2}
                height={2}
                {...props}
                opacity={(r + c) % 2 ? 0.9 : 0.4}
              />
            )),
          )}
        </g>
      );
    case "lock":
      return (
        <g>
          {[
            [-3, -5],
            [-1, -5],
            [1, -5],
            [-3, -3],
            [1, -3],
          ].map(([x, y], i) => (
            <PixelRect key={i} x={x} y={y} {...props} />
          ))}
          <rect x={-5} y={-1} width={10} height={2} {...props} />
          <rect x={-5} y={1} width={10} height={2} {...props} />
          <rect x={-5} y={3} width={10} height={2} {...props} />
          <rect x={-1} y={0} width={2} height={3} fill="#1a1408" />
        </g>
      );
  }
}

type BookProps = {
  book: BookData;
  x: number;
  baseY: number;
  onHover: (book: BookData, event: React.MouseEvent<SVGGElement>) => void;
  onLeave: () => void;
};

export function Book({ book, x, baseY, onHover, onLeave }: BookProps) {
  const { width: w, height: h, color, edge, glow, tilt, spine } = book;

  return (
    <g
      className="book-group"
      style={{ "--book-glow": glow } as React.CSSProperties}
      transform={`translate(${x}, ${baseY - h}) rotate(${tilt}, ${w / 2}, ${h})`}
      onMouseEnter={(event) => onHover(book, event)}
      onMouseLeave={onLeave}
      onMouseMove={(event) => onHover(book, event)}
    >
      <rect x={2} y={h - 2} width={w - 2} height={3} fill="rgba(0,0,0,0.4)" />
      <rect x={0} y={0} width={w} height={h} fill={edge} />
      <rect x={1} y={1} width={w - 2} height={h - 2} fill={color} />
      <rect x={1} y={6} width={w - 2} height={2} fill={edge} />
      <rect x={1} y={h - 8} width={w - 2} height={2} fill={edge} />
      <rect
        x={w - 2}
        y={1}
        width={1}
        height={h - 2}
        fill="rgba(255,255,255,0.15)"
      />
      <text
        x={w / 2}
        y={h / 2}
        fill={glow}
        fontFamily="Pixelify Sans, monospace"
        fontSize={Math.min(10, w * 0.42)}
        textAnchor="middle"
        transform={`rotate(-90, ${w / 2}, ${h / 2})`}
        style={{ letterSpacing: "0.5px" }}
      >
        {book.title.toUpperCase()}
      </text>
      <g transform={`translate(${w / 2}, ${h - 16})`}>
        <SpineSymbol kind={spine} color={glow} />
      </g>
      <g className="book-sparkles" opacity={0.0}>
        <circle cx={w / 2 - 6} cy={20} r={1.5} fill={glow}>
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="2.4s"
            repeatCount="indefinite"
            begin={`${book.id.length * 0.3}s`}
          />
        </circle>
        <circle cx={w / 2 + 5} cy={40} r={1.5} fill={glow}>
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="2.4s"
            repeatCount="indefinite"
            begin={`${book.id.length * 0.5}s`}
          />
        </circle>
      </g>
    </g>
  );
}
