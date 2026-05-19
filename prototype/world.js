// world.js — Loop Forest world data: tile map + entity placements.
// All positions in "world pixels" (wp). 1 tile = 16 wp.

const TILE = 16;
const W_TILES = 36;
const H_TILES = 22;
const WORLD_W = W_TILES * TILE; // 576 wp
const WORLD_H = H_TILES * TILE; // 352 wp

// Tile types: 0=grass, 1=path/cobble, 2=grass-flower-pink, 3=grass-flower-blue, 4=grass-flower-yellow
// We'll use a string map for readability.
// .=grass  C=cobble  p=pink flower  b=blue flower  y=yellow flower  m=mushroom  *=grass tuft
const MAP_STR = [
  '....................................',
  '....................................',
  '..*...p........*......b.............',
  '....................................',
  '..............CCCCC.................',
  '............CCCCCCCCC...............',
  '..........CCCCCCCCCCCCC.............',
  '........CCCCCCCCCCCCCCCC............',
  '......CCCCCCCC.....CCCCCCCC.........',
  '....CCCCCCC...........CCCCCCC.......',
  '..CCCCCC................CCCCCC......',
  '..CCCCC..................CCCCC......',
  '..CCCCC..................CCCCC......',
  '...CCCCC.................CCCCC......',
  '....CCCCCC..............CCCCCC......',
  '......CCCCCCC..........CCCCCCC......',
  '........CCCCCCCCCCCCCCCCCCCCC.......',
  '.........CCCCCCCCCCCCCCCCCC.........',
  '...........CCCCCCCCCCCCCC...........',
  '.............CCCCCCCCCC.............',
  '....................................',
  '....................................',
];

// Build tile map from string
function buildTiles() {
  const tiles = [];
  for (let y = 0; y < H_TILES; y++) {
    const row = [];
    const s = MAP_STR[y] || '';
    for (let x = 0; x < W_TILES; x++) {
      const c = s[x] || '.';
      let type = 0;
      if (c === 'C') type = 1;
      else if (c === 'p') type = 2;
      else if (c === 'b') type = 3;
      else if (c === 'y') type = 4;
      else if (c === 'm') type = 5;
      else if (c === '*') type = 6;
      row.push(type);
    }
    tiles.push(row);
  }
  return tiles;
}

// Entities placed in the world. Each has (x, y) in wp where x,y is the
// FOOT/anchor position (bottom-center of sprite for characters; bottom-left for decor).
const ENTITIES = [
  // Cottage house tucked top-left (decorative backdrop, partially visible)
  { id: 'house', kind: 'house', x: 80, y: 130, solid: true, sw: 80, sh: 80, footW: 76, footH: 18 },

  // Trees frame the playable area
  { id: 't1', kind: 'tree', x: 12,  y: 88,  solid: true },
  { id: 't2', kind: 'tree', x: 16,  y: 220, solid: true },
  { id: 't3', kind: 'tree', x: 30,  y: 300, solid: true },
  { id: 't5', kind: 'tree', x: 130, y: 56,  solid: true },
  { id: 't6', kind: 'tree', x: 230, y: 50,  solid: true },
  { id: 't7', kind: 'tree', x: 320, y: 58,  solid: true },
  { id: 't8', kind: 'tree', x: 410, y: 50,  solid: true },
  { id: 't9', kind: 'tree', x: 490, y: 90,  solid: true },
  { id: 't10', kind: 'tree', x: 510, y: 180, solid: true },
  { id: 't11', kind: 'tree', x: 490, y: 270, solid: true },
  { id: 't12', kind: 'tree', x: 410, y: 320, solid: true },
  { id: 't13', kind: 'tree', x: 290, y: 325, solid: true },
  { id: 't14', kind: 'tree', x: 160, y: 320, solid: true },

  // Bushes
  { id: 'bu1', kind: 'bush', x: 175, y: 240 },
  { id: 'bu2', kind: 'bush', x: 240, y: 295 },
  { id: 'bu3', kind: 'bush', x: 380, y: 285 },
  { id: 'bu4', kind: 'bush', x: 460, y: 210 },

  // Lanterns along the path
  { id: 'l1', kind: 'lantern', x: 220, y: 200, light: true },
  { id: 'l2', kind: 'lantern', x: 320, y: 235, light: true },
  { id: 'l3', kind: 'lantern', x: 415, y: 200, light: true },
  { id: 'l4', kind: 'lantern', x: 320, y: 110, light: true },

  // Sign at the path entry
  { id: 'sign', kind: 'sign', x: 280, y: 270, interactable: 'sign', solid: false },

  // Mushrooms / flowers for decor
  { id: 'm1', kind: 'mushroom', x: 175, y: 260 },
  { id: 'm2', kind: 'mushroom', x: 440, y: 250 },
  { id: 'm3', kind: 'mushroom', x: 460, y: 145 },

  // Byte the NPC — center-left, clearly visible at spawn
  { id: 'byte', kind: 'byte', x: 245, y: 215, interactable: 'byte', glow: true },

  // Broken berry-bot — east, near berry bushes
  { id: 'berrybot', kind: 'berrybot', x: 420, y: 155, interactable: 'berrybot', glow: false },

  // Berry bushes for the quest (5 of them around the berry-bot)
  { id: 'b1', kind: 'berrybush', x: 380, y: 130, hasBerries: true },
  { id: 'b2', kind: 'berrybush', x: 455, y: 125, hasBerries: true },
  { id: 'b3', kind: 'berrybush', x: 385, y: 185, hasBerries: true },
  { id: 'b4', kind: 'berrybush', x: 465, y: 185, hasBerries: true },
  { id: 'b5', kind: 'berrybush', x: 445, y: 95,  hasBerries: true },
];

window.World = {
  TILE, W_TILES, H_TILES, WORLD_W, WORLD_H,
  buildTiles,
  ENTITIES,
};
