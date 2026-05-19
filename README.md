# Handoff: The Code Academy — Loop Forest (Vertical Slice)

## Current Vertical Slice

Loopvale Academy now includes a playable Loop Forest lesson:

- Land on the page and choose **Enter Loop Forest**.
- Move with **WASD** or **arrow keys**.
- Interact with **E** or **Space**.
- Press **Esc** or the pause button for the pause menu.
- Talk to Byte, find the Berry Bot, run `repeat 5 times: collectBerry()`, collect five berries, earn +50 XP, unlock the **Loop Apprentice Badge**, then return to Byte to complete the quest.

## Run And Build

```bash
npm install
npm run dev
npm run build
```

The dev server uses Next.js. If port `3000` is occupied, Next will choose the next available port.

## Implemented Lesson

- Chapter: **Loop Forest**
- Quest: **Teach the Berry Bot to Loop**
- Concept: loops repeat a command a fixed number of times
- Puzzle: choose **Repeat 5 Times**, run the robot, and watch it collect five berries
- Reward: **+50 XP**, **Loop Apprentice Badge**, **Berry Bot Sticker**

## Playtest Checklist

- Start from the onboarding controls screen.
- Talk to Byte.
- Follow the objective tracker to the Berry Bot.
- Confirm the puzzle has Run, Reset, and hint behavior.
- Watch the robot collect all five berries.
- Close the reward popup.
- Return to Byte and verify the quest reaches 5/5.
- Refresh the page and confirm XP, badge, quest state, and player position persist.
- Use **Reset Lesson** from the HUD or pause menu for a clean replay.

## Visual Polish Checklist

- Map texture generation lives in `src/game/scenes/LoopForestScene.ts`; keep tile variation, terrain edge overlays, and ground details deterministic so save/load and collision stay untouched.
- World layout and decorative storytelling props live in `src/game/data/worldMap.ts`; lesson IDs, unlock requirements, and interactable IDs should remain stable.
- Visible place labels use each lesson `worldName`; lesson board titles and puzzle copy keep the CS learning language.
- Generated pixel sprites live in `src/game/data/sprites.ts`; placeholder props are safe to replace with final authored assets later.
- HUD polish lives mostly in `src/app/globals.css` and React HUD components; preserve the Zustand persistence key `loopvale-progress-v1`.
- Final QA should cover all four lessons, reward/XP updates, refresh persistence, reset progress, keyboard controls, and puzzle interactions.

## Known Limitations

- Pixel art is generated from placeholder sprite grids and can be swapped for final art later.
- Audio hooks exist in the project but this slice keeps sound minimal.
- Save data is localStorage-only; no backend sync is included.
- Only the loops lesson is implemented.

## Roadmap

- Add final authored pixel assets and audio.
- Add more lessons after loops: functions, conditionals, data structures.
- Add richer accessibility settings and controller support.
- Add optional account sync when the backend direction is decided.

## Overview

A cozy pixel-art browser game that teaches computer science through exploration. This handoff covers the **first vertical slice**: a landing hero with an interactive bookshelf, plus a playable Loop Forest scene where the player meets Byte (the robot teacher), helps a broken berry-collecting robot, and learns about loops by running a `repeat 5 times` block.

The tone is **cozy, magical, nostalgic** — Stardew Valley × Animal Crossing × a quiet indie RPG. **Not** a coding bootcamp dashboard.

---

## About the Design Files

The files in `prototype/` are a **runnable design reference**, not production code. They are a single-page React + canvas prototype loaded inline through Babel-standalone for fast iteration during design.

Your task is to **recreate this experience in a proper Next.js + TypeScript + Tailwind + Phaser codebase** following the spec below. Use the prototype as the source of truth for:

- Exact visual design (palette, typography, layout, animations)
- Sprite definitions and world layout
- Quest state machine and dialogue copy
- HUD composition and interaction patterns

The architecture and code style of the prototype should **not** be ported verbatim — it's intentionally compact and uses raw canvas. The production version should use Phaser.js for the game scene and a proper React component tree.

---

## Fidelity

**High-fidelity (hifi).** All colors, typography, spacing, sprite art, animation timings, and copy in the prototype are final. Recreate them pixel-perfectly using the target stack. Sprite pixel arrays in `prototype/pixel-art.js` are the canonical source for character/prop art.

---

## Target Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 14+** (App Router) | SSR for the landing page; client-only for the game canvas |
| Language | **TypeScript** | Strict mode |
| Styling | **Tailwind CSS** | + a small set of CSS custom properties for the cozy palette (mirror the `:root` block in `prototype/styles.css`) |
| UI primitives | **shadcn/ui** | For buttons, dialog, tooltip, slider — restyled to match cozy palette |
| Game engine | **Phaser 3** | For Loop Forest scene. Bookshelf in the hero stays React+SVG. |
| Fonts | Google Fonts | `Pixelify Sans` (titles), `Silkscreen` (UI), `Outfit` (body), `JetBrains Mono` (code blocks) |
| State | React state + Zustand (suggested) | Quest state, dialogue queue, XP — small, no need for Redux |
| Audio | Web Audio API | Placeholder synth in prototype; swap for real assets when available |

---

## Suggested Folder Structure

```
app/
  layout.tsx                  # Loads fonts, global styles
  page.tsx                    # Landing: <Hero/> + <GameSection/>
  globals.css                 # Tailwind + cozy palette CSS vars

components/
  hero/
    Hero.tsx
    Bookshelf.tsx             # SVG bookshelf with hover tooltips
    Book.tsx                  # Single book + spine glyph
    StarField.tsx
    FloatingParticles.tsx
    TitleLogo.tsx

  game/
    GameSection.tsx           # Wraps Phaser canvas + HUD overlays
    PhaserCanvas.tsx          # Mounts the Phaser.Game; exposes ref + events
    HUD/
      PlayerCard.tsx          # Avatar, name, level, XP bar
      QuestTracker.tsx        # Collapsible quest objectives
      InteractionHint.tsx     # "[E] Talk to Byte" pill
      KeysFooter.tsx          # WASD / E / Esc hints
    Dialogue/
      DialogueBox.tsx
      Portrait.tsx
      useTypewriter.ts
    Quest/
      RepeatLoopPanel.tsx     # The "Repeat 5 Times" code panel
      RewardPopup.tsx
    PauseOverlay.tsx
    dialogue-data.ts          # All NPC line scripts

  ui/                         # shadcn/ui components, restyled

phaser/
  LoopForestScene.ts          # Main Phaser.Scene
  systems/
    PlayerController.ts       # WASD + collision + facing/anim
    CameraFollow.ts
    InteractionSystem.ts      # Proximity detection + 'E' handler
    DialogueBridge.ts         # postMessage between Phaser and React
    QuestSystem.ts            # State machine; runs the loop animation
    ParticleEmitter.ts        # Bursts, fireflies, lantern motes
    LightingOverlay.ts        # Lantern radial glows + screen vignette
  data/
    worldMap.ts               # Tile map + entity definitions (port from world.js)
    sprites.ts                # Sprite pixel arrays (port from pixel-art.js)
  utils/
    renderPixelSprite.ts      # Generates a Phaser Texture from a pixel array

lib/
  store.ts                    # Zustand: questStep, xp, level, dialogue, sound
  audio.ts                    # WebAudio synth (port from createSounds() in game.jsx)

public/
  fonts/                      # Self-host fonts for perf (optional)
  audio/                      # Real audio files when available
```

---

## Design Tokens

These live in `prototype/styles.css` under `:root`. Mirror them in `globals.css` as CSS variables (or extend Tailwind's `theme.colors`).

### Color Palette

```css
/* Backgrounds — deep cozy night */
--bg-void:  #07091a;
--bg-deep:  #0f1226;
--bg-mid:   #1a1f3a;
--bg-soft:  #242a4a;

/* Ink (text) */
--ink:      #f4e8d0;   /* primary text */
--ink-dim:  #c9b894;   /* secondary text */
--ink-mute: #8a7a5e;   /* tertiary/labels */

/* Accents */
--amber:        #f5b04c;   /* primary accent — buttons, glows, lanterns */
--amber-warm:   #ffd685;   /* highlights */
--amber-glow:   #ffba5c;
--teal:         #5b9b94;   /* Byte robot, code keywords */
--teal-bright:  #7fc4bd;
--purple:       #8b6db0;   /* data structures */
--purple-bright:#b594d9;
--rose:         #e85a6e;   /* berry-bot, errors, repeat keyword */
--rose-soft:    #ff8a9a;

/* Wood (UI frames, shelf, signs) */
--wood-dark:  #4a2f1e;
--wood-mid:   #7a4a2a;
--wood-light: #b3793f;
--wood-glow:  #d49a5a;

/* Leaves & grass (world art) */
--leaf-dark:   #1f3d2a;
--leaf-mid:    #3a6b3f;
--leaf-light:  #6ba85a;
--grass-dark:  #2d4a2a;
--grass-mid:   #4a7a3a;
--grass-light: #82b34a;

/* Stone (paths, cobble) */
--stone:       #4d536b;
--stone-light: #7b8099;
```

### Typography

```css
--font-title: 'Pixelify Sans', 'VT323', monospace;     /* H1/H2, NPC names */
--font-ui:    'Silkscreen', monospace;                 /* labels, kbd, tags */
--font-body:  'Outfit', 'Inter', system-ui, sans-serif; /* body text, dialogue */
--font-code:  'JetBrains Mono', monospace;             /* code blocks */
```

Sizing scale (used in prototype):
- Hero title: `clamp(48px, 7vw, 92px)`, line-height 0.95
- Section titles: 22–28px (Pixelify Sans)
- Body: 14–16px (Outfit)
- UI labels: 10–12px (Silkscreen, `letter-spacing: 0.08–0.12em`, uppercase)
- Code: 13px (JetBrains Mono)
- Dialogue text: 15px (Outfit)

### Radius & Shadows

```css
/* Common radii */
4px   — small chips, kbd
6px   — buttons
8px   — input fields, icon buttons, code blocks
10px  — HUD cards
14–16px — overlays (dialogue, quest panel, reward)

/* Signature button shadow (amber primary) */
box-shadow:
  0 0 0 1px rgba(255, 220, 150, 0.6) inset,
  0 0 0 2px #2a1a08,         /* pixel-style outline */
  0 4px 0 #2a1a08,           /* drop shadow / press effect */
  0 8px 32px rgba(245, 176, 76, 0.4); /* warm glow */
```

### Spacing

Standard 4/8/12/16/24/32/48px scale (Tailwind default works).

---

## Screens & Views

### 1) Hero Section (`/`)

**Purpose:** First impression. Establish tone, present curriculum as books, drive scroll to game.

**Layout:** Full viewport. CSS grid `1fr 1fr` on desktop (≥960px), single column below (bookshelf order: -1 so it appears above text). Max-width 1280px, padding 56px 32px 80px.

**Background:** Multi-layer radial gradients (`#07091a → #1a1438`), animated `<StarField/>` (80 stars, individual blink animations), `<FloatingParticles/>` (24 amber/teal/purple motes drifting upward), parallax on scroll (stars: 0.3×, bookshelf: 0.1×; content fades out by 600px scrolled).

**Left column** (in source order):
- **Tag pill:** `<div class="hero-tag">` with pulsing amber dot + text `"Loop Forest · Open Now"`. 11px Silkscreen, uppercase.
- **Title:** Two-line H1. First line plain `"The "`, second line gradient text `"Code Academy"` (amber → rose gradient + drop-shadow glow), tiny subtitle below: `"a cozy place to learn how machines think"`.
- **Subtitle:** 18px Outfit, ink-dim. Mentions Loop Forest, tired machines, learning by lantern light. See prototype for exact copy.
- **CTAs:** Primary amber button `"Enter The Academy"` (smooth scrolls to game section). Ghost button `"Read the Codex"` (no-op for now).
- **Stats row:** Three stat blocks (`7 Chapters`, `240+ Lessons`, `∞ Loops`). Number 28px Pixelify Sans; label 10px Silkscreen, ink-mute, uppercase. Dashed top border.

**Right column — `<Bookshelf/>` (SVG, 440×640 viewBox):**
- Three wooden shelves with cornice + decorative trim battlements at top.
- Wood grain stripes on back panel.
- Two hanging amber lanterns (left x=20, right x=410) with animated flame fill (color cycles 2.6s) and a radial light gradient halo (opacity pulses 3.4s).
- 12 magic sparkle dots scattered behind books, each fades + drifts up on its own 3–6s schedule.
- 3 drifting pixel clouds at low opacity (28–36s travel times).
- Books are laid out across 3 shelves with these properties (from prototype data):

| ID | Title | Chapter | Pages | Body | Edge | Glow | Spine glyph | H | W | Tilt |
|----|-------|---------|-------|------|------|------|-------------|---|---|------|
| loops | Loops | Ch. 1 | 24 | `#f5b04c` | `#b07020` | `#ffd685` | infinity | 110 | 28 | -3° |
| functions | Functions | Ch. 2 | 31 | `#5b9b94` | `#2d6b62` | `#7fc4bd` | lambda | 132 | 26 | 2° |
| algorithms | Algorithms | Ch. 3 | 48 | `#e85a6e` | `#a02a3a` | `#ff8a9a` | maze | 144 | 32 | -1° |
| datastructures | Data Structures | Ch. 4 | 42 | `#8b6db0` | `#5a3f80` | `#b594d9` | tree | 138 | 30 | 4° |
| networking | Networking | Ch. 5 | 36 | `#7faedb` | `#4a76b0` | `#cce7ff` | nodes | 120 | 28 | -2° |
| memory | Memory | Ch. 6 | 28 | `#c4905e` | `#7a4a2a` | `#d49a5a` | grid | 128 | 30 | 1° |
| security | Security | Ch. 7 | 33 | `#3a6b3f` | `#1f3d2a` | `#6ba85a` | lock | 116 | 26 | -3° |

  Each book: body rect + 1px edge frame + spine bands at top/bottom + vertical title text (Pixelify Sans, glow color) + bottom symbol glyph + sparkle animations. See `prototype/hero.jsx::Book` and `SpineSymbol` for exact pixel coords.

- **Decorations between books:** small potted plant (shelf 1), glowing teal orb that pulses (shelf 2), aged scroll (shelf 3). Coordinates in prototype.

- **Hover behavior:** On `:hover`, book lifts 12px up with -2° rotation, gains a drop-shadow in its glow color, and a tooltip appears (positioned at mouse). Tooltip is `rgba(15, 18, 38, 0.96)` with amber border, blur-backdrop, contains: title (16px Pixelify Sans), description (12px Outfit dim), and meta line `"Ch. N · N lessons"` in amber Silkscreen. Tooltip has a CSS-only diamond pointer below.

### 2) Section Divider

Between hero and game. Linear-gradient strip (mid → forest dark), radial green glow at bottom. Inner row has `"Now Entering"` left, `"Loop Forest"` center (Pixelify Sans), `"Scroll to enter ↓"` right. Used to set chapter context.

### 3) Game Frame (`#game-section`)

**Layout:** Centered max-width 1280px. Header row with `"Chapter 01 — Loop Forest — <step hint>"`. Below: a 16:10 aspect-ratio frame (max-height 80vh) holding the canvas.

**Frame styling:** Background `#1a2510`, 2px border `#2a3b1f`, big drop shadow + inner forest-green glow. Border-radius 14px. Clips overflow.

**Inside the frame, stacked z-layers:**
- **Canvas** (`<canvas class="game-canvas">`) — Phaser viewport. Pixel-perfect: `image-rendering: pixelated`, no smoothing.
- **HUD layer** (`position: absolute; inset: 0; pointer-events: none`) — Each HUD widget enables pointer events on itself.
- **Overlays** (dialogue, quest panel, reward, pause) — Render conditionally based on store state.

### 4) HUD Components

All HUD cards: `rgba(15, 18, 38, 0.72)` + `backdrop-filter: blur(12px)`, 1px amber-tinted border, 10px radius, soft drop shadow.

#### PlayerCard (top-left)
- 36×36 avatar tile (gradient purple→teal, amber border, white initial "A")
- Name "Acorn" + level pill on right ("Lv 1")
- XP bar: 8px tall, gradient amber→amber-warm→rose-soft, shimmer animation (translateX of a white gradient sweep, 2.4s linear infinite). Inner border-radius 4px.
- Below bar: current XP / max XP in Silkscreen, ink-mute.

#### QuestTracker (top-left, below PlayerCard)
- Header row: amber square glyph with "!", "The First Loop" title (Pixelify Sans 13px), progress pill `0/3` (right-aligned, amber, 999px radius), collapse toggle button `▾` / `▸`.
- Objectives list (when expanded): 3 rows, each with a 14×14 checkbox + label.
  - "Speak with Byte"
  - "Visit the broken Berry-Bot"
  - "Run the \"Repeat 5\" spell"
- Done state: checkbox fills amber with white `✓`, text gets line-through and dims to ink-mute.

#### Icon buttons (top-right)
- 38×38 square buttons with the HUD card styling. Sound toggle (animated speaker glyph) + Pause button. Hover: warm amber border + tint.

#### InteractionHint (bottom-right, conditional)
- Pill-shaped (999px radius) with amber border + glow + `hint-pulse` bob animation.
- Shows `<E> Talk to Byte` / `Help Berry-Bot` / `Read sign` depending on nearest interactable.
- `<kbd>` keys: linear gradient slate, 1px amber border, amber-warm text, 2px dark offset shadow.

#### KeysFooter (bottom-left, always visible during play)
- HUD card with `WASD Move · E Interact · Esc Pause` using kbd styling.

### 5) Dialogue Box (when an NPC is being spoken to)

- Positioned bottom-center inside the game frame, 24px above bottom, max-width 720px.
- Rise-in animation: `dlg-rise` 0.35s ease (translateY +30 → 0, opacity 0 → 1).
- 2-column grid (88px portrait + flexible body), 16px gap.
- Box background: navy gradient, 2px amber border, layered shadows (pixel outline + blur + warm glow).
- Pixel corner accents (top-left and bottom-right) implemented as CSS pseudo-elements with `clip-path`.

**Portrait:** 88×88, navy gradient bg, 10px radius, soft teal radial glow over it. Renders a small SVG portrait per character (Byte robot face / Berry-Bot sad face / wooden sign — see `PortraitSVG` in prototype).

**Body:**
- Top: character name (16px Pixelify Sans amber) + role chip (9px Silkscreen, teal border, e.g. "ROBOT TEACHER" / "BROKEN" / "NOTICE").
- Middle: dialogue text (15px Outfit, ink) with **typewriter effect** at ~22ms per character. Blinking 8×16px amber caret (`blink` animation, steps(2), 0.7s).
- Bottom row: `N / total` indicator (Silkscreen mute) and continue button. Button label changes: `SKIP →` (while typing) → `NEXT →` → `CLOSE →` on last line. Arrow is a small triangle that bounces 1.2s.

**Input:** `E` / `Space` / `Enter` advances (or skips current typing). `Esc` closes immediately.

**Dialogue scripts** (exact copy — see `prototype/game.jsx` `DIALOGUE` object):
- `byte_intro` (4 lines) — first time talking to Byte
- `byte_postquest` (3 lines) — after quest complete
- `berrybot_intro` (4 lines) — broken robot's stuck mantra
- `sign` (3 lines) — wooden sign at path entry

### 6) Repeat-Loop Quest Panel (modal)

Triggered after the berry-bot intro dialogue closes.

- Centered overlay, 440px max-width, pop-in animation (`panel-pop` 0.4s with overshoot scale).
- Same navy/amber styling as dialogue.
- Eyebrow: `"Chapter 1 · The First Loop"` (teal, Silkscreen).
- Title: `"Teach the robot to repeat"` (28px Pixelify Sans).
- Description: 14px paragraph explaining the broken bot needs a `repeat block`.
- **Code block:** JetBrains Mono, dark `#07091a` bg, teal border. Syntax-colored:
  ```
  1  repeat 5 times:
  2    walkTo(berryBush)
  3    pick(berry)
  4    walkHome()
  5  # done!
  ```
  Colors: keywords `--rose-soft`, numbers `--amber-warm`, functions `--teal-bright`, comments `--ink-mute` italic.
  Lines 1–4 get an `active` class while loop is running (amber bg tint + 3px amber left bar).
- **5-dot counter** below the code: square pills, lit dots fill amber with glow as iterations complete.
- Buttons: `Back` (ghost) + `▶ Run Loop` (amber primary, full width). Run button disables to "Running... N/5" while executing.

### 7) Reward Popup

Shown after the loop completes.

- Pops in with overshoot (`reward-in` 0.5s).
- Inner card with amber radial top-glow.
- Content: eyebrow `"Quest Complete"` → big title `"The First Loop"` (36px Pixelify Sans, amber, drop-shadow glow) → description `"You taught a machine to repeat itself. The forest feels a little lighter."` → reward pills (`+120 XP`, `Loop Sigil`) → primary button `Continue Exploring`.

### 8) Pause Overlay

Triggered by `Esc` or the pause icon (when no other overlay is open).

- Full-frame overlay with blur backdrop.
- Centered card with same navy/amber styling.
- Eyebrow "Paused" + title "Take a breath".
- Buttons: `Resume`, `Mute/Enable sounds`, `Restart quest`.
- Footer key reminders.

---

## World Spec — Loop Forest

(Port `prototype/world.js` and `prototype/pixel-art.js` to Phaser data + texture-generation utilities.)

### Map

- 36 × 22 tiles, tile size = 16 world-pixels → world is 576 × 352 wp.
- Stored as ASCII string in `MAP_STR`. Characters: `.` grass, `C` cobblestone path, `p/b/y` flowers (pink/blue/yellow), `*` grass tuft.
- The path forms a flattened oval running through the middle of the map.
- Render to an offscreen canvas / Phaser RenderTexture once per scale change for performance. Grass uses procedural per-pixel noise (3 colors: `--grass-dark/mid/light`); cobble is the 16×16 stone pattern in `pixel-art.js::COBBLE`.
- A 15% alpha green tint is applied on grass tiles adjacent to path tiles to soften the seam.

### Entities (positions in world pixels — see `prototype/world.js` for the canonical list)

| Kind | Notes |
|---|---|
| `house` | Cottage at (80, 130). Decorative; player can collide. |
| `tree` × 13 | Frame the play area along map edges. Foot collision 8×6 wp. |
| `bush` × 4 | Small decor, non-solid. |
| `lantern` × 4 | Lit. Cast a warm radial light (`createRadialGradient`, color flickers via `0.55 + sin(t·8)·0.05`). |
| `sign` | At (280, 270). Interactable → opens `sign` dialogue. |
| `mushroom` × 3 | Decor. |
| `byte` | (245, 215). Cyan-teal robot. Always has a teal glow halo + bobs 1px (sin t·2.4). Blinks every ~3.4s for 0.15s. Renders a yellow `!` dialogue indicator above when `questStep === 'find_byte'`. |
| `berrybot` | (420, 155). Gray, sad. Bobs slightly. Becomes interactable only after Byte's intro. Switches to **happy** sprite (teal accents) after quest. |
| `berrybush` × 5 | (380,130) (455,125) (385,185) (465,185) (445,95). `hasBerries` flag; berry pixels removed once picked. |

### Player

- Spawn: (305, 245) on the path.
- 16×18 sprite. Four directional sets (down idle/walk, up idle, side idle/walk). Side-walk frames are flipped for left.
- Foot collider: 8×4 wp (just the feet).
- Speed: 70 wp/sec.
- Animation: alternates idle/walk frames every 160ms while moving.

### Camera

- Center on player. Smooth lerp toward target: `cam += (target - cam) * (1 - 0.001^dt)`. Clamped to world bounds so the camera never shows beyond the map edge.

### Lighting & Atmosphere

- Lantern radial gradients drawn over the tile blit with `globalCompositeOperation: 'source-over'` (warm amber, ~0.32 alpha at center).
- 14 **fireflies**: each is a small dot that orbits a fixed center point (per-firefly radius 20–60 wp, angular speed 0.4–0.8 rad/s). Drawn with additive blend (`globalCompositeOperation: 'lighter'`) — soft halo + 1px bright core.
- Random ambient sparkle particles emit from lanterns (~6% per frame at 60fps).
- Screen vignette: radial gradient inset, rgba(0,0,0,0) → rgba(0,0,0,0.5).

---

## Interactions & State

### Quest state machine

```
find_byte           # initial
  → (talk to Byte; close intro dialogue)
go_to_berrybot      # berry-bot becomes interactable; gain +20 XP
  → (talk to berry-bot; close dialogue)
in_loop_panel       # quest panel opens
  → (click "Run Loop")
running_loop        # panel disabled; berry-bot walks loop on canvas
  → (5 iterations complete, ~6s total)
done                # gain +120 XP, reward popup, Byte switches to post-quest dialogue
```

### The Repeat-5 animation

When `Run Loop` is pressed, the berry-bot entity is animated by the engine:
1. Remember its current position as `_homeX/_homeY`.
2. For i in 0..4:
   a. Walk to `bushes[i % 5]` at 80 wp/s.
   b. On arrival: pause 0.4s; emit a red berry-color burst (8 particles, radial); set `hush.hasBerries = false`.
   c. Walk back home at 80 wp/s.
   d. On arrival: emit a small amber burst (6 particles); increment progress; play `step` sound.
3. After last iteration: switch berry-bot sprite to **happy** variant; emit a bigger amber burst (16); play `success` chord; show reward popup.

### Input model

- Movement: WASD / arrow keys. Disabled while any overlay is open (dialogue / quest panel / reward / pause).
- Interact: `E` / `Space` / `Enter` when an interactable is within ~28 wp of player.
- Pause: `Esc` (only when no other overlay is open).

### Audio (placeholder)

The prototype uses WebAudio to synthesize:
- **Ambient pad** — 3 detuned sine/triangle oscillators (110/165/220 Hz) + slow LFO on the highest osc's frequency. Volume 0.04, faded on/off when muted.
- **`click`** — 720 Hz triangle, 60ms decay, 0.05 vol.
- **`text`** — random 540–660 Hz square, 40ms decay, 0.012 vol. Plays on each typewriter advance.
- **`step`** — 320–360 Hz square, very short. Plays each loop iteration.
- **`pop`** — 880 Hz triangle blip.
- **`success`** — C5–E5–G5–C6 arpeggio (523/659/784/1047 Hz), 80ms between notes, triangle wave.

Swap for real audio files (`public/audio/*.ogg`) when assets land. Suggested:
- `ambient_forest.ogg` (looping, low volume)
- `ui_click.wav`, `ui_text.wav`, `ui_pop.wav`, `loop_step.wav`, `quest_complete.wav`

---

## Responsive behavior

- ≥960px wide: hero is two-column (text left, bookshelf right). Game frame uses 16:10 aspect; max 80vh tall.
- 640–960px: hero stacks (bookshelf order: -1 so it appears first). Bookshelf scene height shrinks to 480px. Stats row gap tightens.
- <640px: hero title shrinks to 44px. Dialogue portrait shrinks to 64px and text drops to 13px. HUD card min-widths reduce.
- Game canvas should always fit its frame and rescale the pixel art (scale factor 2–5 chosen from viewport width, snapped to integer so pixels stay crisp).

---

## Phaser-specific implementation notes

The prototype uses raw canvas for speed; in production use Phaser 3:

1. **Scene structure:** Single `LoopForestScene extends Phaser.Scene`. In `preload`, generate textures from the pixel arrays using `this.textures.generate(...)` or by drawing to a temp canvas and calling `this.textures.addCanvas(key, canvas)`. Do this once at boot — don't re-render per frame.
2. **Tile map:** Build a static `RenderTexture` containing the entire 576×352 wp map. Add as a single image to the scene. This replaces the per-frame fillRect blits in the prototype's `buildTileCanvas`.
3. **Y-sort:** Use `Phaser.GameObjects.Container` per entity; sort children by `y` each frame, or use a depth-sort group. The prototype sorts manually in its draw loop.
4. **Player + NPC:** `Phaser.Physics.Arcade.Sprite` (arcade is enough; no need for matter). Foot-only hitbox via `body.setSize(8, 4).setOffset(...)`.
5. **Camera:** `this.cameras.main.startFollow(player, true, 0.08, 0.08)`. Set bounds to world size.
6. **Lighting:** Phaser's Lights2D pipeline is heavy. Easier: render lanterns and fireflies into a separate `RenderTexture` with `BLEND_MODES.ADD` each frame, then composite on top of the world. The fireflies in the prototype are an orbiting circle pattern — port as parametric (no per-firefly physics needed).
7. **Particles:** `this.add.particles(...)` works perfectly for the bursts and ambient lantern motes.
8. **React ↔ Phaser bridge:**
   - The Phaser scene emits events (`'interact', { entity }` / `'proximityChange', entity` / `'loopProgress', n` / `'loopComplete'`) on `scene.events`.
   - A thin React wrapper subscribes and updates the Zustand store, which drives all HUD/overlay rendering.
   - When dialogues / quest panel open, React calls `scene.setInputLocked(true)` to disable WASD inside Phaser.

---

## Assets

Everything visual in the current prototype is procedural — sprite arrays in `prototype/pixel-art.js`, no external image assets. Port these arrays as the canonical art for v1, then replace progressively with hand-drawn sprites as your artist produces them. Suggested replacement order:

1. Player character (most visible)
2. Byte robot (most expressive NPC)
3. Berry-Bot (the broken / happy states)
4. Trees, houses, lanterns
5. Tilemap (grass + cobble) — these will most likely become a proper tilesheet

Fonts are loaded from Google Fonts; self-host in `public/fonts/` for production perf:
- Pixelify Sans (400, 500, 600, 700)
- Silkscreen (400, 700)
- Outfit (300, 400, 500, 600, 700)
- JetBrains Mono (400, 500)

No icons used in the prototype outside of small inline SVGs (sound speaker, play/pause). Lucide React works fine if you want to swap, but pixel-style inline SVGs keep the aesthetic tighter.

---

## Files in this handoff

| File | Purpose |
|---|---|
| `prototype/Code Game.html` | Entry point. Loads React, Babel, and the JSX/JS modules. Mounts `<App/>` with `<Hero/>` and `<Game/>`. |
| `prototype/styles.css` | All CSS — palette CSS vars, hero, HUD, dialogue, quest, reward, pause, responsive breakpoints. |
| `prototype/hero.jsx` | `<Hero/>`, `<Bookshelf/>`, `<Book/>`, `<SpineSymbol/>`, `<StarField/>`, `<FloatingParticles/>`, `<PixelCloud/>`. Includes the `BOOKS` data table. |
| `prototype/game.jsx` | `<Game/>` (top-level), `<HUD/>`, `<DialogueBox/>`, `<QuestPanel/>`, `<RewardPopup/>`, `<PauseOverlay/>`, `<InteractionHint/>`, `<PortraitSVG/>`, `useTypewriter`, `createSounds`. Includes the `DIALOGUE` script table. |
| `prototype/engine.js` | Raw canvas game engine: input, collision, camera, sprite drawing, tile rendering, particles, fireflies, lantern lighting, the loop-quest animation, callbacks contract. Reference for the Phaser port. |
| `prototype/world.js` | `MAP_STR` tile string, tile builder, `ENTITIES` array. Canonical world layout. |
| `prototype/pixel-art.js` | Sprite pixel arrays + the `P` palette object. Canonical art. |

---

## How to run the prototype locally

```bash
# Any static file server works; e.g.
npx serve prototype
# then open the URL it prints
```

(The prototype is fully client-side — no build step needed because Babel transforms JSX in the browser. This is for design fidelity, not production performance.)

---

## How to bootstrap the real codebase

A reasonable first prompt to your coding assistant:

> Bootstrap a Next.js 14 project with TypeScript, Tailwind, shadcn/ui, and Phaser 3. Set up the folder structure in this README. Pull the design tokens from `prototype/styles.css :root` into `globals.css` and Tailwind theme. Build the Hero section first (`<Hero/>` + `<Bookshelf/>`), pixel-matching `prototype/hero.jsx` — port the BOOKS data table verbatim and reproduce the hover/tooltip behavior. After the hero renders cleanly, scaffold the empty Phaser scene with the camera, tilemap, and player movement using `prototype/world.js` + `prototype/pixel-art.js` as canonical data. Defer dialogue/quest/HUD until the world renders correctly.

Then iterate scene-by-scene against the prototype as the source of truth.

---

## Known prototype-only shortcuts

These are deliberate to keep the prototype tight; the production codebase should do them properly:

- **Babel-in-browser** instead of a real build step.
- **Raw canvas** instead of Phaser (rewrite required).
- **Sprite pixel-arrays** rendered via per-pixel `fillRect` — fine for ~20 entities at 60fps, but a `texture.generate()` once-on-load is faster.
- **Tile renderer** rebuilds on viewport scale change — the cached canvas should ideally also invalidate on entity changes (it doesn't currently because no entity moves except the berry-bot, which is rendered above the tile layer).
- **No persistence.** No save game. Add via localStorage or a backend.
- **No accessibility pass.** Add ARIA labels, keyboard tab order on overlays, reduced-motion media query (which should turn off the bookshelf sparkles, firefly orbits, and the typewriter speed).
- **Audio is synthesized.** Replace with curated assets.

Good luck — and keep the cozy. ✦
