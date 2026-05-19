import type { LessonId } from "./lessons/loopForestFundamentals";

export const TILE = 16;
export const W_TILES = 36;
export const H_TILES = 22;
export const WORLD_W = W_TILES * TILE;
export const WORLD_H = H_TILES * TILE;

export const MAP_STR = [
  "....................................",
  "....................................",
  "..*...p........*......b.............",
  "....................................",
  "..............CCCCC.................",
  "............CCCCCCCCC...............",
  "..........CCCCCCCCCCCCC.............",
  "........CCCCCCCCCCCCCCCC............",
  "......CCCCCCCC.....CCCCCCCC.........",
  "....CCCCCCC...........CCCCCCC.......",
  "..CCCCCC................CCCCCC......",
  "..CCCCC..................CCCCC......",
  "..CCCCC..................CCCCC......",
  "...CCCCC.................CCCCC......",
  "....CCCCCC..............CCCCCC......",
  "......CCCCCCC..........CCCCCCC......",
  "........CCCCCCCCCCCCCCCCCCCCC.......",
  ".........CCCCCCCCCCCCCCCCCC.........",
  "...........CCCCCCCCCCCCCC...........",
  ".............CCCCCCCCCC.............",
  "....................................",
  "....................................",
] as const;

export type TileType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function buildTiles() {
  const tiles: TileType[][] = [];
  for (let y = 0; y < H_TILES; y++) {
    const row: TileType[] = [];
    const s = MAP_STR[y] || "";
    for (let x = 0; x < W_TILES; x++) {
      const c = s[x] || ".";
      let type: TileType = 0;
      if (c === "C") type = 1;
      else if (c === "p") type = 2;
      else if (c === "b") type = 3;
      else if (c === "y") type = 4;
      else if (c === "m") type = 5;
      else if (c === "*") type = 6;
      row.push(type);
    }
    tiles.push(row);
  }
  return tiles;
}

export type EntityKind =
  | "house"
  | "tree"
  | "bush"
  | "lantern"
  | "sign"
  | "mushroom"
  | "byte"
  | "berrybot"
  | "berrybush"
  | "fence"
  | "crate"
  | "tools"
  | "mailbox"
  | "books"
  | "robotparts"
  | "workbench"
  | "chargingstation"
  | "bridge"
  | "plank"
  | "rowmarker";

export type WorldEntity = {
  id: string;
  kind: EntityKind;
  x: number;
  y: number;
  solid?: boolean;
  sw?: number;
  sh?: number;
  footW?: number;
  footH?: number;
  interactable?: "sign" | "byte" | "berrybot" | "lesson";
  lessonId?: LessonId;
  glow?: boolean;
  light?: boolean;
  hasBerries?: boolean;
};

export const ENTITIES: WorldEntity[] = [
  { id: "house", kind: "house", x: 80, y: 130, solid: true, sw: 80, sh: 80, footW: 76, footH: 18 },
  { id: "t1", kind: "tree", x: 12, y: 88, solid: true },
  { id: "t2", kind: "tree", x: 16, y: 220, solid: true },
  { id: "t3", kind: "tree", x: 30, y: 300, solid: true },
  { id: "t5", kind: "tree", x: 130, y: 56, solid: true },
  { id: "t6", kind: "tree", x: 230, y: 50, solid: true },
  { id: "t7", kind: "tree", x: 320, y: 58, solid: true },
  { id: "t8", kind: "tree", x: 410, y: 50, solid: true },
  { id: "t9", kind: "tree", x: 490, y: 90, solid: true },
  { id: "t10", kind: "tree", x: 510, y: 180, solid: true },
  { id: "t11", kind: "tree", x: 490, y: 270, solid: true },
  { id: "t12", kind: "tree", x: 410, y: 320, solid: true },
  { id: "t13", kind: "tree", x: 290, y: 325, solid: true },
  { id: "t14", kind: "tree", x: 160, y: 320, solid: true },
  { id: "bu1", kind: "bush", x: 175, y: 240 },
  { id: "bu2", kind: "bush", x: 240, y: 295 },
  { id: "bu3", kind: "bush", x: 380, y: 285 },
  { id: "bu4", kind: "bush", x: 460, y: 210 },
  { id: "l1", kind: "lantern", x: 220, y: 200, light: true },
  { id: "l2", kind: "lantern", x: 320, y: 235, light: true },
  { id: "l3", kind: "lantern", x: 415, y: 200, light: true },
  { id: "l4", kind: "lantern", x: 320, y: 110, light: true },
  { id: "sign", kind: "sign", x: 280, y: 270, interactable: "sign", solid: false },
  { id: "sequence-trail", kind: "sign", x: 165, y: 170, interactable: "lesson", lessonId: "sequence-01" },
  { id: "conditional-crossing", kind: "sign", x: 305, y: 112, interactable: "lesson", lessonId: "conditions-01" },
  { id: "nested-fields", kind: "sign", x: 420, y: 265, interactable: "lesson", lessonId: "nested-loops-01" },
  { id: "m1", kind: "mushroom", x: 175, y: 260 },
  { id: "m2", kind: "mushroom", x: 440, y: 250 },
  { id: "m3", kind: "mushroom", x: 460, y: 145 },
  { id: "mail-sequence", kind: "mailbox", x: 135, y: 150 },
  { id: "seed-crate-1", kind: "crate", x: 145, y: 188 },
  { id: "seed-crate-2", kind: "crate", x: 115, y: 168 },
  { id: "lantern-path-fence-1", kind: "fence", x: 125, y: 207 },
  { id: "lantern-path-fence-2", kind: "fence", x: 195, y: 153 },
  { id: "byte-books-1", kind: "books", x: 225, y: 232 },
  { id: "byte-workbench", kind: "workbench", x: 260, y: 190, solid: true, footW: 28, footH: 8 },
  { id: "byte-charger", kind: "chargingstation", x: 285, y: 215 },
  { id: "hollow-cart", kind: "crate", x: 398, y: 112 },
  { id: "hollow-tools", kind: "tools", x: 500, y: 163 },
  { id: "hollow-fence-1", kind: "fence", x: 368, y: 105 },
  { id: "hollow-fence-2", kind: "fence", x: 478, y: 207 },
  { id: "fork-bridge", kind: "bridge", x: 320, y: 126 },
  { id: "fork-plank-left", kind: "plank", x: 286, y: 135 },
  { id: "fork-plank-right", kind: "plank", x: 356, y: 135 },
  { id: "fork-robot-parts", kind: "robotparts", x: 350, y: 93 },
  { id: "row-marker-1", kind: "rowmarker", x: 410, y: 235 },
  { id: "row-marker-2", kind: "rowmarker", x: 445, y: 235 },
  { id: "row-marker-3", kind: "rowmarker", x: 480, y: 235 },
  { id: "row-tools", kind: "tools", x: 495, y: 275 },
  { id: "byte", kind: "byte", x: 245, y: 215, interactable: "byte", glow: true },
  { id: "seedbot", kind: "berrybot", x: 185, y: 145, glow: false },
  { id: "berrybot", kind: "berrybot", x: 420, y: 155, interactable: "lesson", lessonId: "loops-01", glow: false },
  { id: "basketbot", kind: "berrybot", x: 325, y: 96, glow: false },
  { id: "rowbot", kind: "berrybot", x: 455, y: 250, glow: false },
  { id: "b1", kind: "berrybush", x: 380, y: 130, hasBerries: true },
  { id: "b2", kind: "berrybush", x: 455, y: 125, hasBerries: true },
  { id: "b3", kind: "berrybush", x: 385, y: 185, hasBerries: true },
  { id: "b4", kind: "berrybush", x: 465, y: 185, hasBerries: true },
  { id: "b5", kind: "berrybush", x: 445, y: 95, hasBerries: true },
];

export const PLAYER_SPAWN = { x: 258, y: 236 } as const;
