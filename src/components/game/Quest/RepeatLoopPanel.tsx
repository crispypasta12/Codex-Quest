"use client";

import { ArrowDown, ArrowUp, Lightbulb, RotateCcw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getLesson, type LessonDefinition } from "@/game/data/lessons/loopForestFundamentals";
import { loopForestAudio } from "@/lib/audio";
import { useGameStore } from "@/lib/store";

type SequenceBot = {
  x: number;
  y: number;
  direction: "east" | "south";
  carrying: boolean;
  planted: boolean;
};

type ConditionBot = {
  berries: number;
  atHome: boolean;
  conditionTrue: boolean;
};

type NestedBot = {
  row: number;
  berry: number;
  collected: boolean[][];
  done: boolean;
};

const actionChoices = ["Return Home", "Collect Berry"] as const;

export function RepeatLoopPanel() {
  const puzzleOpen = useGameStore((state) => state.puzzleOpen);
  const activeLessonId = useGameStore((state) => state.activePuzzleLessonId ?? state.activeLessonId);
  const status = useGameStore((state) => state.puzzleStatus);
  const repeat = useGameStore((state) => state.puzzleRepeat);
  const collected = useGameStore((state) => state.puzzleCollected);
  const message = useGameStore((state) => state.puzzleMessage);
  const setPuzzleRepeat = useGameStore((state) => state.setPuzzleRepeat);
  const setPuzzleRunning = useGameStore((state) => state.setPuzzleRunning);
  const setPuzzleCollected = useGameStore((state) => state.setPuzzleCollected);
  const setPuzzleFailure = useGameStore((state) => state.setPuzzleFailure);
  const completePuzzle = useGameStore((state) => state.completePuzzle);
  const grantLessonReward = useGameStore((state) => state.grantLessonReward);
  const resetPuzzle = useGameStore((state) => state.resetPuzzle);
  const closePuzzle = useGameStore((state) => state.closePuzzle);
  const lesson = useMemo(() => getLesson(activeLessonId), [activeLessonId]);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!useGameStore.getState().puzzleOpen || event.key !== "Escape") return;
      if (useGameStore.getState().puzzleStatus === "running") return;
      event.preventDefault();
      useGameStore.getState().closePuzzle();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!puzzleOpen) return null;

  const canRun = status !== "running" && status !== "success";

  function handleReset() {
    resetPuzzle();
    setShowHint(false);
    loopForestAudio.play("ui");
    window.dispatchEvent(new CustomEvent("loopforest:puzzle-reset", { detail: { lessonId: lesson.id } }));
  }

  return (
    <div className={`quest-panel ${lesson.puzzleType}`} role="dialog" aria-label={`${lesson.title} puzzle`}>
      <div className="quest-panel-inner">
        <div className="qp-heading-row">
          <div>
            <p className="qp-eyebrow">Lesson {lesson.order} · {lesson.concept}</p>
            <h3 className="qp-title">{lesson.title}</h3>
          </div>
          <button className="icon-btn panel-close" type="button" onClick={closePuzzle} aria-label="Close puzzle">
            <X size={16} />
          </button>
        </div>

        {lesson.puzzleType === "sequence_ordering" ? (
          <SequencePuzzle
            lesson={lesson}
            canRun={canRun}
            status={status}
            onComplete={() => {
              completePuzzle(lesson.id);
              grantLessonReward(lesson.id);
            }}
          />
        ) : null}

        {lesson.puzzleType === "simple_loop" ? (
          <LoopPuzzle
            lesson={lesson}
            canRun={canRun}
            repeat={repeat}
            collected={collected}
            onRepeat={setPuzzleRepeat}
            onRun={() => {
              const config = lesson.puzzleConfig as { correctRepeat: number };
              if (repeat !== config.correctRepeat) {
                loopForestAudio.play("failure");
                setPuzzleFailure(
                  `That loop repeats ${repeat} times, but the Berry Bot sees 5 bushes. Try Repeat 5 Times.`,
                );
                window.dispatchEvent(new CustomEvent("loopforest:puzzle-reset", { detail: { lessonId: lesson.id } }));
                return;
              }
              setPuzzleRunning();
              loopForestAudio.play("interact");
              window.dispatchEvent(new CustomEvent("loopforest:puzzle-run", { detail: { lessonId: lesson.id, repeat } }));
            }}
            status={status}
          />
        ) : null}

        {lesson.puzzleType === "conditional_logic" ? (
          <ConditionPuzzle
            lesson={lesson}
            canRun={canRun}
            status={status}
            onCollected={setPuzzleCollected}
            onFailure={setPuzzleFailure}
            onRun={setPuzzleRunning}
            onComplete={() => {
              completePuzzle(lesson.id);
              grantLessonReward(lesson.id);
            }}
          />
        ) : null}

        {lesson.puzzleType === "nested_loop" ? (
          <NestedLoopPuzzle
            lesson={lesson}
            canRun={canRun}
            status={status}
            onCollected={setPuzzleCollected}
            onFailure={setPuzzleFailure}
            onRun={setPuzzleRunning}
            onComplete={() => {
              completePuzzle(lesson.id);
              grantLessonReward(lesson.id);
            }}
          />
        ) : null}

        {status === "success" ? <SuccessBlock lesson={lesson} message={message || lesson.successExplanation} /> : null}
        {status === "failure" ? <p className="puzzle-message error">{message}</p> : null}
        {showHint && status !== "success" ? <p className="puzzle-message">{lesson.hint}</p> : null}

        <div className="qp-actions">
          <button className="btn-cancel" type="button" disabled={status === "running"} onClick={() => setShowHint(true)}>
            <Lightbulb size={14} /> Hint
          </button>
          <button className="btn-cancel" type="button" disabled={status === "running"} onClick={handleReset}>
            <RotateCcw size={14} /> Reset
          </button>
          <button className="btn-cancel" type="button" disabled={status === "running"} onClick={closePuzzle}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SequencePuzzle({
  lesson,
  canRun,
  status,
  onComplete,
}: {
  lesson: LessonDefinition;
  canRun: boolean;
  status: string;
  onComplete: () => void;
}) {
  const config = lesson.puzzleConfig as { correctCommands: string[]; starterCommands: string[] };
  const setPuzzleRunning = useGameStore((state) => state.setPuzzleRunning);
  const setPuzzleFailure = useGameStore((state) => state.setPuzzleFailure);
  const [commands, setCommands] = useState(config.starterCommands);
  const [bot, setBot] = useState<SequenceBot>({ x: 0, y: 1, direction: "east", carrying: false, planted: false });

  useEffect(() => {
    setCommands(config.starterCommands);
    setBot({ x: 0, y: 1, direction: "east", carrying: false, planted: false });
  }, [config.starterCommands]);

  function moveCommand(index: number, delta: number) {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= commands.length || status === "running") return;
    const next = [...commands];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    setCommands(next);
  }

  function runSequence() {
    setPuzzleRunning();
    let step = 0;
    let sim: SequenceBot = { x: 0, y: 1, direction: "east", carrying: false, planted: false };
    setBot(sim);

    const timer = window.setInterval(() => {
      const command = commands[step];
      if (!command) {
        window.clearInterval(timer);
        if (sim.planted && sim.x === 2 && sim.y === 2) {
          onComplete();
          return;
        }
        setPuzzleFailure("The bot followed the steps, but ended up in the wrong place.");
        return;
      }

      if (command === "Pick Up Seed") sim = { ...sim, carrying: true };
      if (command === "Turn Right") sim = { ...sim, direction: "south" };
      if (command === "Move Forward") {
        sim = sim.direction === "east" ? { ...sim, x: sim.x + 1 } : { ...sim, y: sim.y + 1 };
      }
      if (command === "Plant Seed") {
        if (!sim.carrying) {
          window.clearInterval(timer);
          setBot(sim);
          setPuzzleFailure("The bot tried to plant, but it was not carrying anything.");
          return;
        }
        sim = { ...sim, carrying: false, planted: true };
      }

      setBot(sim);
      step += 1;
    }, 460);
  }

  return (
    <>
      <p className="qp-desc">
        Arrange each command in the exact order the delivery bot should run it.
      </p>
      <div className="sequence-layout">
        <div className="command-stack" aria-label="Command order">
          {commands.map((command, index) => (
            <div className="command-row" key={`${command}-${index}`}>
              <span className="command-index">{index + 1}</span>
              <span>{command}</span>
              <button type="button" onClick={() => moveCommand(index, -1)} aria-label={`Move ${command} up`}>
                <ArrowUp size={14} />
              </button>
              <button type="button" onClick={() => moveCommand(index, 1)} aria-label={`Move ${command} down`}>
                <ArrowDown size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="mini-stage sequence-stage">
          <span className="stage-label crate" />
          <span className="stage-label planter" />
          <span
            className={`mini-bot ${bot.carrying ? "carrying" : ""}`}
            style={{ left: `${18 + bot.x * 30}%`, top: `${22 + bot.y * 24}%` }}
          />
          {bot.planted ? <span className="sprout" /> : null}
        </div>
      </div>
      <button className="btn-run full" type="button" disabled={!canRun} onClick={runSequence}>
        Run Sequence
      </button>
    </>
  );
}

function LoopPuzzle({
  lesson,
  canRun,
  repeat,
  collected,
  onRepeat,
  onRun,
  status,
}: {
  lesson: LessonDefinition;
  canRun: boolean;
  repeat: number;
  collected: number;
  onRepeat: (repeat: number) => void;
  onRun: () => void;
  status: string;
}) {
  const config = lesson.puzzleConfig as { options: number[]; command: string };

  return (
    <>
      <p className="qp-desc">
        Repeat 5 times: Collect Berry.
      </p>
      <div className="loop-controls" aria-label="Choose repeat count">
        {config.options.map((option) => (
          <button
            className={`loop-choice ${repeat === option ? "selected" : ""}`}
            disabled={status === "running"}
            key={option}
            type="button"
            onClick={() => onRepeat(option)}
          >
            Repeat {option} Times
          </button>
        ))}
      </div>
      <div className="code-block">
        <span className={`line ${status === "running" ? "active" : ""}`}>
          <span className="ln">1</span>
          <span className="kw">repeat</span> <span className="num">{repeat}</span> times:
        </span>
        <span className={`line ${status === "running" ? "active" : ""}`}>
          <span className="ln">2</span>
          {"  "}
          <span className="fn">{config.command.replace(/\s+/g, "")}</span>()
        </span>
      </div>
      <div className="qp-counter" aria-label={`${collected} out of 5 berries collected`}>
        {[0, 1, 2, 3, 4].map((index) => (
          <span className={`dot ${index < collected ? "lit" : ""}`} key={index} />
        ))}
        <span className="counter-text">{collected}/5</span>
      </div>
      <button className="btn-run full" type="button" disabled={!canRun} onClick={onRun}>
        Run Loop
      </button>
    </>
  );
}

function ConditionPuzzle({
  lesson,
  canRun,
  status,
  onCollected,
  onFailure,
  onRun,
  onComplete,
}: {
  lesson: LessonDefinition;
  canRun: boolean;
  status: string;
  onCollected: (count: number) => void;
  onFailure: (message: string) => void;
  onRun: () => void;
  onComplete: () => void;
}) {
  const [thenAction, setThenAction] = useState("Collect Berry");
  const [elseAction, setElseAction] = useState("Return Home");
  const [bot, setBot] = useState<ConditionBot>({ berries: 0, atHome: false, conditionTrue: false });

  useEffect(() => {
    setBot({ berries: 0, atHome: false, conditionTrue: false });
    setThenAction("Collect Berry");
    setElseAction("Return Home");
  }, [lesson.id]);

  function runCondition() {
    onRun();
    setBot({ berries: 0, atHome: false, conditionTrue: false });

    if (elseAction === "Return Home") {
      window.setTimeout(() => {
        setBot({ berries: 0, atHome: true, conditionTrue: false });
        onFailure("The bot returned before collecting enough berries.");
      }, 450);
      return;
    }

    let berries = 0;
    const timer = window.setInterval(() => {
      const full = berries >= 3;
      if (full) {
        window.clearInterval(timer);
        setBot({ berries, atHome: thenAction === "Return Home", conditionTrue: true });
        if (thenAction === "Collect Berry") {
          onFailure("The bot kept collecting even after the basket was full.");
          return;
        }
        onComplete();
        return;
      }

      berries += 1;
      onCollected(berries);
      setBot({ berries, atHome: false, conditionTrue: berries >= 3 });
    }, 520);
  }

  return (
    <>
      <p className="qp-desc">Build the rule that helps the basket bot decide what to do.</p>
      <div className="condition-builder">
        <span>IF</span>
        <strong>Basket is full</strong>
        <span>THEN</span>
        <select value={thenAction} disabled={status === "running"} onChange={(event) => setThenAction(event.target.value)}>
          {actionChoices.map((action) => <option key={action}>{action}</option>)}
        </select>
        <span>ELSE</span>
        <select value={elseAction} disabled={status === "running"} onChange={(event) => setElseAction(event.target.value)}>
          {actionChoices.map((action) => <option key={action}>{action}</option>)}
        </select>
      </div>
      <div className="mini-stage condition-stage">
        <span className={`condition-pill ${bot.conditionTrue ? "true" : ""}`}>
          Basket full? {bot.conditionTrue ? "Yes" : "No"}
        </span>
        <span className="basket-count">{bot.berries}/3</span>
        <span className={`mini-bot basket ${bot.atHome ? "home" : ""}`} />
        {[0, 1, 2].map((index) => (
          <span className={`berry-dot berry-${index} ${index < bot.berries ? "collected" : ""}`} key={index} />
        ))}
      </div>
      <button className="btn-run full" type="button" disabled={!canRun} onClick={runCondition}>
        Run If / Else
      </button>
    </>
  );
}

function NestedLoopPuzzle({
  lesson,
  canRun,
  status,
  onCollected,
  onFailure,
  onRun,
  onComplete,
}: {
  lesson: LessonDefinition;
  canRun: boolean;
  status: string;
  onCollected: (count: number) => void;
  onFailure: (message: string) => void;
  onRun: () => void;
  onComplete: () => void;
}) {
  const [outerRows, setOuterRows] = useState(2);
  const [innerBerries, setInnerBerries] = useState(4);
  const [moveNextRow, setMoveNextRow] = useState(false);
  const [bot, setBot] = useState<NestedBot>({
    row: 0,
    berry: 0,
    collected: Array.from({ length: 3 }, () => Array.from({ length: 5 }, () => false)),
    done: false,
  });

  useEffect(() => {
    setOuterRows(2);
    setInnerBerries(4);
    setMoveNextRow(false);
    setBot({
      row: 0,
      berry: 0,
      collected: Array.from({ length: 3 }, () => Array.from({ length: 5 }, () => false)),
      done: false,
    });
  }, [lesson.id]);

  function runNested() {
    onRun();
    setBot({
      row: 0,
      berry: 0,
      collected: Array.from({ length: 3 }, () => Array.from({ length: 5 }, () => false)),
      done: false,
    });

    if (outerRows !== 3) {
      window.setTimeout(() => onFailure("The bot did not visit every row."), 480);
      return;
    }
    if (innerBerries !== 5) {
      window.setTimeout(() => onFailure("The bot left berries behind in a row."), 480);
      return;
    }
    if (!moveNextRow) {
      window.setTimeout(() => onFailure("The bot finished one row but never moved to the next."), 480);
      return;
    }

    let row = 0;
    let berry = 0;
    let count = 0;
    const nextCollected = Array.from({ length: 3 }, () => Array.from({ length: 5 }, () => false));
    const timer = window.setInterval(() => {
      nextCollected[row][berry] = true;
      count += 1;
      onCollected(count);
      setBot({ row, berry, collected: nextCollected.map((items) => [...items]), done: count === 15 });
      berry += 1;
      if (berry >= 5) {
        berry = 0;
        row += 1;
      }
      if (count === 15) {
        window.clearInterval(timer);
        window.setTimeout(onComplete, 280);
      }
    }, 190);
  }

  return (
    <>
      <p className="qp-desc">Configure a loop inside another loop so the bot clears every row.</p>
      <div className="nested-builder">
        <label>
          Outer loop rows
          <input
            type="number"
            min={1}
            max={4}
            value={outerRows}
            disabled={status === "running"}
            onChange={(event) => setOuterRows(Number(event.target.value))}
          />
        </label>
        <label>
          Inner loop berries
          <input
            type="number"
            min={1}
            max={6}
            value={innerBerries}
            disabled={status === "running"}
            onChange={(event) => setInnerBerries(Number(event.target.value))}
          />
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={moveNextRow}
            disabled={status === "running"}
            onChange={(event) => setMoveNextRow(event.target.checked)}
          />
          Move to Next Row
        </label>
      </div>
      <div className="mini-stage nested-stage">
        <span className="nested-progress">
          Row {Math.min(bot.row + 1, 3)}/3 · Berry {Math.min(bot.berry + 1, 5)}/5
        </span>
        {bot.collected.map((row, rowIndex) => (
          <div className={`nested-row ${bot.row === rowIndex ? "active" : ""}`} key={rowIndex}>
            {row.map((isCollected, berryIndex) => (
              <span className={`berry-dot ${isCollected ? "collected" : ""}`} key={berryIndex} />
            ))}
          </div>
        ))}
        <span
          className={`mini-bot nested ${bot.done ? "celebrate" : ""}`}
          style={{ left: `${18 + Math.min(bot.berry, 4) * 13}%`, top: `${34 + Math.min(bot.row, 2) * 21}%` }}
        />
      </div>
      <button className="btn-run full" type="button" disabled={!canRun} onClick={runNested}>
        Run Nested Loops
      </button>
    </>
  );
}

function SuccessBlock({ lesson, message }: { lesson: LessonDefinition; message: string }) {
  return (
    <div className="lesson-explanation">
      <p>{message}</p>
      <div className="code-samples">
        <div className="code-block mini">
          <strong>Python</strong>
          {lesson.codeExamples.python.map((line, index) => <span className="line" key={`${line}-${index}`}>{line}</span>)}
        </div>
        <div className="code-block mini">
          <strong>JavaScript</strong>
          {lesson.codeExamples.javascript.map((line, index) => <span className="line" key={`${line}-${index}`}>{line}</span>)}
        </div>
      </div>
    </div>
  );
}
