// game.jsx — React wrapper for the game canvas + HUD + dialogue + quest panel.

const { useState, useEffect, useRef, useCallback } = React;

// ---------- Dialogue lines ----------
const DIALOGUE = {
  byte_intro: {
    name: 'Byte',
    role: 'Robot Teacher',
    portrait: 'byte',
    lines: [
      "Oh — a new student! Welcome to Loop Forest.",
      "The machines here are tired. They keep doing the same task by hand, over and over and over.",
      "Maybe you can teach them about loops.",
      "There's a berry-collecting robot just down the path. It's stuck repeating the same step. Go say hello.",
    ],
  },
  byte_postquest: {
    name: 'Byte',
    role: 'Robot Teacher',
    portrait: 'byte',
    lines: [
      "You did it! I knew you'd get it.",
      "A loop is just a promise: 'do this thing, again, until I tell you to stop.'",
      "There's a whole forest of broken machines waiting for you. But first... breathe. Look around. The lanterns are pretty tonight.",
    ],
  },
  berrybot_intro: {
    name: 'Berry-Bot',
    role: 'Broken',
    portrait: 'berrybot',
    lines: [
      "...beep... cannot... complete... task...",
      "Berry bush. Pick berry. Walk back. Drop berry.",
      "Berry bush. Pick berry. Walk back. Drop berry.",
      "...so... tired... need... help... repeating...",
    ],
  },
  sign: {
    name: 'Wooden Sign',
    role: 'Notice',
    portrait: 'sign',
    lines: [
      "✦ LOOP FOREST ✦",
      "A quiet place where machines forget how to repeat themselves.",
      "Tip: press WASD to walk. Press E near anything that glows.",
    ],
  },
};

// ---------- Portrait SVG ----------
function PortraitSVG({ kind }) {
  if (kind === 'byte') {
    return (
      <svg viewBox="0 0 24 24" shapeRendering="crispEdges">
        <rect x={11} y={1} width={2} height={3} fill="#7fc4bd" />
        <rect x={10} y={4} width={4} height={1} fill="#5b9b94" />
        <rect x={6} y={5} width={12} height={10} fill="#4a76b0" />
        <rect x={6} y={5} width={12} height={1} fill="#7fc4bd" />
        <rect x={5} y={6} width={1} height={8} fill="#7fc4bd" />
        <rect x={18} y={6} width={1} height={8} fill="#7fc4bd" />
        <rect x={6} y={14} width={12} height={1} fill="#2c4a78" />
        <rect x={8} y={8} width={8} height={4} fill="#1a2b4a" />
        <rect x={9} y={9} width={2} height={2} fill="#f5b04c" />
        <rect x={13} y={9} width={2} height={2} fill="#f5b04c" />
        <rect x={10} y={12} width={4} height={1} fill="#7fc4bd" />
        <rect x={8} y={16} width={8} height={4} fill="#4a76b0" />
        <rect x={10} y={17} width={4} height={2} fill="#cce7ff" />
        <rect x={9} y={20} width={2} height={2} fill="#4a76b0" />
        <rect x={13} y={20} width={2} height={2} fill="#4a76b0" />
      </svg>
    );
  }
  if (kind === 'berrybot') {
    return (
      <svg viewBox="0 0 24 24" shapeRendering="crispEdges">
        <rect x={11} y={2} width={2} height={2} fill="#7d7670" />
        <rect x={13} y={3} width={2} height={1} fill="#7d7670" />
        <rect x={6} y={5} width={12} height={9} fill="#7d7670" />
        <rect x={6} y={5} width={12} height={1} fill="#9b958a" />
        <rect x={6} y={13} width={12} height={1} fill="#5e5a55" />
        <rect x={8} y={7} width={8} height={5} fill="#3d3a3a" />
        <rect x={9} y={8} width={2} height={1} fill="#e85a6e" />
        <rect x={13} y={8} width={2} height={1} fill="#e85a6e" />
        <rect x={10} y={10} width={4} height={1} fill="#5e5a55" />
        <rect x={9} y={11} width={1} height={1} fill="#5e5a55" />
        <rect x={14} y={11} width={1} height={1} fill="#5e5a55" />
        <rect x={7} y={15} width={10} height={5} fill="#7d7670" />
        <rect x={9} y={17} width={2} height={1} fill="#e85a6e" />
        <rect x={13} y={17} width={2} height={1} fill="#e85a6e" />
        <rect x={8} y={20} width={3} height={3} fill="#5e5a55" />
        <rect x={13} y={20} width={3} height={3} fill="#5e5a55" />
      </svg>
    );
  }
  if (kind === 'sign') {
    return (
      <svg viewBox="0 0 24 24" shapeRendering="crispEdges">
        <rect x={4} y={4} width={16} height={10} fill="#7a4a2a" />
        <rect x={4} y={4} width={16} height={1} fill="#c98a52" />
        <rect x={4} y={13} width={16} height={1} fill="#4a2f1e" />
        <rect x={6} y={6} width={12} height={6} fill="#b3793f" />
        <rect x={7} y={7} width={2} height={1} fill="#4a2f1e" />
        <rect x={10} y={7} width={4} height={1} fill="#4a2f1e" />
        <rect x={15} y={7} width={2} height={1} fill="#4a2f1e" />
        <rect x={7} y={9} width={4} height={1} fill="#4a2f1e" />
        <rect x={12} y={9} width={5} height={1} fill="#4a2f1e" />
        <rect x={11} y={14} width={2} height={8} fill="#4a2f1e" />
      </svg>
    );
  }
  return null;
}

// ---------- Typewriter ----------
function useTypewriter(text, speed = 22) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setShown('');
    setDone(false);
    if (!text) { setDone(true); return; }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  const skip = () => { setShown(text); setDone(true); };
  return { shown, done, skip };
}

// ---------- Dialogue box ----------
function DialogueBox({ dialogue, onAdvance, onClose, playClick }) {
  const line = dialogue.lines[dialogue.currentLine];
  const { shown, done, skip } = useTypewriter(line, 22);

  useEffect(() => {
    function onKey(e) {
      const k = e.key.toLowerCase();
      if (k === 'e' || k === ' ' || k === 'enter') {
        e.preventDefault(); e.stopPropagation();
        if (playClick) playClick();
        if (!done) skip();
        else if (dialogue.currentLine < dialogue.lines.length - 1) onAdvance();
        else onClose();
      } else if (k === 'escape') {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, dialogue.currentLine, onAdvance, onClose, skip, playClick]);

  const handleClick = () => {
    if (playClick) playClick();
    if (!done) skip();
    else if (dialogue.currentLine < dialogue.lines.length - 1) onAdvance();
    else onClose();
  };

  return (
    <div className="dialogue-root">
      <div className="dialogue-box">
        <div className="dialogue-portrait">
          <PortraitSVG kind={dialogue.portrait} />
        </div>
        <div className="dialogue-body">
          <div className="dialogue-name">
            <span>{dialogue.name}</span>
            <span className="role">{dialogue.role}</span>
          </div>
          <div className="dialogue-text">
            {shown}
            {!done && <span className="caret"></span>}
          </div>
          <div className="dialogue-actions">
            <span>{dialogue.currentLine + 1} / {dialogue.lines.length}</span>
            <button className="dialogue-continue" onClick={handleClick}>
              {!done ? <>SKIP <span className="arrow"></span></>
                : dialogue.currentLine < dialogue.lines.length - 1
                  ? <>NEXT <span className="arrow"></span></>
                  : <>CLOSE <span className="arrow"></span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Quest panel ----------
function QuestPanel({ progress, onRun, onCancel, running }) {
  return (
    <div className="quest-panel">
      <div className="quest-panel-inner">
        <div className="qp-eyebrow">Chapter 1 · The First Loop</div>
        <h2 className="qp-title">Teach the robot to repeat</h2>
        <p className="qp-desc">
          The berry-bot can only do <em style={{color: 'var(--amber-warm)', fontStyle: 'normal'}}>one</em> task before it gets confused.
          Wrap its task in a <strong style={{color: 'var(--rose-soft)'}}>repeat block</strong> to make it do the job
          <em style={{color: 'var(--amber-warm)', fontStyle: 'normal'}}> 5 times.</em>
        </p>

        <div className="code-block">
          <div className={`line ${running ? 'active' : ''}`}>
            <span className="ln">1</span><span className="kw">repeat</span> <span className="num">5</span> <span className="kw">times</span>:
          </div>
          <div className={`line ${running ? 'active' : ''}`}>
            <span className="ln">2</span>{'  '}<span className="fn">walkTo</span>(berryBush)
          </div>
          <div className={`line ${running ? 'active' : ''}`}>
            <span className="ln">3</span>{'  '}<span className="fn">pick</span>(berry)
          </div>
          <div className={`line ${running ? 'active' : ''}`}>
            <span className="ln">4</span>{'  '}<span className="fn">walkHome</span>()
          </div>
          <div className="line"><span className="ln">5</span><span className="cmt"># done!</span></div>
        </div>

        <div className="qp-counter">
          {[0,1,2,3,4].map(i => (
            <div key={i} className={`dot ${progress > i ? 'lit' : ''}`}></div>
          ))}
        </div>

        <div className="qp-actions">
          <button className="btn-cancel" onClick={onCancel} disabled={running}>Back</button>
          <button className="btn-run" onClick={onRun} disabled={running}>
            {running ? `Running... ${progress}/5` : '▶  Run Loop'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Reward popup ----------
function RewardPopup({ onClose }) {
  return (
    <div className="reward-popup">
      <div className="reward-inner">
        <div className="reward-eyebrow">Quest Complete</div>
        <h2 className="reward-title">The First Loop</h2>
        <p className="reward-desc">
          You taught a machine to repeat itself.<br/>The forest feels a little lighter.
        </p>
        <div className="reward-rewards">
          <div className="reward-pill"><span className="glyph"></span>+120 XP</div>
          <div className="reward-pill"><span className="glyph" style={{background: 'var(--rose-soft)'}}></span>Loop Sigil</div>
        </div>
        <button className="btn-close" onClick={onClose}>Continue Exploring</button>
      </div>
    </div>
  );
}

// ---------- HUD ----------
function HUD({ xp, level, xpMax, questStep, paused, onTogglePause, soundOn, onToggleSound }) {
  const [questExpanded, setQuestExpanded] = useState(true);

  const questObjectives = [
    { id: 'find_byte', text: 'Speak with Byte' },
    { id: 'find_bot', text: 'Visit the broken Berry-Bot' },
    { id: 'run_loop', text: 'Run the "Repeat 5" spell' },
  ];

  const stepIndex = ({
    'find_byte': 0,
    'go_to_berrybot': 1,
    'in_loop_panel': 2,
    'running_loop': 2,
    'done': 3,
  })[questStep] ?? 0;

  return (
    <div className="hud-layer">
      <div className="hud-top-left">
        <div className="hud-card hud-player pad-lg">
          <div className="hud-avatar">A</div>
          <div className="hud-player-info">
            <div className="hud-name">
              <span className="name">Acorn</span>
              <span className="level">Lv {level}</span>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${Math.min(100, (xp / xpMax) * 100)}%` }}></div>
            </div>
            <div className="hud-xp-meta">
              <span>{xp} XP</span>
              <span>/ {xpMax}</span>
            </div>
          </div>
        </div>

        <div className={`hud-card quest-tracker ${questExpanded ? '' : 'compact'}`}>
          <div className="quest-header">
            <div className="glyph">!</div>
            <div className="title">The First Loop</div>
            <div className="progress-pill">{stepIndex}/{questObjectives.length}</div>
            <button className="toggle" onClick={() => setQuestExpanded(e => !e)}>
              {questExpanded ? '▾' : '▸'}
            </button>
          </div>
          <div className="quest-objectives">
            {questObjectives.map((o, i) => (
              <div key={o.id} className={`quest-objective ${i < stepIndex ? 'done' : ''}`}>
                <div className="check"></div>
                <span>{o.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hud-top-right">
        <button className="icon-btn" title={soundOn ? 'Mute' : 'Unmute'} onClick={onToggleSound}>
          {soundOn ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x={2} y={6} width={2} height={4} /><rect x={4} y={5} width={2} height={6} /><rect x={6} y={3} width={2} height={10} /><rect x={11} y={6} width={1} height={4} /><rect x={12} y={4} width={1} height={8} /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x={2} y={6} width={2} height={4} /><rect x={4} y={5} width={2} height={6} /><rect x={6} y={3} width={2} height={10} /><rect x={11} y={6} width={1} height={1} /><rect x={13} y={6} width={1} height={1} /><rect x={12} y={7} width={1} height={1} /><rect x={11} y={8} width={1} height={1} /><rect x={13} y={8} width={1} height={1} /></svg>
          )}
        </button>
        <button className="icon-btn" title="Pause / Settings" onClick={onTogglePause}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <rect x={4} y={3} width={3} height={10} />
            <rect x={9} y={3} width={3} height={10} />
          </svg>
        </button>
      </div>
    </div>
  );
}

function InteractionHint({ entity }) {
  if (!entity) return null;
  let label = 'Talk';
  let target = '';
  if (entity.kind === 'sign') { label = 'Read'; target = 'sign'; }
  if (entity.kind === 'byte') { label = 'Talk to'; target = 'Byte'; }
  if (entity.kind === 'berrybot') { label = 'Help'; target = 'Berry-Bot'; }
  return (
    <div className="hud-bottom-right">
      <div className="interaction-hint">
        <span className="kbd">E</span>
        <span>{label} {target}</span>
      </div>
    </div>
  );
}

// ---------- Pause overlay ----------
function PauseOverlay({ onResume, onResetQuest, soundOn, onToggleSound }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(7, 9, 26, 0.78)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'auto',
    }}>
      <div style={{
        background: 'linear-gradient(180deg, rgba(20, 24, 50, 0.98), rgba(15, 18, 38, 0.98))',
        border: '2px solid var(--amber)',
        borderRadius: 16,
        padding: 32,
        minWidth: 340,
        textAlign: 'center',
        boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 100px rgba(245, 176, 76, 0.2)',
      }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--teal-bright)', textTransform: 'uppercase', marginBottom: 6 }}>Paused</div>
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: 32, margin: '0 0 24px', color: 'var(--ink)' }}>Take a breath</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <button className="btn-run" onClick={onResume}>Resume</button>
          <button className="btn-cancel" onClick={onToggleSound}>
            {soundOn ? 'Mute sounds' : 'Enable sounds'}
          </button>
          <button className="btn-cancel" onClick={onResetQuest}>Restart quest</button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.8, fontFamily: 'var(--font-ui)', letterSpacing: '0.06em' }}>
          <span style={kbdStyle}>WASD</span> MOVE · <span style={kbdStyle}>E</span> TALK · <span style={kbdStyle}>ESC</span> PAUSE
        </div>
      </div>
    </div>
  );
}

const kbdStyle = {
  display: 'inline-block',
  fontFamily: 'var(--font-ui)',
  padding: '2px 6px',
  margin: '0 2px',
  background: 'rgba(245, 176, 76, 0.1)',
  border: '1px solid rgba(245, 176, 76, 0.3)',
  borderRadius: 3,
  color: 'var(--amber-warm)',
};

// ---------- Audio (placeholder WebAudio synth) ----------
function createSounds() {
  let ctx = null;
  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  let muted = false;
  // Ambient pad
  let padNode = null;
  function startAmbient() {
    const c = ensure(); if (!c || padNode) return;
    const out = c.createGain(); out.gain.value = muted ? 0 : 0.04; out.connect(c.destination);
    const o1 = c.createOscillator(); o1.type = 'sine'; o1.frequency.value = 110;
    const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = 165;
    const o3 = c.createOscillator(); o3.type = 'triangle'; o3.frequency.value = 220;
    const lfo = c.createOscillator(); lfo.frequency.value = 0.12;
    const lfoG = c.createGain(); lfoG.gain.value = 6;
    lfo.connect(lfoG); lfoG.connect(o3.frequency);
    o1.connect(out); o2.connect(out); o3.connect(out);
    o1.start(); o2.start(); o3.start(); lfo.start();
    padNode = { out };
  }
  function blip({ freq = 440, type = 'square', dur = 0.08, vol = 0.06, attack = 0.005, decay = 0.08 }) {
    const c = ensure(); if (!c || muted) return;
    const o = c.createOscillator(); o.type = type; o.frequency.value = freq;
    const g = c.createGain();
    const t = c.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + attack + decay + 0.05);
  }
  return {
    setMuted(m) {
      muted = m;
      if (padNode) padNode.out.gain.setTargetAtTime(m ? 0 : 0.04, ensure()?.currentTime || 0, 0.2);
    },
    isMuted() { return muted; },
    startAmbient,
    click() { blip({ freq: 720, type: 'triangle', dur: 0.05, vol: 0.05, decay: 0.06 }); },
    text() { blip({ freq: 540 + Math.random() * 120, type: 'square', dur: 0.02, vol: 0.012, decay: 0.04 }); },
    success() {
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => setTimeout(() => blip({ freq: f, type: 'triangle', vol: 0.08, decay: 0.16 }), i * 80));
    },
    step() { blip({ freq: 320 + Math.random() * 40, type: 'square', vol: 0.02, decay: 0.04 }); },
    pop() { blip({ freq: 880, type: 'triangle', vol: 0.05, decay: 0.08 }); },
  };
}

// ---------- Main Game ----------
function Game({ onBackToTop }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const engineRef = useRef(null);
  const soundsRef = useRef(null);
  if (!soundsRef.current) soundsRef.current = createSounds();

  const [questStep, setQuestStep] = useState('find_byte');
  const [byteTalkedOnce, setByteTalkedOnce] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState(null); // { name, role, portrait, lines, currentLine }
  const [showQuestPanel, setShowQuestPanel] = useState(false);
  const [loopRunning, setLoopRunning] = useState(false);
  const [loopProgress, setLoopProgress] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [proximity, setProximity] = useState(null);
  const [xp, setXp] = useState(40);
  const [level, setLevel] = useState(1);
  const [paused, setPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  const xpMax = 250;

  // Lock input when overlays are open
  const inputLocked = !!activeDialogue || showQuestPanel || showReward || paused;
  useEffect(() => {
    if (engineRef.current) engineRef.current.inputLocked = inputLocked;
  }, [inputLocked]);

  // Sounds toggle
  useEffect(() => {
    if (soundsRef.current) soundsRef.current.setMuted(!soundOn);
  }, [soundOn]);

  // ESC to pause
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        if (activeDialogue || showQuestPanel || showReward) return;
        setPaused(p => !p);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeDialogue, showQuestPanel, showReward]);

  // Engine init
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = window.createGameEngine({
      canvas: canvasRef.current,
      hudFrame: frameRef.current,
      callbacks: {
        onProximityChange(entity) {
          setProximity(entity ? { kind: entity.kind, id: entity.id } : null);
        },
        onInteract(entity) {
          if (soundsRef.current) soundsRef.current.click();
          if (entity.kind === 'byte') {
            // First talk: intro dialogue. Subsequent (after quest): post-quest dialogue.
            const d = byteTalkedOnceRef.current
              ? DIALOGUE.byte_postquest
              : DIALOGUE.byte_intro;
            setActiveDialogue({ ...d, currentLine: 0 });
          } else if (entity.kind === 'berrybot') {
            if (questStepRef.current === 'go_to_berrybot' || questStepRef.current === 'find_byte') {
              // Show intro lines then open quest panel
              setActiveDialogue({ ...DIALOGUE.berrybot_intro, currentLine: 0, _opensQuest: true });
            } else if (questStepRef.current === 'done') {
              setActiveDialogue({
                name: 'Berry-Bot', role: 'Happy', portrait: 'berrybot',
                lines: ["BEEP! Berries collected! Forever grateful! ♥"],
                currentLine: 0,
              });
            }
          } else if (entity.kind === 'sign') {
            setActiveDialogue({ ...DIALOGUE.sign, currentLine: 0 });
          }
        },
        onLoopStart() {
          if (soundsRef.current) soundsRef.current.click();
          setLoopRunning(true);
          setLoopProgress(0);
          setQuestStep('running_loop');
        },
        onLoopProgress(iteration) {
          if (soundsRef.current) soundsRef.current.step();
          setLoopProgress(iteration);
        },
        onLoopComplete() {
          if (soundsRef.current) soundsRef.current.success();
          setLoopRunning(false);
          setShowQuestPanel(false);
          setQuestStep('done');
          setXp(x => Math.min(xpMax, x + 120));
          setShowReward(true);
        },
        shouldShowByteHint() {
          return questStepRef.current === 'find_byte';
        },
      },
    });
    engineRef.current = engine;
    engine.start();

    // Don't make berry-bot interactable yet
    engine.setBerryBotInteractable(false);

    return () => engine.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep refs in sync with state for engine callbacks
  const questStepRef = useRef(questStep);
  const byteTalkedOnceRef = useRef(byteTalkedOnce);
  useEffect(() => { questStepRef.current = questStep; }, [questStep]);
  useEffect(() => { byteTalkedOnceRef.current = byteTalkedOnce; }, [byteTalkedOnce]);

  // Toggle berry-bot interactable when quest moves forward
  useEffect(() => {
    if (!engineRef.current) return;
    if (questStep === 'go_to_berrybot' || questStep === 'in_loop_panel' || questStep === 'done') {
      engineRef.current.setBerryBotInteractable(true);
    } else {
      engineRef.current.setBerryBotInteractable(false);
    }
  }, [questStep]);

  // Handlers
  const advanceDialogue = useCallback(() => {
    setActiveDialogue(d => d ? { ...d, currentLine: d.currentLine + 1 } : null);
  }, []);

  const closeDialogue = useCallback(() => {
    const d = activeDialogue;
    setActiveDialogue(null);
    if (!d) return;

    if (d.portrait === 'byte' && !byteTalkedOnce && d.lines === DIALOGUE.byte_intro.lines) {
      setByteTalkedOnce(true);
      setQuestStep('go_to_berrybot');
      setXp(x => Math.min(xpMax, x + 20));
    }
    if (d._opensQuest) {
      setShowQuestPanel(true);
      setQuestStep('in_loop_panel');
    }
  }, [activeDialogue, byteTalkedOnce]);

  const runLoop = useCallback(() => {
    if (engineRef.current) engineRef.current.startLoop();
  }, []);

  const cancelQuestPanel = useCallback(() => {
    setShowQuestPanel(false);
    if (questStep === 'in_loop_panel') setQuestStep('go_to_berrybot');
  }, [questStep]);

  const closeReward = useCallback(() => {
    setShowReward(false);
  }, []);

  const togglePause = useCallback(() => setPaused(p => !p), []);
  const toggleSound = useCallback(() => {
    setSoundOn(prev => {
      const next = !prev;
      if (next && soundsRef.current) soundsRef.current.startAmbient();
      return next;
    });
  }, []);
  const resetQuest = useCallback(() => {
    setQuestStep('find_byte');
    setByteTalkedOnce(false);
    setXp(40);
    setLoopProgress(0);
    setLoopRunning(false);
    setShowQuestPanel(false);
    setActiveDialogue(null);
    setShowReward(false);
    setPaused(false);
    // Reset entities (re-init engine cheap-trick)
    if (engineRef.current) {
      const bot = engineRef.current.getEntity('berrybot');
      if (bot) { bot._happy = false; bot.x = 420; bot.y = 155; }
      for (let i = 1; i <= 5; i++) {
        const b = engineRef.current.getEntity('b' + i);
        if (b) b.hasBerries = true;
      }
      engineRef.current.setBerryBotInteractable(false);
    }
  }, []);

  // Hint based on quest step
  let stepHint = '';
  if (questStep === 'find_byte') stepHint = 'Find the glowing teal robot — Byte will set you on your way.';
  else if (questStep === 'go_to_berrybot') stepHint = 'Look for a slumped-over robot near the berry bushes to the east.';
  else if (questStep === 'in_loop_panel') stepHint = 'Press ▶ Run Loop to watch the magic happen.';
  else if (questStep === 'running_loop') stepHint = 'Watch the loop unfold...';
  else if (questStep === 'done') stepHint = 'Wander, breathe, return to Byte when you\'re ready for the next chapter.';

  return (
    <section className="game-section" id="game-section">
      <div className="game-section-inner">
        <div className="section-divider-content" style={{padding: '0 0 24px'}}>
          <span className="chapter">
            <span style={{display: 'inline-block', width: 8, height: 8, background: 'var(--amber)', borderRadius: 2, boxShadow: '0 0 8px var(--amber)'}}></span>
            Chapter 01
          </span>
          <span className="line"></span>
          <span style={{fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--ink)'}}>Loop Forest</span>
          <span className="line"></span>
          <span>{stepHint}</span>
        </div>

        <div className="game-frame" ref={frameRef}>
          <canvas className="game-canvas" ref={canvasRef}></canvas>

          <HUD
            xp={xp}
            level={level}
            xpMax={xpMax}
            questStep={questStep}
            paused={paused}
            onTogglePause={togglePause}
            soundOn={soundOn}
            onToggleSound={toggleSound}
          />

          {!inputLocked && proximity && (
            <InteractionHint
              entity={engineRef.current?.getEntity(proximity.id)}
            />
          )}

          {activeDialogue && (
            <DialogueBox
              dialogue={activeDialogue}
              onAdvance={advanceDialogue}
              onClose={closeDialogue}
              playClick={() => soundsRef.current?.text()}
            />
          )}

          {showQuestPanel && (
            <QuestPanel
              progress={loopProgress}
              running={loopRunning}
              onRun={runLoop}
              onCancel={cancelQuestPanel}
            />
          )}

          {showReward && <RewardPopup onClose={closeReward} />}

          {paused && (
            <PauseOverlay
              onResume={() => setPaused(false)}
              onResetQuest={resetQuest}
              soundOn={soundOn}
              onToggleSound={toggleSound}
            />
          )}

          {/* Bottom-left help */}
          {!inputLocked && (
            <div className="hud-bottom-left">
              <div className="hud-card" style={{fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.1em', display: 'flex', gap: 12, alignItems: 'center'}}>
                <span><span className="kbd">W</span><span className="kbd">A</span><span className="kbd">S</span><span className="kbd">D</span> Move</span>
                <span style={{opacity: 0.4}}>·</span>
                <span><span className="kbd">E</span> Interact</span>
                <span style={{opacity: 0.4}}>·</span>
                <span><span className="kbd">Esc</span> Pause</span>
              </div>
            </div>
          )}
        </div>

        {/* Section footer hint */}
        <div style={{marginTop: 32, textAlign: 'center', color: 'var(--ink-mute)', fontSize: 13, fontFamily: 'var(--font-body)'}}>
          ✦ More chapters open as you befriend more machines ✦
        </div>
      </div>
    </section>
  );
}

window.Game = Game;
