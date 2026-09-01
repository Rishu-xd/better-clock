"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import VaporizeTextCycle from "@/components/veporizer";

interface VaporTimerProps {
  defaultMinutes?: number;
  defaultSeconds?: number;
  onComplete?: () => void;
}

type TimerState = "idle" | "running" | "vaporizing" | "completed";

export default function VaporTimer({
  defaultMinutes = 1,
  defaultSeconds = 0,
  onComplete,
}: VaporTimerProps) {
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [secondsInput, setSecondsInput] = useState(defaultSeconds);

  const [timeLeft, setTimeLeft] = useState(
    defaultMinutes * 60 + defaultSeconds
  );

  const [state, setState] = useState<TimerState>("idle");

  const vaporizeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
   * --------------------------------------------------
   * FORMAT TIMER
   * --------------------------------------------------
   */

  const formattedTime = (() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  })();

  /*
   * --------------------------------------------------
   * SET TIMER
   * --------------------------------------------------
   */

  const setTimer = useCallback(() => {
    const totalSeconds =
      Math.max(0, Number(minutes)) * 60 +
      Math.max(0, Number(secondsInput));

    if (totalSeconds <= 0) return;

    if (vaporizeTimeout.current) {
      clearTimeout(vaporizeTimeout.current);
    }

    setTimeLeft(totalSeconds);
    setState("running");
  }, [minutes, secondsInput]);

  /*
   * --------------------------------------------------
   * COUNTDOWN
   * --------------------------------------------------
   */

  useEffect(() => {
    if (state !== "running") return;

    if (timeLeft <= 0) {
      setState("vaporizing");
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [state, timeLeft]);

  /*
   * --------------------------------------------------
   * WHEN TIMER HITS ZERO
   * --------------------------------------------------
   */

  useEffect(() => {
    if (state !== "running" || timeLeft !== 0) return;

    setState("vaporizing");
  }, [timeLeft, state]);

  /*
   * --------------------------------------------------
   * AFTER VAPORIZATION
   * --------------------------------------------------
   *
   * The VaporizeTextCycle component needs a little
   * time to perform its particle animation.
   */

  useEffect(() => {
    if (state !== "vaporizing") return;

    vaporizeTimeout.current = setTimeout(() => {
      setState("completed");
      onComplete?.();
    }, 900);

    return () => {
      if (vaporizeTimeout.current) {
        clearTimeout(vaporizeTimeout.current);
      }
    };
  }, [state, onComplete]);

  /*
   * --------------------------------------------------
   * RESET
   * --------------------------------------------------
   */

  const reset = () => {
    if (vaporizeTimeout.current) {
      clearTimeout(vaporizeTimeout.current);
    }

    setTimeLeft(0);
    setState("idle");
  };

  /*
   * --------------------------------------------------
   * RENDER
   * --------------------------------------------------
   */

  return (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-8">
      {/* TIMER */}

      {state === "running" && (
        <div className="relative h-32 min-w-[280px]">
          <div
            className="
              flex
              h-full
              items-center
              justify-center
              font-mono
              text-8xl
              font-medium
              tabular-nums
              tracking-tight
            "
          >
            {formattedTime}
          </div>
        </div>
      )}

      {/* VAPORIZATION */}

      {state === "vaporizing" && (
        <div className="relative h-32 min-w-[280px]">
          <VaporizeTextCycle
            key="timer-vaporize"
            texts={[formattedTime]}
            font={{
              fontFamily: "JetBrains Mono",
              fontWeight: 500,
              fontSize: 120,
              lineHeight: 1,
              letterSpacing: 0,
              textAlign: "center",
            }}
            color="rgb(255,255,255)"
            spread={1}
            density={4}
            alignment="center"
            tag="div"
            appear={{
              mode: "opacity",
              order: "together",
              transition: {
                duration: 0.01,
                ease: "linear",
              },
            }}
            disappear={{
              mode: "particle",
              order: "together",
              transition: {
                duration: 0.8,
                ease: "easeOut",
                delay: 0,
              },
            }}
          />
        </div>
      )}

      {/* SETUP / SET BUTTON */}

      {(state === "idle" || state === "completed") && (
        <div className="flex flex-col items-center gap-5">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="
                w-20
                rounded-lg
                border
                border-white/10
                bg-white/5
                px-3
                py-2
                text-center
                text-xl
                outline-none
              "
            />

            <span className="text-xl">:</span>

            <input
              type="number"
              min={0}
              max={59}
              value={secondsInput}
              onChange={(e) =>
                setSecondsInput(
                  Math.min(59, Math.max(0, Number(e.target.value)))
                )
              }
              className="
                w-20
                rounded-lg
                border
                border-white/10
                bg-white/5
                px-3
                py-2
                text-center
                text-xl
                outline-none
              "
            />
          </div>

          <button
            onClick={setTimer}
            className="
              rounded-xl
              bg-white
              px-6
              py-3
              font-medium
              text-black
              transition
              hover:scale-105
              active:scale-95
            "
          >
            Set Timer
          </button>
        </div>
      )}

      {/* AFTER VAPORIZATION */}

      {state === "completed" && (
        <button
          onClick={reset}
          className="
            rounded-xl
            border
            border-white/10
            bg-white/5
            px-6
            py-3
            font-medium
            transition
            hover:bg-white/10
          "
        >
          Set Timer
        </button>
      )}
    </div>
  );
}