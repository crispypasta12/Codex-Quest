import * as Phaser from "phaser";

import {
  ENTITIES,
  PLAYER_SPAWN,
  TILE,
  WORLD_H,
  WORLD_W,
  buildTiles,
  type WorldEntity,
} from "../data/worldMap";
import {
  byteIntroDialogue,
  byteReminderDialogue,
  completedLessonDialogue,
  lessonBoardDialogue,
  lockedLessonDialogue,
  moduleCompleteDialogue,
} from "../data/dialogues/loopForest";
import {
  getLesson,
  getLessonWorldName,
  isLessonUnlocked,
  lessonOrder,
  type LessonId,
} from "../data/lessons/loopForestFundamentals";
import { grassTile, sprites } from "../data/sprites";
import { createSpriteCanvas, type PixelSprite } from "../utils/renderPixelSprite";
import { useGameStore } from "@/lib/store";

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
  FENCE: "fence",
  CRATE: "crate",
  TOOLS: "tools",
  MAILBOX: "mailbox",
  BOOKS: "books",
  ROBOT_PARTS: "robot-parts",
  WORKBENCH: "workbench",
  CHARGING_STATION: "charging-station",
  BRIDGE: "bridge",
  PLANK: "plank",
  ROW_MARKER: "row-marker",
};

type Direction = "down" | "up" | "left" | "right";
type Rect = { x: number; y: number; w: number; h: number };
type ActionKeys = Record<"E" | "SPACE", Phaser.Input.Keyboard.Key>;

const BERRY_BUSH_IDS = ["b5", "b1", "b2", "b3", "b4"];
const IMPORTANT_CLEAR_RADIUS = 22;

type LanternLight = {
  entity: WorldEntity;
  glow: Phaser.GameObjects.Arc;
  core: Phaser.GameObjects.Arc;
  phase: number;
};

type DriftLeaf = {
  leaf: Phaser.GameObjects.Rectangle;
  baseX: number;
  baseY: number;
  speed: number;
  phase: number;
};

export class LoopForestScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Image;
  private playerShadow?: Phaser.GameObjects.Ellipse;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys?: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private actionKeys?: ActionKeys;
  private direction: Direction = "down";
  private walkTime = 0;
  private worldLayer?: Phaser.GameObjects.Layer;
  private entitySprites = new Map<string, Phaser.GameObjects.Image>();
  private interactionMarkers = new Map<string, Phaser.GameObjects.Text>();
  private fireflies: Phaser.GameObjects.Arc[] = [];
  private fireflySeeds: Array<{ cx: number; cy: number; r: number; speed: number; phase: number }> = [];
  private lanternLights: LanternLight[] = [];
  private driftLeaves: DriftLeaf[] = [];
  private lessonSparkles: Phaser.GameObjects.Arc[] = [];
  private lastSavedAt = 0;
  private isRobotRunning = false;

  private handlePuzzleRun = (event: Event) => {
    const detail = (event as CustomEvent<{ lessonId?: LessonId; repeat: number }>).detail;
    const repeat = detail?.repeat ?? 0;
    if ((detail?.lessonId ?? "loops-01") === "loops-01" && repeat === 5) this.runBerryBotLoop();
  };

  private handlePuzzleReset = () => {
    this.resetBerryBot();
  };

  private handleResetWorld = () => {
    this.resetBerryBot();
    if (this.player) {
      this.player.setPosition(PLAYER_SPAWN.x, PLAYER_SPAWN.y);
      this.direction = "down";
    }
  };

  private handleDialogueComplete = (event: Event) => {
    const id = (event as CustomEvent<{ id: string }>).detail?.id;
    const store = useGameStore.getState();

    if (id === "byte-module-intro") {
      store.startLesson("sequence-01");
    }

    if (id?.startsWith("lesson-intro-")) {
      const lessonId = id.replace("lesson-intro-", "") as LessonId;
      if (lessonOrder.includes(lessonId)) {
        window.setTimeout(() => useGameStore.getState().openPuzzle(lessonId), 180);
      }
    }
  };

  private handleKeyTap = (event: KeyboardEvent) => {
    if (this.isInputBlocked()) return;
    const key = event.key.toLowerCase();
    const step = 9;
    if (key === "e" || event.key === " ") {
      const nearest = this.getNearestInteractable();
      if (nearest) this.interactWith(nearest);
      return;
    }
    if (key === "a" || event.key === "ArrowLeft") this.tryMove(-step, 0);
    if (key === "d" || event.key === "ArrowRight") this.tryMove(step, 0);
    if (key === "w" || event.key === "ArrowUp") this.tryMove(0, -step);
    if (key === "s" || event.key === "ArrowDown") this.tryMove(0, step);
  };

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
    const savedPosition = useGameStore.getState().playerPosition;
    const spawn = savedPosition ?? PLAYER_SPAWN;
    this.player = this.add
      .image(spawn.x, spawn.y, "loop-forest/player-down-idle")
      .setOrigin(0.5, 1)
      .setDepth(PLAYER_SPAWN.y);
    this.playerShadow = this.add
      .ellipse(spawn.x, spawn.y - 2, 18, 6, 0x061006, 0.24)
      .setDepth(spawn.y - 8);
    this.worldLayer.add(this.playerShadow);
    this.worldLayer.add(this.player);

    this.cameras.main.startFollow(this.player, true, 0.13, 0.13);
    this.cameras.main.setDeadzone(42, 28);
    this.cameras.main.setZoom(2);

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keys = this.input.keyboard?.addKeys("W,A,S,D") as Record<
      "W" | "A" | "S" | "D",
      Phaser.Input.Keyboard.Key
    >;
    this.actionKeys = this.input.keyboard?.addKeys("E,SPACE") as ActionKeys;
    this.input.keyboard?.on("keydown", this.handleKeyTap);

    this.createFireflies();
    this.createDriftingLeaves();
    this.createLessonSparkles();
    this.addVignette();
    this.registerDomEvents();
  }

  update(_: number, delta: number) {
    this.updateInteractionPrompt();
    this.handleInteractionInput();
    this.updatePlayer(delta);
    this.updateFireflies(this.time.now / 1000);
    this.updateDriftingLeaves(this.time.now / 1000);
    this.updateLanternLights(this.time.now / 1000);
    this.updateLessonSparkles(this.time.now / 1000);
    this.updateInteractionMarkers(this.time.now / 1000);
    this.savePlayerPosition();
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
        const seed = ty * 97 + tx * 31;

        if (tile === 1) {
          this.drawPathTile(ctx, x, y, seed, tiles, tx, ty);
        } else {
          this.drawGrassTile(ctx, x, y, seed);
          if (this.isAdjacentToPath(tiles, tx, ty)) {
            this.drawGrassPathEdge(ctx, x, y, seed, tiles, tx, ty);
          }
        }

        if (tile === 0 && this.canPlaceGroundDetail(tx, ty)) this.drawGroundDetail(ctx, x, y, seed);
        if (tile === 1) this.drawPathDetail(ctx, x, y, seed);
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

    this.textures.addCanvas("loop-forest/map", canvas);
  }

  private drawGrassTile(ctx: CanvasRenderingContext2D, x: number, y: number, seed: number) {
    this.drawPixelGrid(ctx, grassTile(seed) as PixelSprite, x, y);
    const rng = this.seeded(seed + 1009);
    const tint = rng() > 0.62 ? "rgba(25,52,25,0.18)" : rng() > 0.42 ? "rgba(123,184,77,0.10)" : null;
    if (tint) {
      ctx.fillStyle = tint;
      ctx.fillRect(x, y, TILE, TILE);
    }
    for (let i = 0; i < 3; i++) {
      if (rng() < 0.42) {
        ctx.fillStyle = rng() > 0.5 ? "#5f9a45" : "#254722";
        ctx.fillRect(x + 2 + Math.floor(rng() * 12), y + 2 + Math.floor(rng() * 12), 1, 2);
      }
    }
  }

  private drawPathTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    seed: number,
    tiles: number[][],
    tx: number,
    ty: number,
  ) {
    const rng = this.seeded(seed + 3701);
    ctx.fillStyle = rng() > 0.5 ? "#54504c" : "#4b4848";
    ctx.fillRect(x, y, TILE, TILE);
    this.drawPixelGrid(ctx, sprites.COBBLE as PixelSprite, x, y);

    for (let i = 0; i < 4; i++) {
      const px = x + Math.floor(rng() * 14) + 1;
      const py = y + Math.floor(rng() * 14) + 1;
      ctx.fillStyle = rng() > 0.5 ? "#8c857a" : "#343232";
      ctx.fillRect(px, py, rng() > 0.75 ? 2 : 1, 1);
    }

    if (rng() > 0.62) {
      ctx.fillStyle = "rgba(34,31,31,0.5)";
      const sx = x + 3 + Math.floor(rng() * 8);
      const sy = y + 3 + Math.floor(rng() * 8);
      ctx.fillRect(sx, sy, 5, 1);
      ctx.fillRect(sx + 3, sy + 1, 1, 3);
    }

    const grass = "#4f8a3a";
    if (tiles[ty - 1]?.[tx] !== 1) this.drawEdgePixels(ctx, x, y, "top", grass, rng);
    if (tiles[ty + 1]?.[tx] !== 1) this.drawEdgePixels(ctx, x, y, "bottom", grass, rng);
    if (tiles[ty]?.[tx - 1] !== 1) this.drawEdgePixels(ctx, x, y, "left", grass, rng);
    if (tiles[ty]?.[tx + 1] !== 1) this.drawEdgePixels(ctx, x, y, "right", grass, rng);

    ctx.fillStyle = "rgba(0,0,0,0.10)";
    if (tiles[ty - 1]?.[tx] !== 1 && tiles[ty]?.[tx - 1] !== 1) ctx.fillRect(x, y, 4, 4);
    if (tiles[ty - 1]?.[tx] !== 1 && tiles[ty]?.[tx + 1] !== 1) ctx.fillRect(x + 12, y, 4, 4);
    if (tiles[ty + 1]?.[tx] !== 1 && tiles[ty]?.[tx - 1] !== 1) ctx.fillRect(x, y + 12, 4, 4);
    if (tiles[ty + 1]?.[tx] !== 1 && tiles[ty]?.[tx + 1] !== 1) ctx.fillRect(x + 12, y + 12, 4, 4);
  }

  private drawGrassPathEdge(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    seed: number,
    tiles: number[][],
    tx: number,
    ty: number,
  ) {
    const rng = this.seeded(seed + 781);
    const edgeColor = "rgba(106,168,90,0.20)";
    if (tiles[ty - 1]?.[tx] === 1) this.drawEdgePixels(ctx, x, y, "top", edgeColor, rng);
    if (tiles[ty + 1]?.[tx] === 1) this.drawEdgePixels(ctx, x, y, "bottom", edgeColor, rng);
    if (tiles[ty]?.[tx - 1] === 1) this.drawEdgePixels(ctx, x, y, "left", edgeColor, rng);
    if (tiles[ty]?.[tx + 1] === 1) this.drawEdgePixels(ctx, x, y, "right", edgeColor, rng);
  }

  private drawEdgePixels(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    edge: "top" | "bottom" | "left" | "right",
    color: string,
    rng: () => number,
  ) {
    ctx.fillStyle = color;
    const count = 5 + Math.floor(rng() * 4);
    for (let i = 0; i < count; i++) {
      const length = 1 + Math.floor(rng() * 5);
      const offset = Math.floor(rng() * 15);
      if (edge === "top") ctx.fillRect(x + offset, y, length, 1 + Math.floor(rng() * 2));
      if (edge === "bottom") ctx.fillRect(x + offset, y + 14, length, 2);
      if (edge === "left") ctx.fillRect(x, y + offset, 1 + Math.floor(rng() * 2), length);
      if (edge === "right") ctx.fillRect(x + 14, y + offset, 2, length);
    }
  }

  private drawGroundDetail(ctx: CanvasRenderingContext2D, x: number, y: number, seed: number) {
    const rng = this.seeded(seed + 5107);
    const roll = rng();
    if (roll < 0.15) return;
    if (roll < 0.32) {
      ctx.fillStyle = rng() > 0.5 ? "#e0a8c8" : "#fff3c2";
      ctx.fillRect(x + 4 + Math.floor(rng() * 8), y + 4 + Math.floor(rng() * 8), 1, 1);
      ctx.fillRect(x + 5 + Math.floor(rng() * 6), y + 4 + Math.floor(rng() * 8), 1, 1);
      return;
    }
    if (roll < 0.48) {
      ctx.fillStyle = "#1f3d2a";
      ctx.fillRect(x + 3 + Math.floor(rng() * 10), y + 5 + Math.floor(rng() * 8), 5, 3);
      return;
    }
    if (roll < 0.62) {
      ctx.fillStyle = "#5e5a55";
      ctx.fillRect(x + 4 + Math.floor(rng() * 8), y + 5 + Math.floor(rng() * 8), 2, 1);
      ctx.fillRect(x + 7 + Math.floor(rng() * 5), y + 8 + Math.floor(rng() * 4), 1, 1);
      return;
    }
    if (roll < 0.76) {
      ctx.fillStyle = "#6ba84a";
      const gx = x + 3 + Math.floor(rng() * 10);
      const gy = y + 5 + Math.floor(rng() * 8);
      ctx.fillRect(gx, gy, 1, 4);
      ctx.fillRect(gx + 2, gy + 1, 1, 3);
      ctx.fillRect(gx + 4, gy + 2, 1, 2);
      return;
    }
    if (roll < 0.86) {
      this.drawPixelGrid(ctx, sprites.MUSHROOM as PixelSprite, x + 5, y + 7);
      return;
    }
    ctx.fillStyle = "#8f6b36";
    ctx.fillRect(x + 4 + Math.floor(rng() * 8), y + 4 + Math.floor(rng() * 9), 2, 1);
  }

  private drawPathDetail(ctx: CanvasRenderingContext2D, x: number, y: number, seed: number) {
    const rng = this.seeded(seed + 9011);
    if (rng() < 0.55) return;
    ctx.fillStyle = rng() > 0.5 ? "#8c857a" : "#383636";
    ctx.fillRect(x + 3 + Math.floor(rng() * 9), y + 3 + Math.floor(rng() * 9), 2, 1);
    if (rng() > 0.5) ctx.fillRect(x + 8 + Math.floor(rng() * 4), y + 8 + Math.floor(rng() * 4), 1, 1);
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

  private canPlaceGroundDetail(tx: number, ty: number) {
    const px = tx * TILE + TILE / 2;
    const py = ty * TILE + TILE / 2;
    if (px < 26 || py < 34 || px > WORLD_W - 26 || py > WORLD_H - 26) return false;
    return !ENTITIES.some((entity) => {
      const radius = entity.interactable || entity.solid ? IMPORTANT_CLEAR_RADIUS + 10 : IMPORTANT_CLEAR_RADIUS;
      return Phaser.Math.Distance.Between(px, py, entity.x, entity.y) < radius;
    });
  }

  private seeded(seed: number) {
    let state = seed || 1;
    return () => {
      state += 0x6d2b79f5;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
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

      this.addGroundShadow(entity);
      const image = this.add.image(entity.x, entity.y, texture).setOrigin(0.5, 1).setDepth(entity.y);
      if (entity.kind === "byte") {
        const glow = this.add.circle(entity.x, entity.y - 18, 18, 0x7fc4bd, 0.12).setDepth(entity.y - 1);
        glow.setBlendMode(Phaser.BlendModes.ADD);
        this.worldLayer?.add(glow);
      }
      if (entity.kind === "lantern") {
        this.createLanternLight(entity);
      }
      this.worldLayer?.add(image);
      this.entitySprites.set(entity.id, image);
      this.animateAmbientEntity(entity, image);

      if (entity.lessonId) {
        const lesson = getLesson(entity.lessonId);
        const label = this.add
          .text(entity.x, entity.y + 8, lesson.worldName, {
            fontFamily: "monospace",
            fontSize: "8px",
            color: "#fff3c2",
            backgroundColor: "rgba(15,18,38,0.58)",
            padding: { x: 3, y: 1 },
          })
          .setOrigin(0.5, 0)
          .setDepth(entity.y + 20);
        this.worldLayer?.add(label);
      }

      if (entity.interactable) {
        const marker = this.add
          .text(entity.x, entity.y - (entity.kind === "house" ? 72 : 46), "!", {
            fontFamily: "monospace",
            fontSize: "12px",
            color: "#ffd685",
            backgroundColor: "rgba(15,18,38,0.78)",
            padding: { x: 4, y: 1 },
          })
          .setOrigin(0.5)
          .setDepth(entity.y + 40);
        this.worldLayer?.add(marker);
        this.interactionMarkers.set(entity.id, marker);
      }
    });
  }

  private addGroundShadow(entity: WorldEntity) {
    const sizes: Partial<Record<string, { w: number; h: number; alpha: number }>> = {
      house: { w: 74, h: 14, alpha: 0.28 },
      tree: { w: 34, h: 9, alpha: 0.26 },
      bush: { w: 24, h: 7, alpha: 0.18 },
      lantern: { w: 16, h: 5, alpha: 0.2 },
      sign: { w: 18, h: 5, alpha: 0.18 },
      byte: { w: 22, h: 6, alpha: 0.22 },
      berrybot: { w: 22, h: 6, alpha: 0.22 },
      berrybush: { w: 22, h: 6, alpha: 0.18 },
      workbench: { w: 34, h: 7, alpha: 0.2 },
      chargingstation: { w: 20, h: 6, alpha: 0.2 },
      bridge: { w: 56, h: 7, alpha: 0.16 },
    };
    const size = sizes[entity.kind] ?? { w: 18, h: 5, alpha: 0.14 };
    const shadow = this.add
      .ellipse(entity.x, entity.y - 2, size.w, size.h, 0x061006, size.alpha)
      .setDepth(entity.y - 8);
    shadow.setScale(1, 0.72);
    this.worldLayer?.add(shadow);
  }

  private createLanternLight(entity: WorldEntity) {
    const glow = this.add
      .circle(entity.x, entity.y - 24, 31, 0xf5b04c, 0.13)
      .setDepth(entity.y - 3)
      .setBlendMode(Phaser.BlendModes.ADD);
    const core = this.add
      .circle(entity.x, entity.y - 24, 8, 0xffd685, 0.22)
      .setDepth(entity.y - 2)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.worldLayer?.add([glow, core]);
    this.lanternLights.push({ entity, glow, core, phase: entity.x * 0.07 + entity.y * 0.03 });
  }

  private animateAmbientEntity(entity: WorldEntity, image: Phaser.GameObjects.Image) {
    if (entity.kind === "byte" || entity.kind === "berrybot") {
      this.tweens.add({
        targets: image,
        y: image.y - 2,
        duration: entity.kind === "byte" ? 1200 : 1500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: (entity.x + entity.y) % 500,
      });
    }
    if (entity.kind === "tree") {
      this.tweens.add({
        targets: image,
        angle: entity.x % 2 ? 0.45 : -0.45,
        duration: 2100 + (entity.y % 500),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
    if (entity.kind === "rowmarker" || entity.kind === "lantern") {
      this.tweens.add({
        targets: image,
        y: image.y - 1,
        duration: 1300 + (entity.x % 300),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
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
      case "fence":
        return "loop-forest/fence";
      case "crate":
        return "loop-forest/crate";
      case "tools":
        return "loop-forest/tools";
      case "mailbox":
        return "loop-forest/mailbox";
      case "books":
        return "loop-forest/books";
      case "robotparts":
        return "loop-forest/robot-parts";
      case "workbench":
        return "loop-forest/workbench";
      case "chargingstation":
        return "loop-forest/charging-station";
      case "bridge":
        return "loop-forest/bridge";
      case "plank":
        return "loop-forest/plank";
      case "rowmarker":
        return "loop-forest/row-marker";
      default:
        return null;
    }
  }

  private updatePlayer(delta: number) {
    if (!this.player || !this.cursors || !this.keys) return;
    if (this.isInputBlocked()) {
      const texture = this.playerTexture(this.direction, false);
      if (this.player.texture.key !== texture) this.player.setTexture(texture);
      return;
    }

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

      this.tryMove(dx * 82 * (delta / 1000), dy * 82 * (delta / 1000));
    }

    const walkFrame = moving && Math.floor(this.walkTime / 160) % 2 === 1;
    const texture = this.playerTexture(this.direction, walkFrame);
    if (this.player.texture.key !== texture) this.player.setTexture(texture);
    this.player.setFlipX(this.direction === "left");
    this.player.setDepth(this.player.y);
    if (this.playerShadow) {
      this.playerShadow.setPosition(this.player.x, this.player.y - 2);
      this.playerShadow.setDepth(this.player.y - 8);
      this.playerShadow.scaleX = moving ? 0.9 + Math.sin(this.walkTime / 70) * 0.04 : 1;
    }
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

  private registerDomEvents() {
    window.addEventListener("loopforest:puzzle-run", this.handlePuzzleRun);
    window.addEventListener("loopforest:puzzle-reset", this.handlePuzzleReset);
    window.addEventListener("loopforest:reset-world", this.handleResetWorld);
    window.addEventListener("loopforest:dialogue-complete", this.handleDialogueComplete);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("loopforest:puzzle-run", this.handlePuzzleRun);
      window.removeEventListener("loopforest:puzzle-reset", this.handlePuzzleReset);
      window.removeEventListener("loopforest:reset-world", this.handleResetWorld);
      window.removeEventListener("loopforest:dialogue-complete", this.handleDialogueComplete);
      this.input.keyboard?.off("keydown", this.handleKeyTap);
    });
  }

  private isInputBlocked() {
    const state = useGameStore.getState();
    return Boolean(
      !state.hasEntered ||
        state.onboardingOpen ||
        state.pauseOpen ||
        state.rewardOpen ||
        state.activeDialogue ||
        state.puzzleOpen ||
        this.isRobotRunning,
    );
  }

  private updateInteractionPrompt() {
    const store = useGameStore.getState();
    if (!this.player || this.isInputBlocked()) {
      store.setInteractionHint(null);
      return;
    }

    const nearest = this.getNearestInteractable();
    if (!nearest) {
      store.setInteractionHint(null);
      return;
    }

    store.setInteractionHint({
      id: nearest.id,
      action: this.actionForEntity(nearest),
      label: this.labelForEntity(nearest),
    });
  }

  private handleInteractionInput() {
    if (!this.actionKeys || this.isInputBlocked()) return;
    const pressed =
      Phaser.Input.Keyboard.JustDown(this.actionKeys.E) ||
      Phaser.Input.Keyboard.JustDown(this.actionKeys.SPACE);
    if (!pressed) return;

    const nearest = this.getNearestInteractable();
    if (nearest) this.interactWith(nearest);
  }

  private getNearestInteractable(): WorldEntity | null {
    if (!this.player) return null;
    let bestEntity: WorldEntity | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    ENTITIES.forEach((entity) => {
      if (!entity.interactable) return;
      const distance = Phaser.Math.Distance.Between(this.player!.x, this.player!.y, entity.x, entity.y);
      const range = entity.kind === "berrybot" ? 56 : 44;
      if (distance > range) return;
      if (distance < bestDistance) {
        bestEntity = entity;
        bestDistance = distance;
      }
    });

    return bestEntity;
  }

  private interactWith(entity: WorldEntity) {
    const store = useGameStore.getState();

    if (entity.interactable === "byte") {
      if (store.moduleCompleted) {
        store.openDialogue(moduleCompleteDialogue);
        return;
      }
      if (store.lessonProgressById["sequence-01"] === 0 && store.completedLessons.length === 0) {
        store.openDialogue(byteIntroDialogue);
        return;
      }
      store.openDialogue(byteReminderDialogue(store.activeLessonId, store.completedLessons));
      return;
    }

    if (entity.interactable === "lesson" && entity.lessonId) {
      const lessonId = entity.lessonId;
      const lesson = getLesson(lessonId);
      if (!isLessonUnlocked(lesson, store.completedLessons)) {
        store.openDialogue(lockedLessonDialogue(lessonId));
        return;
      }
      store.startLesson(lessonId);
      if (store.completedLessons.includes(lessonId)) {
        store.openDialogue(completedLessonDialogue(lessonId));
        window.setTimeout(() => useGameStore.getState().openPuzzle(lessonId), 260);
        return;
      }
      store.openDialogue(lesson.npcDialogue);
      return;
    }

    if (entity.interactable === "sign") {
      store.openDialogue(lessonBoardDialogue(store.completedLessons, store.activeLessonId, store.lessonProgressById));
    }
  }

  private actionForEntity(entity: WorldEntity) {
    if (entity.interactable === "byte") return "Talk";
    if (entity.interactable === "lesson" && entity.lessonId) {
      const store = useGameStore.getState();
      const lesson = getLesson(entity.lessonId);
      if (!isLessonUnlocked(lesson, store.completedLessons)) return "Locked";
      return store.completedLessons.includes(entity.lessonId) ? "Replay" : "Start";
    }
    if (entity.interactable === "berrybot") return "Inspect";
    return "Read";
  }

  private labelForEntity(entity: WorldEntity) {
    if (entity.interactable === "byte") return "Byte";
    if (entity.interactable === "lesson" && entity.lessonId) return getLessonWorldName(entity.lessonId);
    if (entity.interactable === "berrybot") return "Berry Bot";
    return "Loop Forest Fundamentals";
  }

  private updateInteractionMarkers(time: number) {
    this.interactionMarkers.forEach((marker, id) => {
      const entity = ENTITIES.find((item) => item.id === id);
      if (!entity) return;
      marker.y = entity.y - (entity.kind === "house" ? 72 : 46) + Math.sin(time * 3) * 2;
      marker.alpha = 0.62 + Math.sin(time * 4) * 0.2;
    });
  }

  private savePlayerPosition() {
    if (!this.player || this.time.now - this.lastSavedAt < 1000) return;
    this.lastSavedAt = this.time.now;
    useGameStore.getState().setPlayerPosition({
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
    });
  }

  private resetBerryBot() {
    this.isRobotRunning = false;
    const bot = this.entitySprites.get("berrybot");
    const botEntity = ENTITIES.find((entity) => entity.id === "berrybot");
    if (bot && botEntity) {
      this.tweens.killTweensOf(bot);
      bot.setPosition(botEntity.x, botEntity.y);
      bot.setTexture("loop-forest/berrybot");
      bot.setDepth(bot.y);
    }

    BERRY_BUSH_IDS.forEach((id) => {
      this.entitySprites.get(id)?.setTexture("loop-forest/berry-bush").setAlpha(1);
    });
    useGameStore.setState({ puzzleCollected: 0, puzzleStatus: "idle", puzzleMessage: "" });
  }

  private runBerryBotLoop() {
    const bot = this.entitySprites.get("berrybot");
    if (!bot || this.isRobotRunning) return;

    this.resetBerryBot();
    this.isRobotRunning = true;
    useGameStore.getState().setPuzzleRunning();
    useGameStore.getState().setQuestState("WATCH_BOT_WORK");

    const targets = BERRY_BUSH_IDS.map((id) => ({
      entity: ENTITIES.find((item) => item.id === id),
      sprite: this.entitySprites.get(id),
    })).filter((target): target is { entity: WorldEntity; sprite: Phaser.GameObjects.Image } =>
      Boolean(target.entity && target.sprite),
    );

    const collectAt = (index: number) => {
      const target = targets[index];
      if (!target) {
        bot.setTexture("loop-forest/berrybot-happy");
        this.createSuccessBurst(bot.x, bot.y - 18);
        this.isRobotRunning = false;
        useGameStore.getState().completePuzzle();
        useGameStore.getState().grantLoopReward();
        return;
      }

      this.tweens.add({
        targets: bot,
        x: target.entity.x,
        y: target.entity.y + 10,
        duration: 430,
        ease: "Sine.easeInOut",
        onUpdate: () => bot.setDepth(bot.y),
        onComplete: () => {
          this.tweens.add({
            targets: bot,
            y: target.entity.y + 6,
            duration: 130,
            yoyo: true,
            ease: "Sine.easeInOut",
            onComplete: () => {
              target.sprite.setTexture("loop-forest/berry-bush-empty");
              this.createBerryBurst(target.entity.x, target.entity.y - 20);
              useGameStore.getState().setPuzzleCollected(index + 1);
              this.time.delayedCall(60, () => collectAt(index + 1));
            },
          });
        },
      });
    };

    collectAt(0);
  }

  private createBerryBurst(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const berry = this.add.circle(x, y, 2, 0xe85a6e, 0.95).setDepth(9000);
      this.tweens.add({
        targets: berry,
        x: x + Math.cos(i * 0.8) * (10 + i),
        y: y + Math.sin(i * 0.8) * 10 - 12,
        alpha: 0,
        duration: 420,
        ease: "Quad.easeOut",
        onComplete: () => berry.destroy(),
      });
    }
  }

  private createSuccessBurst(x: number, y: number) {
    this.cameras.main.shake(120, 0.0025);
    for (let i = 0; i < 18; i++) {
      const mote = this.add.circle(x, y, i % 2 ? 1.5 : 2, i % 3 ? 0xffd685 : 0x7fc4bd, 0.95).setDepth(9200);
      this.tweens.add({
        targets: mote,
        x: x + Math.cos((Math.PI * 2 * i) / 18) * (24 + (i % 4) * 6),
        y: y + Math.sin((Math.PI * 2 * i) / 18) * (18 + (i % 3) * 5),
        alpha: 0,
        duration: 760,
        ease: "Cubic.easeOut",
        onComplete: () => mote.destroy(),
      });
    }
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
        this.add
          .circle(cx, cy, i % 3 === 0 ? 1.4 : 1, 0xffd685, 0.85)
          .setDepth(6400)
          .setBlendMode(Phaser.BlendModes.ADD),
      );
    }
  }

  private updateFireflies(time: number) {
    const paused = useGameStore.getState().pauseOpen;
    this.fireflies.forEach((firefly, i) => {
      const seed = this.fireflySeeds[i];
      if (paused) {
        firefly.alpha = 0.12;
        return;
      }
      firefly.x = seed.cx + Math.cos(time * seed.speed + seed.phase) * seed.r;
      firefly.y = seed.cy + Math.sin(time * seed.speed + seed.phase) * (seed.r * 0.45);
      firefly.alpha = 0.45 + Math.sin(time * 3 + seed.phase) * 0.25;
    });
  }

  private createDriftingLeaves() {
    const leafColors = [0x9a6b34, 0xb3793f, 0x6ba84a, 0xd49a5a];
    for (let i = 0; i < 10; i++) {
      const baseX = 40 + ((i * 53) % (WORLD_W - 80));
      const baseY = 48 + ((i * 37) % (WORLD_H - 96));
      const leaf = this.add
        .rectangle(baseX, baseY, i % 2 ? 3 : 2, 1, leafColors[i % leafColors.length], 0.6)
        .setDepth(6500);
      this.driftLeaves.push({
        leaf,
        baseX,
        baseY,
        speed: 0.12 + (i % 4) * 0.035,
        phase: i * 0.71,
      });
    }
  }

  private updateDriftingLeaves(time: number) {
    const paused = useGameStore.getState().pauseOpen;
    this.driftLeaves.forEach((item) => {
      if (paused) {
        item.leaf.alpha = 0.12;
        return;
      }
      const drift = (time * item.speed * 22 + item.phase * 19) % (WORLD_W + 60);
      item.leaf.x = (item.baseX + drift) % (WORLD_W + 30) - 15;
      item.leaf.y = item.baseY + Math.sin(time * 0.8 + item.phase) * 18 + Math.cos(time * 0.23 + item.phase) * 8;
      item.leaf.angle = Math.sin(time * 1.4 + item.phase) * 18;
      item.leaf.alpha = 0.28 + Math.sin(time * 0.9 + item.phase) * 0.16;
    });
  }

  private createLessonSparkles() {
    ENTITIES.filter((entity) => entity.lessonId).forEach((entity, index) => {
      for (let i = 0; i < 3; i++) {
        const sparkle = this.add
          .circle(entity.x + (i - 1) * 9, entity.y - 28 - ((index + i) % 2) * 6, 1, i % 2 ? 0x7fc4bd : 0xffd685, 0.55)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setDepth(entity.y + 18);
        this.lessonSparkles.push(sparkle);
      }
    });
  }

  private updateLessonSparkles(time: number) {
    this.lessonSparkles.forEach((sparkle, index) => {
      sparkle.alpha = 0.16 + Math.max(0, Math.sin(time * 2.3 + index * 0.9)) * 0.48;
      sparkle.scale = 0.8 + Math.sin(time * 2 + index) * 0.22;
    });
  }

  private updateLanternLights(time: number) {
    this.lanternLights.forEach((light) => {
      const flicker = 0.84 + Math.sin(time * 5.4 + light.phase) * 0.08 + Math.sin(time * 11.1 + light.phase) * 0.04;
      light.glow.setAlpha(0.1 * flicker);
      light.glow.setScale(0.92 + flicker * 0.12);
      light.core.setAlpha(0.2 * flicker);
      light.core.setScale(0.9 + flicker * 0.12);
    });
  }

  private addVignette() {
    const key = "loop-forest/vignette";
    if (!this.textures.exists(key)) {
      const canvas = document.createElement("canvas");
      canvas.width = 960;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(480, 300, 120, 480, 300, 520);
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(0.68, "rgba(7,9,26,0.08)");
        gradient.addColorStop(1, "rgba(7,9,26,0.48)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 960, 600);
      }
      this.textures.addCanvas(key, canvas);
    }
    this.add.image(480, 300, key).setScrollFactor(0).setDepth(10000).setAlpha(0.86);
  }
}
