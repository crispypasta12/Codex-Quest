import * as Phaser from "phaser";

import { ENTITIES, PLAYER_SPAWN, TILE, WORLD_H, WORLD_W, buildTiles } from "./data/worldMap";
import { grassTile, sprites } from "./data/sprites";
import { createSpriteCanvas, type PixelSprite } from "./utils/renderPixelSprite";

type SpriteKey = keyof typeof sprites;

const SPRITE_TEXTURES: Partial<Record<SpriteKey, string>> = {
  PLAYER_DOWN_IDLE: "player-down-idle",
  PLAYER_DOWN_WALK: "player-down-walk",
  PLAYER_UP_IDLE: "player-up-idle",
  PLAYER_SIDE_IDLE: "player-side-idle",
  PLAYER_SIDE_WALK: "player-side-walk",
  BYTE_IDLE: "byte-idle",
  BYTE_IDLE_2: "byte-idle-2",
  BERRYBOT: "berrybot",
  BERRYBOT_HAPPY: "berrybot-happy",
  TREE: "tree",
  BUSH: "bush",
  LANTERN_ON: "lantern-on",
  SIGN: "sign",
  FLOWER_PINK: "flower-pink",
  FLOWER_BLUE: "flower-blue",
  FLOWER_YELLOW: "flower-yellow",
  HOUSE: "house",
  BERRY_BUSH: "berry-bush",
  BERRY_BUSH_EMPTY: "berry-bush-empty",
  MUSHROOM: "mushroom",
  COBBLE: "cobble",
};

type Direction = "down" | "up" | "left" | "right";
type Rect = { x: number; y: number; w: number; h: number };

export class LoopForestScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Image;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys?: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private direction: Direction = "down";
  private walkTime = 0;
  private worldLayer?: Phaser.GameObjects.Layer;
  private fireflies: Phaser.GameObjects.Arc[] = [];
  private fireflySeeds: Array<{ cx: number; cy: number; r: number; speed: number; phase: number }> = [];

  constructor() {
    super("LoopForestScene");
  }

  preload() {
    this.textures.getTextureKeys().forEach((key) => {
      if (key.startsWith("loop-forest/")) this.textures.remove(key);
    });
    this.generateSpriteTextures();
    this.generateMapTexture();
  }

  create() {
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.setBackgroundColor("#0d1a08");
    this.cameras.main.roundPixels = true;

    this.add.image(0, 0, "loop-forest/map").setOrigin(0, 0);
    this.worldLayer = this.add.layer();

    this.placeEntities();
    this.player = this.add
      .image(PLAYER_SPAWN.x, PLAYER_SPAWN.y, "loop-forest/player-down-idle")
      .setOrigin(0.5, 1)
      .setDepth(PLAYER_SPAWN.y);
    this.worldLayer.add(this.player);

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(2);

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keys = this.input.keyboard?.addKeys("W,A,S,D") as Record<
      "W" | "A" | "S" | "D",
      Phaser.Input.Keyboard.Key
    >;

    this.createFireflies();
    this.addVignette();
  }

  update(_: number, delta: number) {
    this.updatePlayer(delta);
    this.updateFireflies(this.time.now / 1000);
    this.worldLayer?.list.sort((a, b) => {
      const ay = "y" in a ? Number(a.y) : 0;
      const by = "y" in b ? Number(b.y) : 0;
      return ay - by;
    });
  }

  private generateSpriteTextures() {
    Object.entries(SPRITE_TEXTURES).forEach(([spriteName, textureName]) => {
      const sprite = sprites[spriteName as SpriteKey] as PixelSprite | undefined;
      if (!sprite || !textureName) return;
      this.textures.addCanvas(`loop-forest/${textureName}`, createSpriteCanvas(sprite));
    });
  }

  private generateMapTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = WORLD_W;
    canvas.height = WORLD_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    const tiles = buildTiles();
    for (let ty = 0; ty < tiles.length; ty++) {
      for (let tx = 0; tx < tiles[ty].length; tx++) {
        const tile = tiles[ty][tx];
        const x = tx * TILE;
        const y = ty * TILE;

        if (tile === 1) {
          this.drawPixelGrid(ctx, sprites.COBBLE as PixelSprite, x, y);
        } else {
          this.drawPixelGrid(ctx, grassTile(ty * 97 + tx * 31) as PixelSprite, x, y);
          if (this.isAdjacentToPath(tiles, tx, ty)) {
            ctx.fillStyle = "rgba(106,168,90,0.15)";
            ctx.fillRect(x, y, TILE, TILE);
          }
        }

        if (tile === 2) this.drawPixelGrid(ctx, sprites.FLOWER_PINK as PixelSprite, x + 5, y + 5);
        if (tile === 3) this.drawPixelGrid(ctx, sprites.FLOWER_BLUE as PixelSprite, x + 5, y + 5);
        if (tile === 4) this.drawPixelGrid(ctx, sprites.FLOWER_YELLOW as PixelSprite, x + 5, y + 5);
        if (tile === 6) {
          ctx.fillStyle = "#7bb84d";
          ctx.fillRect(x + 5, y + 9, 2, 4);
          ctx.fillRect(x + 8, y + 7, 2, 6);
          ctx.fillRect(x + 11, y + 10, 2, 3);
        }
      }
    }

    ENTITIES.filter((entity) => entity.light).forEach((entity) => {
      const gradient = ctx.createRadialGradient(entity.x, entity.y - 12, 0, entity.x, entity.y - 12, 48);
      gradient.addColorStop(0, "rgba(245,176,76,0.32)");
      gradient.addColorStop(0.65, "rgba(245,176,76,0.09)");
      gradient.addColorStop(1, "rgba(245,176,76,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(entity.x - 52, entity.y - 64, 104, 104);
    });

    this.textures.addCanvas("loop-forest/map", canvas);
  }

  private drawPixelGrid(
    ctx: CanvasRenderingContext2D,
    sprite: PixelSprite,
    dx: number,
    dy: number,
  ) {
    for (let y = 0; y < sprite.length; y++) {
      const row = sprite[y];
      for (let x = 0; x < row.length; x++) {
        const color = row[x];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(dx + x, dy + y, 1, 1);
      }
    }
  }

  private isAdjacentToPath(tiles: number[][], tx: number, ty: number) {
    return [
      [tx - 1, ty],
      [tx + 1, ty],
      [tx, ty - 1],
      [tx, ty + 1],
    ].some(([x, y]) => tiles[y]?.[x] === 1);
  }

  private placeEntities() {
    ENTITIES.forEach((entity) => {
      const texture = this.textureForEntity(entity.kind, entity.hasBerries);
      if (!texture) return;

      const image = this.add.image(entity.x, entity.y, texture).setOrigin(0.5, 1).setDepth(entity.y);
      if (entity.kind === "byte") {
        this.add.circle(entity.x, entity.y - 18, 18, 0x7fc4bd, 0.16).setDepth(entity.y - 1);
      }
      if (entity.kind === "lantern") {
        this.add.circle(entity.x, entity.y - 22, 24, 0xf5b04c, 0.12).setDepth(entity.y - 1);
      }
      this.worldLayer?.add(image);
    });
  }

  private textureForEntity(kind: string, hasBerries?: boolean) {
    switch (kind) {
      case "house":
        return "loop-forest/house";
      case "tree":
        return "loop-forest/tree";
      case "bush":
        return "loop-forest/bush";
      case "lantern":
        return "loop-forest/lantern-on";
      case "sign":
        return "loop-forest/sign";
      case "mushroom":
        return "loop-forest/mushroom";
      case "byte":
        return "loop-forest/byte-idle";
      case "berrybot":
        return "loop-forest/berrybot";
      case "berrybush":
        return hasBerries ? "loop-forest/berry-bush" : "loop-forest/berry-bush-empty";
      default:
        return null;
    }
  }

  private updatePlayer(delta: number) {
    if (!this.player || !this.cursors || !this.keys) return;

    const left = this.cursors.left?.isDown || this.keys.A.isDown;
    const right = this.cursors.right?.isDown || this.keys.D.isDown;
    const up = this.cursors.up?.isDown || this.keys.W.isDown;
    const down = this.cursors.down?.isDown || this.keys.S.isDown;

    let dx = Number(right) - Number(left);
    let dy = Number(down) - Number(up);
    const moving = dx !== 0 || dy !== 0;

    if (moving) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;

      this.walkTime += delta;

      if (Math.abs(dx) > Math.abs(dy)) this.direction = dx < 0 ? "left" : "right";
      else if (dy < 0) this.direction = "up";
      else this.direction = "down";

      this.tryMove(dx * 70 * (delta / 1000), dy * 70 * (delta / 1000));
    }

    const walkFrame = moving && Math.floor(this.walkTime / 160) % 2 === 1;
    const texture = this.playerTexture(this.direction, walkFrame);
    if (this.player.texture.key !== texture) this.player.setTexture(texture);
    this.player.setFlipX(this.direction === "left");
    this.player.setDepth(this.player.y);
  }

  private playerTexture(direction: Direction, walkFrame: boolean) {
    if (direction === "up") return "loop-forest/player-up-idle";
    if (direction === "left" || direction === "right") {
      return walkFrame ? "loop-forest/player-side-walk" : "loop-forest/player-side-idle";
    }
    return walkFrame ? "loop-forest/player-down-walk" : "loop-forest/player-down-idle";
  }

  private tryMove(dx: number, dy: number) {
    if (!this.player) return;

    const solids = this.getSolidRects();
    const footW = 8;
    const footH = 4;

    if (dx !== 0) {
      const nextX = Phaser.Math.Clamp(this.player.x + dx, 8, WORLD_W - 8);
      const box = { x: nextX - footW / 2, y: this.player.y - footH, w: footW, h: footH };
      if (!solids.some((rect) => this.rectsOverlap(box, rect))) this.player.x = nextX;
    }

    if (dy !== 0) {
      const nextY = Phaser.Math.Clamp(this.player.y + dy, 18, WORLD_H - 4);
      const box = { x: this.player.x - footW / 2, y: nextY - footH, w: footW, h: footH };
      if (!solids.some((rect) => this.rectsOverlap(box, rect))) this.player.y = nextY;
    }
  }

  private getSolidRects(): Rect[] {
    const rects: Rect[] = [
      { x: -100, y: 0, w: 110, h: WORLD_H },
      { x: WORLD_W - 10, y: 0, w: 110, h: WORLD_H },
      { x: 0, y: -100, w: WORLD_W, h: 140 },
      { x: 0, y: WORLD_H - 20, w: WORLD_W, h: 100 },
    ];

    ENTITIES.forEach((entity) => {
      if (!entity.solid) return;
      const w = entity.footW ?? 8;
      const h = entity.footH ?? 6;
      rects.push({ x: entity.x - w / 2, y: entity.y - h, w, h });
    });

    return rects;
  }

  private rectsOverlap(a: Rect, b: Rect) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  private createFireflies() {
    const centers = [
      [210, 180],
      [300, 130],
      [390, 190],
      [455, 115],
      [170, 270],
      [330, 270],
      [500, 245],
    ];

    for (let i = 0; i < 14; i++) {
      const [cx, cy] = centers[i % centers.length];
      this.fireflySeeds.push({
        cx: cx + (i % 2) * 12,
        cy: cy + ((i * 7) % 18),
        r: 20 + ((i * 13) % 40),
        speed: 0.4 + ((i * 11) % 4) * 0.1,
        phase: i * 0.9,
      });
      this.fireflies.push(
        this.add.circle(cx, cy, i % 3 === 0 ? 1.4 : 1, 0xffd685, 0.85).setBlendMode(Phaser.BlendModes.ADD),
      );
    }
  }

  private updateFireflies(time: number) {
    this.fireflies.forEach((firefly, i) => {
      const seed = this.fireflySeeds[i];
      firefly.x = seed.cx + Math.cos(time * seed.speed + seed.phase) * seed.r;
      firefly.y = seed.cy + Math.sin(time * seed.speed + seed.phase) * (seed.r * 0.45);
      firefly.alpha = 0.45 + Math.sin(time * 3 + seed.phase) * 0.25;
    });
  }

  private addVignette() {
    const vignette = this.add
      .rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x000000, 0)
      .setScrollFactor(0)
      .setDepth(10000);
    vignette.setStrokeStyle(0, 0x000000, 0);
  }
}
