// engine.js — canvas game engine for Loop Forest.
// Renders tiles, entities, player. Handles input, collision, camera, particles.

(function () {
  const { P, sprites, drawSprite: rawDrawSprite, grassTile } = window.PixelArt;
  const W = window.World;

  function createEngine({ canvas, hudFrame, callbacks }) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // --- Player state ---
    const player = {
      x: 305,
      y: 245,
      vx: 0,
      vy: 0,
      facing: 'down',
      moving: false,
      animTime: 0,
      footW: 8,
      footH: 4,
      speed: 70, // wp per second
    };

    // --- Entities (deep copy from world definition) ---
    const entities = W.ENTITIES.map(e => ({ ...e }));
    const byId = id => entities.find(e => e.id === id);

    // --- Tile map ---
    const tiles = W.buildTiles();

    // --- Camera ---
    const cam = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // --- Input ---
    const keys = {};
    let interactPressed = false;

    function onKeyDown(e) {
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) {
        e.preventDefault();
      }
      if (k === 'e' || k === ' ' || k === 'enter') {
        if (!engine.inputLocked) {
          interactPressed = true;
        }
      }
    }
    function onKeyUp(e) { keys[e.key.toLowerCase()] = false; }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // --- Particles ---
    const particles = [];
    function emitBurst(x, y, color, count = 8) {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const speed = 30 + Math.random() * 40;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 20,
          life: 0.8 + Math.random() * 0.6,
          maxLife: 0.8 + Math.random() * 0.6,
          color,
          size: 1 + Math.random() * 1,
        });
      }
    }

    function emitFloat(x, y, color) {
      particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: -16 - Math.random() * 14,
        life: 1.4,
        maxLife: 1.4,
        color,
        size: 1.5,
      });
    }

    // Ambient firefly particles
    const fireflies = [];
    for (let i = 0; i < 14; i++) {
      fireflies.push({
        x: Math.random() * W.WORLD_W,
        y: Math.random() * W.WORLD_H,
        phase: Math.random() * Math.PI * 2,
        radius: 20 + Math.random() * 40,
        speed: 0.4 + Math.random() * 0.4,
        bright: 0.5 + Math.random() * 0.5,
      });
    }

    // --- Sizing ---
    let scale = 3;
    let viewW = 800;
    let viewH = 500;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.imageSmoothingEnabled = false;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      viewW = rect.width;
      viewH = rect.height;
      // Pick a scale that shows ~24 tiles wide
      scale = Math.max(2, Math.min(5, Math.floor(viewW / (24 * W.TILE))));
    }

    resize();
    window.addEventListener('resize', resize);
    // Observe canvas size changes too
    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
    }

    // --- Collision: a list of solid rectangles in WORLD coords ---
    function getSolidRects() {
      const rects = [];
      // World bounds (small inset for grass margin)
      rects.push({ x: -100, y: 0, w: 110, h: W.WORLD_H }); // left wall
      rects.push({ x: W.WORLD_W - 10, y: 0, w: 110, h: W.WORLD_H }); // right wall
      rects.push({ x: 0, y: -100, w: W.WORLD_W, h: 140 }); // top wall (grass margin)
      rects.push({ x: 0, y: W.WORLD_H - 20, w: W.WORLD_W, h: 100 }); // bottom wall

      for (const e of entities) {
        if (!e.solid) continue;
        let w = e.footW ?? 8;
        let h = e.footH ?? 6;
        const ax = e.x - w / 2;
        const ay = e.y - h;
        rects.push({ x: ax, y: ay, w, h, ent: e });
      }
      return rects;
    }

    function rectsOverlap(a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function tryMove(dx, dy) {
      const solids = getSolidRects();
      const fw = player.footW, fh = player.footH;
      // X
      if (dx !== 0) {
        const nx = player.x + dx;
        const box = { x: nx - fw/2, y: player.y - fh, w: fw, h: fh };
        let blocked = false;
        for (const r of solids) if (rectsOverlap(box, r)) { blocked = true; break; }
        if (!blocked) player.x = nx;
      }
      // Y
      if (dy !== 0) {
        const ny = player.y + dy;
        const box = { x: player.x - fw/2, y: ny - fh, w: fw, h: fh };
        let blocked = false;
        for (const r of solids) if (rectsOverlap(box, r)) { blocked = true; break; }
        if (!blocked) player.y = ny;
      }
    }

    // --- Nearest interactable detection ---
    function findNearbyInteractable() {
      let best = null;
      let bestDist = 999;
      for (const e of entities) {
        if (!e.interactable) continue;
        const dx = e.x - player.x;
        const dy = e.y - player.y - 6;
        const d = Math.hypot(dx, dy);
        if (d < 28 && d < bestDist) { best = e; bestDist = d; }
      }
      return best;
    }

    // --- Robot loop animation state ---
    const loop = {
      running: false,
      iteration: 0,
      total: 5,
      phase: 'idle',   // 'walk_to_bush' | 'pick' | 'walk_back' | 'done'
      timer: 0,
      target: null,
      bushIndex: 0,
      // We'll animate berry-bot moving from its home to a bush, picking, and returning.
    };

    function startLoop() {
      const bot = byId('berrybot');
      bot._homeX = bot.x;
      bot._homeY = bot.y;
      bot._happy = true;
      // Reset bushes to have berries (in case re-run)
      for (let i = 1; i <= 5; i++) {
        const b = byId('b' + i);
        if (b) b.hasBerries = true;
      }
      loop.running = true;
      loop.iteration = 0;
      loop.phase = 'walk_to_bush';
      loop.timer = 0;
      loop.bushIndex = 0;
      pickNextBushTarget();
      if (callbacks?.onLoopStart) callbacks.onLoopStart();
    }

    function pickNextBushTarget() {
      const bushIds = ['b1','b2','b3','b4','b5'];
      const bush = byId(bushIds[loop.iteration % bushIds.length]);
      loop.target = bush;
    }

    function tickLoop(dt) {
      if (!loop.running) return;
      const bot = byId('berrybot');
      const target = loop.target;
      if (!target) return;

      if (loop.phase === 'walk_to_bush') {
        const dx = target.x - bot.x;
        const dy = (target.y - 6) - bot.y;
        const d = Math.hypot(dx, dy);
        const speed = 80;
        if (d < 4) {
          loop.phase = 'pick';
          loop.timer = 0;
        } else {
          bot.x += (dx / d) * speed * dt;
          bot.y += (dy / d) * speed * dt;
        }
      } else if (loop.phase === 'pick') {
        loop.timer += dt;
        if (loop.timer === dt) {
          // Emit pickup particles
          emitBurst(target.x, target.y - 6, P.r3, 8);
        }
        if (loop.timer > 0.4) {
          target.hasBerries = false;
          loop.phase = 'walk_back';
          loop.timer = 0;
        }
      } else if (loop.phase === 'walk_back') {
        const dx = bot._homeX - bot.x;
        const dy = bot._homeY - bot.y;
        const d = Math.hypot(dx, dy);
        const speed = 80;
        if (d < 4) {
          // iteration complete
          loop.iteration++;
          emitBurst(bot._homeX, bot._homeY - 8, P.a4, 6);
          if (callbacks?.onLoopProgress) callbacks.onLoopProgress(loop.iteration);
          if (loop.iteration >= loop.total) {
            loop.running = false;
            loop.phase = 'done';
            emitBurst(bot._homeX, bot._homeY - 8, P.a3, 16);
            if (callbacks?.onLoopComplete) setTimeout(() => callbacks.onLoopComplete(), 400);
          } else {
            loop.phase = 'walk_to_bush';
            pickNextBushTarget();
          }
        } else {
          bot.x += (dx / d) * speed * dt;
          bot.y += (dy / d) * speed * dt;
        }
      }
    }

    // --- Drawing helpers ---
    function drawSprite(sprite, wx, wy, anchor = 'bottom-center') {
      const sw = sprite[0].length;
      const sh = sprite.length;
      let ax = wx - sw / 2;
      let ay = wy - sh;
      if (anchor === 'center') { ax = wx - sw / 2; ay = wy - sh / 2; }
      if (anchor === 'top-left') { ax = wx; ay = wy; }
      const sxBase = Math.round((ax - cam.x) * scale);
      const syBase = Math.round((ay - cam.y) * scale);
      for (let y = 0; y < sh; y++) {
        const row = sprite[y];
        for (let x = 0; x < sw; x++) {
          const c = row[x];
          if (!c) continue;
          ctx.fillStyle = c;
          ctx.fillRect(sxBase + x * scale, syBase + y * scale, scale, scale);
        }
      }
    }

    // --- Tile rendering ---
    // We pre-render the tile map ONCE to an offscreen canvas at scale=1 (in wp units),
    // then blit it scaled. Saves a lot of fillRect ops.
    let tileCanvas = null;
    let tileCanvasScale = 0;

    function buildTileCanvas() {
      const tc = document.createElement('canvas');
      tc.width = W.WORLD_W * scale;
      tc.height = W.WORLD_H * scale;
      const tctx = tc.getContext('2d');
      tctx.imageSmoothingEnabled = false;
      // Fill grass base
      tctx.fillStyle = P.g2;
      tctx.fillRect(0, 0, tc.width, tc.height);

      // Draw cobblestone tiles where map says 1
      const cobble = sprites.COBBLE;
      for (let ty = 0; ty < W.H_TILES; ty++) {
        for (let tx = 0; tx < W.W_TILES; tx++) {
          if (tiles[ty][tx] === 1) {
            const wx = tx * W.TILE;
            const wy = ty * W.TILE;
            // draw cobble sprite (16x16 sprite pixels)
            for (let y = 0; y < cobble.length; y++) {
              const row = cobble[y];
              for (let x = 0; x < row.length; x++) {
                const c = row[x]; if (!c) continue;
                tctx.fillStyle = c;
                tctx.fillRect((wx + x) * scale, (wy + y) * scale, scale, scale);
              }
            }
          }
        }
      }

      // Add grass detail tufts (deterministic noise)
      for (let ty = 0; ty < W.H_TILES; ty++) {
        for (let tx = 0; tx < W.W_TILES; tx++) {
          if (tiles[ty][tx] !== 1) {
            // Pepper grass with detail
            const seed = (ty * 31 + tx) * 7;
            // Pixel-level noise pattern
            for (let py = 0; py < W.TILE; py++) {
              for (let px = 0; px < W.TILE; px++) {
                const n = ((seed + px * 13 + py * 17) * 9301) & 0xff;
                let col;
                if (n < 200) col = P.g2;
                else if (n < 235) col = P.g3;
                else col = P.g4;
                tctx.fillStyle = col;
                tctx.fillRect((tx * W.TILE + px) * scale, (ty * W.TILE + py) * scale, scale, scale);
              }
            }
          }
        }
      }

      // Re-draw cobblestone on top so the noise didn't overwrite
      for (let ty = 0; ty < W.H_TILES; ty++) {
        for (let tx = 0; tx < W.W_TILES; tx++) {
          if (tiles[ty][tx] === 1) {
            const wx = tx * W.TILE;
            const wy = ty * W.TILE;
            for (let y = 0; y < cobble.length; y++) {
              const row = cobble[y];
              for (let x = 0; x < row.length; x++) {
                const c = row[x]; if (!c) continue;
                tctx.fillStyle = c;
                tctx.fillRect((wx + x) * scale, (wy + y) * scale, scale, scale);
              }
            }
          }
        }
      }

      // Soft path edges - slightly lighter grass blending around cobble
      for (let ty = 0; ty < W.H_TILES; ty++) {
        for (let tx = 0; tx < W.W_TILES; tx++) {
          if (tiles[ty][tx] === 0) {
            // Check if neighbor is path
            const nbr = (dx, dy) => {
              const t = tiles[ty + dy]?.[tx + dx];
              return t === 1;
            };
            if (nbr(1,0) || nbr(-1,0) || nbr(0,1) || nbr(0,-1)) {
              tctx.fillStyle = 'rgba(106, 168, 90, 0.15)';
              tctx.fillRect(tx * W.TILE * scale, ty * W.TILE * scale, W.TILE * scale, W.TILE * scale);
            }
          }
        }
      }

      // Scatter flowers/mushrooms based on map markers
      const drawPixelArt = (sprite, wx, wy) => {
        for (let y = 0; y < sprite.length; y++) {
          for (let x = 0; x < sprite[y].length; x++) {
            const c = sprite[y][x]; if (!c) continue;
            tctx.fillStyle = c;
            tctx.fillRect((wx + x) * scale, (wy + y) * scale, scale, scale);
          }
        }
      };

      for (let ty = 0; ty < W.H_TILES; ty++) {
        for (let tx = 0; tx < W.W_TILES; tx++) {
          const t = tiles[ty][tx];
          if (t === 2) drawPixelArt(sprites.FLOWER_PINK, tx * W.TILE + 5, ty * W.TILE + 5);
          if (t === 3) drawPixelArt(sprites.FLOWER_BLUE, tx * W.TILE + 5, ty * W.TILE + 5);
          if (t === 4) drawPixelArt(sprites.FLOWER_YELLOW, tx * W.TILE + 5, ty * W.TILE + 5);
          if (t === 6) {
            // grass tuft - small dark cluster
            tctx.fillStyle = P.g1;
            tctx.fillRect((tx * W.TILE + 6) * scale, (ty * W.TILE + 10) * scale, 1 * scale, 2 * scale);
            tctx.fillRect((tx * W.TILE + 8) * scale, (ty * W.TILE + 9) * scale, 1 * scale, 3 * scale);
            tctx.fillRect((tx * W.TILE + 10) * scale, (ty * W.TILE + 10) * scale, 1 * scale, 2 * scale);
            tctx.fillStyle = P.g3;
            tctx.fillRect((tx * W.TILE + 8) * scale, (ty * W.TILE + 8) * scale, 1 * scale, 1 * scale);
          }
        }
      }

      tileCanvas = tc;
      tileCanvasScale = scale;
    }

    // --- Frame state ---
    let lastT = performance.now();
    let frameTimer = 0;
    let walkFrameToggle = false;
    let blinkToggle = false;
    let blinkTimer = 0;
    let totalTime = 0;
    let nearestInter = null;
    let lastNearestId = null;

    function update(dt) {
      totalTime += dt;
      // Input → velocity
      let dx = 0, dy = 0;
      if (engine.inputLocked) {
        dx = 0; dy = 0;
      } else {
        if (keys['w'] || keys['arrowup']) dy -= 1;
        if (keys['s'] || keys['arrowdown']) dy += 1;
        if (keys['a'] || keys['arrowleft']) dx -= 1;
        if (keys['d'] || keys['arrowright']) dx += 1;
      }
      if (dx || dy) {
        const len = Math.hypot(dx, dy);
        dx /= len; dy /= len;
        player.moving = true;
        if (Math.abs(dx) > Math.abs(dy)) {
          player.facing = dx > 0 ? 'right' : 'left';
        } else {
          player.facing = dy > 0 ? 'down' : 'up';
        }
        tryMove(dx * player.speed * dt, dy * player.speed * dt);
      } else {
        player.moving = false;
      }

      // Walk anim toggle
      frameTimer += dt;
      if (frameTimer > 0.16) {
        frameTimer = 0;
        walkFrameToggle = !walkFrameToggle;
      }
      // Byte blink
      blinkTimer += dt;
      if (blinkTimer > (blinkToggle ? 0.15 : 3.4)) {
        blinkTimer = 0;
        blinkToggle = !blinkToggle;
      }

      // Camera target = player; smooth lerp
      cam.targetX = player.x - (viewW / scale) / 2;
      cam.targetY = player.y - (viewH / scale) / 2;
      cam.targetX = Math.max(0, Math.min(W.WORLD_W - viewW / scale, cam.targetX));
      cam.targetY = Math.max(0, Math.min(W.WORLD_H - viewH / scale, cam.targetY));
      const lerp = 1 - Math.pow(0.001, dt);
      cam.x += (cam.targetX - cam.x) * lerp;
      cam.y += (cam.targetY - cam.y) * lerp;

      // Nearest interactable
      nearestInter = findNearbyInteractable();
      if ((nearestInter?.id || null) !== lastNearestId) {
        lastNearestId = nearestInter?.id || null;
        if (callbacks?.onProximityChange) callbacks.onProximityChange(nearestInter);
      }

      // Interact
      if (interactPressed) {
        interactPressed = false;
        if (nearestInter && callbacks?.onInteract) {
          callbacks.onInteract(nearestInter);
        }
      }

      // Tick particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 40 * dt; // light gravity
      }

      // Tick fireflies
      for (const f of fireflies) {
        f.phase += dt * f.speed;
      }

      tickLoop(dt);

      // Emit ambient sparkle around lit lanterns occasionally
      if (Math.random() < 0.06) {
        const lanterns = entities.filter(e => e.kind === 'lantern');
        const l = lanterns[Math.floor(Math.random() * lanterns.length)];
        if (l) emitFloat(l.x, l.y - 22, P.a4);
      }
    }

    function render() {
      // Sky / night background
      ctx.fillStyle = P.sky1;
      ctx.fillRect(0, 0, viewW, viewH);

      // Tile map (blit pre-rendered)
      if (!tileCanvas || tileCanvasScale !== scale) {
        buildTileCanvas();
      }
      const blitX = Math.round(-cam.x * scale);
      const blitY = Math.round(-cam.y * scale);
      ctx.drawImage(tileCanvas, blitX, blitY);

      // Soft vignette of light around lit lanterns (a warm radial)
      for (const e of entities) {
        if (e.kind === 'lantern' && e.light) {
          const sx = Math.round((e.x - cam.x) * scale);
          const sy = Math.round((e.y - 26 - cam.y) * scale);
          const r = 80 * scale / 3;
          const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
          const flicker = 0.55 + Math.sin(totalTime * 8 + e.x) * 0.05;
          grd.addColorStop(0, `rgba(245, 176, 76, ${0.32 * flicker})`);
          grd.addColorStop(0.5, `rgba(245, 176, 76, ${0.1 * flicker})`);
          grd.addColorStop(1, 'rgba(245, 176, 76, 0)');
          ctx.fillStyle = grd;
          ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
        }
      }

      // Ambient firefly halos
      ctx.globalCompositeOperation = 'lighter';
      for (const f of fireflies) {
        const ox = f.x + Math.sin(f.phase) * f.radius;
        const oy = f.y + Math.cos(f.phase * 0.7) * f.radius * 0.6;
        const sx = (ox - cam.x) * scale;
        const sy = (oy - cam.y) * scale;
        const a = (Math.sin(f.phase * 1.7) * 0.5 + 0.5) * f.bright;
        ctx.fillStyle = `rgba(255, 220, 130, ${0.28 * a})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 6 * scale / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 240, 200, ${0.9 * a})`;
        ctx.fillRect(sx - scale / 2, sy - scale / 2, scale, scale);
      }
      ctx.globalCompositeOperation = 'source-over';

      // Build drawable list of entities + player, sort by y
      const drawables = entities.map(e => ({ kind: 'entity', e, y: e.y })).concat([
        { kind: 'player', y: player.y }
      ]);
      drawables.sort((a, b) => a.y - b.y);

      for (const d of drawables) {
        if (d.kind === 'player') {
          drawPlayer();
        } else {
          drawEntity(d.e);
        }
      }

      // Foreground particles
      for (const p of particles) {
        const sx = (p.x - cam.x) * scale;
        const sy = (p.y - cam.y) * scale;
        const a = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = a;
        ctx.fillRect(sx - scale * p.size / 2, sy - scale * p.size / 2, scale * p.size, scale * p.size);
        ctx.globalAlpha = 1;
      }

      // Interaction "!" indicator over Byte / nearest NPC with dialogue available
      for (const e of entities) {
        if (!e.glow) continue;
        if (e.id === 'byte' && callbacks?.shouldShowByteHint?.()) {
          drawDialogueIndicator(e.x, e.y - 22);
        }
      }

      // Indicator on nearest interactable that's NOT in a locked state
      if (nearestInter && !engine.inputLocked) {
        const e = nearestInter;
        const sx = (e.x - cam.x) * scale;
        const sy = (e.y - 22 - cam.y) * scale;
        ctx.fillStyle = '#1a1408';
        ctx.fillRect(sx - 7, sy - 12, 14, 14);
        ctx.fillStyle = P.a3;
        ctx.fillRect(sx - 5, sy - 10, 10, 10);
        ctx.fillStyle = '#1a1408';
        ctx.font = `bold ${10}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('E', sx, sy - 5);
      }

      // Dark vignette around edges
      const vg = ctx.createRadialGradient(viewW/2, viewH/2, Math.min(viewW, viewH) * 0.4, viewW/2, viewH/2, Math.max(viewW, viewH) * 0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, viewW, viewH);
    }

    function drawDialogueIndicator(wx, wy) {
      const sx = (wx - cam.x) * scale;
      const sy = (wy - cam.y) * scale;
      const bob = Math.sin(totalTime * 3) * 2 * scale;
      ctx.fillStyle = '#1a1408';
      ctx.fillRect(sx - 6, sy + bob, 12, 14);
      ctx.fillStyle = P.a3;
      ctx.fillRect(sx - 4, sy + 2 + bob, 8, 10);
      ctx.fillStyle = '#1a1408';
      ctx.font = `bold ${10}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', sx, sy + 7 + bob);
    }

    function drawPlayer() {
      const f = player.facing;
      const moving = player.moving;
      let sprite;
      if (f === 'down') sprite = moving && walkFrameToggle ? sprites.PLAYER_DOWN_WALK : sprites.PLAYER_DOWN_IDLE;
      else if (f === 'up') sprite = sprites.PLAYER_UP_IDLE;
      else if (f === 'left' || f === 'right') sprite = moving && walkFrameToggle ? sprites.PLAYER_SIDE_WALK : sprites.PLAYER_SIDE_IDLE;
      else sprite = sprites.PLAYER_DOWN_IDLE;

      // Shadow under player
      const sx = (player.x - cam.x) * scale;
      const sy = (player.y - cam.y) * scale;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(sx, sy - 1, 6 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mirror sprite horizontally for left-facing
      if (f === 'left') {
        ctx.save();
        ctx.scale(-1, 1);
        const sw = sprite[0].length;
        // flip the x coordinate: we want the sprite to remain on player position
        const ax = player.x;
        const ay = player.y;
        const sxBase = Math.round(-((ax - sw/2 - cam.x) * scale + sw * scale));
        const syBase = Math.round((ay - sprite.length - cam.y) * scale);
        for (let y = 0; y < sprite.length; y++) {
          for (let x = 0; x < sw; x++) {
            const c = sprite[y][x]; if (!c) continue;
            ctx.fillStyle = c;
            ctx.fillRect(sxBase + x * scale, syBase + y * scale, scale, scale);
          }
        }
        ctx.restore();
      } else {
        drawSprite(sprite, player.x, player.y);
      }
    }

    function drawEntity(e) {
      switch (e.kind) {
        case 'tree': drawSprite(sprites.TREE, e.x, e.y); break;
        case 'bush': drawSprite(sprites.BUSH, e.x, e.y); break;
        case 'lantern': drawSprite(e.light ? sprites.LANTERN_ON : sprites.LANTERN_OFF, e.x, e.y); break;
        case 'sign': drawSprite(sprites.SIGN, e.x, e.y); break;
        case 'mushroom': drawSprite(sprites.MUSHROOM, e.x, e.y); break;
        case 'house': drawSprite(sprites.HOUSE, e.x, e.y); break;
        case 'berrybush':
          drawSprite(e.hasBerries ? sprites.BERRY_BUSH : sprites.BERRY_BUSH_EMPTY, e.x, e.y);
          break;
        case 'byte': {
          // Byte sometimes blinks
          const sprite = blinkToggle ? sprites.BYTE_IDLE_2 : sprites.BYTE_IDLE;
          // Subtle bob
          const bob = Math.sin(totalTime * 2.4) * 1;
          // Glow halo behind
          const sx = (e.x - cam.x) * scale;
          const sy = (e.y - 12 - cam.y) * scale;
          const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, 30 * scale / 3);
          grd.addColorStop(0, 'rgba(127, 196, 189, 0.4)');
          grd.addColorStop(1, 'rgba(127, 196, 189, 0)');
          ctx.fillStyle = grd;
          ctx.fillRect(sx - 30 * scale / 3, sy - 30 * scale / 3, 60 * scale / 3, 60 * scale / 3);
          drawSprite(sprite, e.x, e.y + bob);
          break;
        }
        case 'berrybot': {
          const sprite = e._happy ? sprites.BERRYBOT_HAPPY : sprites.BERRYBOT;
          const bob = e._happy ? Math.sin(totalTime * 4) * 1.5 : Math.sin(totalTime * 1.5) * 0.5;
          // Shadow
          const sx = (e.x - cam.x) * scale;
          const sy = (e.y - cam.y) * scale;
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.beginPath();
          ctx.ellipse(sx, sy - 1, 6 * scale, 2 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          drawSprite(sprite, e.x, e.y + bob);
          // Indicator if broken
          if (!e._happy && !loop.running) {
            // Already drawn by interaction hint logic
          }
          break;
        }
      }
    }

    let rafId = null;
    function frame() {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      update(dt);
      render();
      rafId = requestAnimationFrame(frame);
    }

    const engine = {
      inputLocked: false,
      start() { lastT = performance.now(); rafId = requestAnimationFrame(frame); },
      stop() {
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('resize', resize);
        if (resizeObserver) resizeObserver.disconnect();
      },
      startLoop,
      setBerryBotInteractable(can) {
        const bot = byId('berrybot');
        if (bot) bot.interactable = can ? 'berrybot' : null;
      },
      getPlayerPos() { return { x: player.x, y: player.y }; },
      teleportPlayer(x, y) { player.x = x; player.y = y; },
      getEntity(id) { return byId(id); },
      isLoopRunning() { return loop.running; },
    };

    return engine;
  }

  window.createGameEngine = createEngine;
})();
