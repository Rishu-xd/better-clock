"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import TextMorph from "@/components/page";
import VaporizeTextCycle from "@/components/veporizer";
import GrindPresence from "@/components/grind/GrindPresence";
import SyncedGrindTimer from "@/components/grind/SyncedGrindTimer";
import { useTimer } from "react-use-precision-timer";

const DEFAULT_HOURS = 0;
const DEFAULT_MINUTES = 25;
const DEFAULT_SECONDS = 0;

const ASSEMBLE_DURATION = 0.8;
const VAPORIZE_DURATION = 0.9;

type TimerState =
  | "setup"
  | "assembling"
  | "running"
  | "paused"
  | "vaporizing";

type TimerMode = "countdown" | "stopwatch";

type SessionState =
  | "in_progress"
  | "paused"
  | "completed";

type SessionUpdateOptions = {
  completedAt?: string;
  duration?: number;
  startedAt?: string;
};

type TimePickerProps = {
  hours: number;
  minutes: number;
  seconds: number;
  setHours: React.Dispatch<React.SetStateAction<number>>;
  setMinutes: React.Dispatch<React.SetStateAction<number>>;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
};

const formatTime = (value: number) =>
  String(value).padStart(2, "0");

function DashboardLink() {
  return (
    <Link
      href="/Dashboard"
      className="
        absolute
        right-6
        top-6
        rounded-full
        border
        border-[#d8ff3f]/40
        px-4
        py-2
        text-xs
        text-[#f4f1ea]
        transition
        hover:border-[#d8ff3f]
        hover:bg-[#33332d]
      "
    >
      Open Dashboard
    </Link>
  );
}

/* --------------------------------------------------
 * TIME PICKER
 * -------------------------------------------------- */

function TimePicker({
  hours,
  minutes,
  seconds,
  setHours,
  setMinutes,
  setSeconds,
}: TimePickerProps) {
  return (
    <div className="flex items-center justify-center">
      <TimeColumn
        value={hours}
        max={23}
        label="hours"
        setValue={setHours}
      />

      <span className="mx-2 -mt-1 text-[90px] font-light leading-none text-[#d8ff3f]/45">
        :
      </span>

      <TimeColumn
        value={minutes}
        max={59}
        label="minutes"
        setValue={setMinutes}
      />

      <span className="mx-2 -mt-1 text-[90px] font-light leading-none text-[#d8ff3f]/45">
        :
      </span>

      <TimeColumn
        value={seconds}
        max={59}
        label="seconds"
        setValue={setSeconds}
      />
    </div>
  );
}

/* --------------------------------------------------
 * TIME COLUMN
 * -------------------------------------------------- */

function TimeColumn({
  value,
  max,
  label,
  setValue,
}: {
  value: number;
  max: number;
  label: string;
  setValue: React.Dispatch<React.SetStateAction<number>>;
}) {
  const getWrappedValue = (value: number) => {
    if (value > max) return 0;
    if (value < 0) return max;

    return value;
  };

  const handleWheel = (
    event: React.WheelEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const direction = event.deltaY > 0 ? -1 : 1;

    setValue((current) =>
      getWrappedValue(current + direction)
    );
  };

  const previous = getWrappedValue(value - 1);
  const next = getWrappedValue(value + 1);

  return (
    <div
      onWheel={handleWheel}
      className="
        group
        relative
        flex
        h-[150px]
        w-[145px]
        cursor-ns-resize
        flex-col
        items-center
        justify-center
        overflow-hidden
        rounded-2xl
        transition-all
        duration-300
        ease-out
        hover:bg-white/[0.035]
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          top-[-12px]
          text-[32px]
          font-medium
          tabular-nums
          text-[#d8ff3f]/25
          transition-all
          duration-300
          ease-out
          group-hover:text-[#d8ff3f]/50
        "
      >
        {formatTime(previous)}
      </div>

      <div
        className="
          pointer-events-none
          z-10
          text-[92px]
          font-medium
          leading-none
          tracking-[-0.06em]
          tabular-nums
          text-[#f9f7f0]
          transition-transform
          duration-200
          ease-out
          group-hover:scale-[1.025]
        "
      >
        {formatTime(value)}
      </div>

      <div
        className="
          pointer-events-none
          absolute
          bottom-[-12px]
          text-[32px]
          font-medium
          tabular-nums
          text-[#d8ff3f]/25
          transition-all
          duration-300
          ease-out
          group-hover:text-[#d8ff3f]/50
        "
      >
        {formatTime(next)}
      </div>

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-10
          bg-gradient-to-b
          from-[#20201c]
          to-transparent
          opacity-80
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-10
          bg-gradient-to-t
          from-[#20201c]
          to-transparent
          opacity-80
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-8
          left-1/2
          -translate-x-1/2
          text-[10px]
          font-medium
          uppercase
          tracking-[0.2em]
          text-[#d8ff3f]/40
          opacity-0
          transition-all
          duration-300
          group-hover:bottom-1
          group-hover:opacity-100
        "
      >
        {label}
      </div>
    </div>
  );
}

/* --------------------------------------------------
 * TIMER PAGE
 * -------------------------------------------------- */

export default function TimerPage() {
  const [groupId, setGroupId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    void Promise.resolve().then(() => {
      setGroupId(new URLSearchParams(window.location.search).get("group"));
    });
  }, []);

  if (groupId === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#20201c] text-sm text-[#f9f7f0]/55">
        Loading your clock...
      </main>
    );
  }

  return groupId ? <SyncedGrindTimer key={groupId} groupId={groupId} /> : <PersonalTimerPage />;
}

function PersonalTimerPage() {
  const timerConfig = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  const groupId = null;
  const initialMode: TimerMode = timerConfig?.get("mode") === "stopwatch" ? "stopwatch" : "countdown";
  const initialDuration = Number(timerConfig?.get("duration"));
  const shouldAutoStart = timerConfig?.get("autostart") === "1";
  /* --------------------------------------------------
   * TASK
   * -------------------------------------------------- */

  const [sessionName, setSessionName] =
    useState("session_12");

  const [sessionId, setSessionId] =
    useState<string | null>(null);
  const [timerMode, setTimerMode] = useState<TimerMode>(initialMode);

  /* --------------------------------------------------
   * SELECTED TIME
   * -------------------------------------------------- */

  const [selectedHours, setSelectedHours] =
    useState(initialMode === "countdown" && Number.isFinite(initialDuration) && initialDuration > 0 ? Math.floor(initialDuration / 3600) : DEFAULT_HOURS);

  const [selectedMinutes, setSelectedMinutes] =
    useState(initialMode === "countdown" && Number.isFinite(initialDuration) && initialDuration > 0 ? Math.floor(initialDuration / 60) % 60 : DEFAULT_MINUTES);

  const [selectedSeconds, setSelectedSeconds] =
    useState(DEFAULT_SECONDS);

  /* --------------------------------------------------
   * TIMER
   * -------------------------------------------------- */

  const [seconds, setSeconds] = useState(
    DEFAULT_HOURS * 3600 +
      DEFAULT_MINUTES * 60 +
      DEFAULT_SECONDS
  );

  const [state, setState] =
    useState<TimerState>("setup");

  const updateSessionState = useCallback(
    async (
      nextState: SessionState,
      options: SessionUpdateOptions = {}
    ) => {
      if (!sessionId) return;

      const supabase = createClient();
      const updates: {
        state: SessionState;
        completed_at?: string;
        duration?: number;
        started_at?: string;
      } = { state: nextState };

      if (options.completedAt) {
        updates.completed_at = options.completedAt;
      }

      if (options.duration !== undefined) {
        updates.duration = options.duration;
      }

      if (options.startedAt) {
        updates.started_at = options.startedAt;
      }

      const { error } = await supabase
        .from("sessions")
        .update(updates)
        .eq("id", sessionId);

      if (error) {
        console.error("Could not update session state:", error);
      }
    },
    [sessionId]
  );

  const timerRef = useRef<ReturnType<typeof useTimer> | null>(null);
  const loadedSessionRef = useRef(false);
  const autoStartedRef = useRef(false);

  /* --------------------------------------------------
   * PRECISION TIMER
   * -------------------------------------------------- */

  const timer = useTimer(
    { delay: 1000 },
    useCallback(() => {
      setSeconds((previousSeconds) => {
        if (timerMode === "stopwatch") {
          return previousSeconds + 1;
        }

        if (previousSeconds <= 1) {
          timerRef.current?.stop();

          /*
           * Timer finished.
           * Mark the database session as completed.
           */
          if (sessionId) {
            void updateSessionState(
              "completed",
              { completedAt: new Date().toISOString() }
            );
          }

          setState("vaporizing");

          return 0;
        }

        return previousSeconds - 1;
      });
    }, [sessionId, timerMode, updateSessionState])
  );

  useEffect(() => {
    timerRef.current = timer;
  }, [timer]);

  /* --------------------------------------------------
   * LOAD EXISTING SESSION FROM THE DASHBOARD
   * -------------------------------------------------- */

  useEffect(() => {
    if (loadedSessionRef.current) return;

    const sessionFromUrl = new URLSearchParams(
      window.location.search
    ).get("session");

    if (!sessionFromUrl) return;

    loadedSessionRef.current = true;

    const loadSession = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("sessions")
        .select("id, name, duration, started_at, state")
        .eq("id", sessionFromUrl)
        .single();

      if (error || !data || data.state === "completed") {
        console.error("Could not load session:", error);
        return;
      }

      let remainingSeconds = data.duration;

      if (data.state === "in_progress" && data.started_at) {
        const elapsedSeconds = Math.floor(
          (Date.now() - new Date(data.started_at).getTime()) /
            1000
        );

        remainingSeconds = Math.max(
          data.duration - elapsedSeconds,
          0
        );
      }

      setSessionId(data.id);
      setSessionName(data.name || "Unnamed task");
      setSeconds(remainingSeconds);

      if (remainingSeconds === 0) {
        await supabase
          .from("sessions")
          .update({
            state: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", data.id);
        setState("vaporizing");
        return;
      }

      if (data.state === "paused") {
        setState("paused");
        return;
      }

      setState("running");
      timerRef.current?.start();
    };

    void loadSession();
  }, []);

  /* --------------------------------------------------
   * ASSEMBLY → RUNNING
   * -------------------------------------------------- */

  useEffect(() => {
    if (state !== "assembling") return;

    const timeout = setTimeout(() => {
      setState("running");
      timer.start();
    }, ASSEMBLE_DURATION * 1000);

    return () => clearTimeout(timeout);
  }, [state, timer]);

  /* --------------------------------------------------
   * VAPORIZATION → SETUP
   * -------------------------------------------------- */

  useEffect(() => {
    if (state !== "vaporizing") return;

    const timeout = setTimeout(() => {
      setState("setup");
      setSessionId(null);

      /*
       * Generate a fresh task name
       * for the next task.
       */
      setSessionName((currentName) => {
        if (currentName.trim() === "") {
          return "session_12";
        }

        return currentName;
      });
    }, VAPORIZE_DURATION * 1000);

    return () => clearTimeout(timeout);
  }, [state]);

  /* --------------------------------------------------
   * TIMER VALUES
   * -------------------------------------------------- */

  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const secs = seconds % 60;

  const timerText =
    `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(secs)}`;

  /* --------------------------------------------------
   * TEXT MORPH
   * -------------------------------------------------- */

  const textStyle = {
    fontFamily: "Inter",
    fontSize: "120px",
    fontWeight: 500,
    lineHeight: 1,
  };

  const transition = {
    duration: 0.4,
    ease: "easeOut",
  };

  /* --------------------------------------------------
   * CREATE TASK / SET TIMER
   * -------------------------------------------------- */

  const setTimer = useCallback(async () => {
    const total =
      selectedHours * 3600 +
      selectedMinutes * 60 +
      selectedSeconds;

    if (timerMode === "countdown" && total <= 0) return;

    const supabase = createClient();

    /* Get logged-in user */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        "No logged-in user:",
        userError
      );

      return;
    }

    /* Count user's sessions */

    const { count, error: countError } =
      await supabase
        .from("sessions")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id);

    if (countError) {
      console.error(
        "Could not count sessions:",
        countError
      );

      return;
    }

    /*
     * Use the user's name.
     *
     * If they delete it completely,
     * automatically generate session_N.
     */
    const finalName =
      sessionName.trim() !== ""
        ? sessionName.trim()
        : `session_${(count ?? 0) + 1}`;

    const startedAt =
      new Date().toISOString();

    /* Create database session */

    const { data, error } =
      await supabase
        .from("sessions")
        .insert({
          user_id: user.id,
          name: finalName,
          duration: timerMode === "stopwatch" ? 0 : total,
          started_at: startedAt,
          completed_at: null,
          state: "in_progress",
        })
        .select()
        .single();

    if (error) {
      console.error(
        "Could not create session:",
        error
      );

      return;
    }

    /* Remember database session */

    setSessionId(data.id);

    /* Start timer */

    timer.stop();

    setSeconds(timerMode === "stopwatch" ? 0 : total);

    setState("assembling");
  }, [selectedHours, selectedMinutes, selectedSeconds, sessionName, timer, timerMode]);

  useEffect(() => {
    if (!shouldAutoStart || autoStartedRef.current || state !== "setup") return;

    autoStartedRef.current = true;
    void Promise.resolve().then(setTimer);
  }, [setTimer, shouldAutoStart, state]);

  /* --------------------------------------------------
   * RESET
   * -------------------------------------------------- */

  const resetTimer = () => {
    timer.stop();

    if (sessionId) {
      void updateSessionState(
        "completed",
        {
          completedAt: new Date().toISOString(),
          duration: timerMode === "stopwatch" ? seconds : undefined,
        }
      );
    }

    const total =
      selectedHours * 3600 +
      selectedMinutes * 60 +
      selectedSeconds;

    setSeconds(total);
    setSessionId(null);
    setState("setup");
  };

  /* --------------------------------------------------
   * PAUSE / RESUME
   * -------------------------------------------------- */

  const togglePause = () => {
    if (state === "running") {
      timer.stop();
      setState("paused");
      void updateSessionState("paused", {
        duration: timerMode === "stopwatch" ? seconds : undefined,
      });
      return;
    }

    if (state === "paused") {
      setState("running");
      timer.start();
      void updateSessionState("in_progress", {
        startedAt: new Date().toISOString(),
      });
    }
  };

  /* --------------------------------------------------
   * SETUP
   * -------------------------------------------------- */

  if (state === "setup") {
    const canStart =
      timerMode === "stopwatch" || selectedHours > 0 ||
      selectedMinutes > 0 ||
      selectedSeconds > 0;

    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#20201c] text-[#f9f7f0]">
        <DashboardLink />
        <GrindPresence groupId={groupId} />
        <main className="flex w-full flex-col items-center">

          {/* TASK NAME */}

          <input
            value={sessionName}
            onChange={(event) =>
              setSessionName(event.target.value)
            }
            maxLength={100}
            placeholder="Task name"
            className="
              mb-8
              w-[420px]
              rounded-full
              border
              border-[#f4f1ea]/15
              bg-transparent
              px-6
              py-3
              text-center
              text-sm
              text-[#f9f7f0]
              outline-none
              transition-all
              duration-200
              placeholder:text-[#f4f1ea]/35
              focus:border-[#d8ff3f]
            "
          />

          <div className="mb-5 flex rounded-full border border-[#d8ff3f]/25 p-1 text-xs">
            {(["countdown", "stopwatch"] as const).map((mode) => (
              <button key={mode} onClick={() => setTimerMode(mode)} className={`rounded-full px-4 py-2 transition ${timerMode === mode ? "bg-[#d8ff3f] text-[#20201c]" : "text-[#f4f1ea]/60"}`}>
                {mode === "countdown" ? "Timer" : "Stopwatch"}
              </button>
            ))}
          </div>

          {timerMode === "countdown" ? <>
          {/* TIME PICKER */}

          <div className="relative">
            <TimePicker
              hours={selectedHours}
              minutes={selectedMinutes}
              seconds={selectedSeconds}
              setHours={setSelectedHours}
              setMinutes={setSelectedMinutes}
              setSeconds={setSelectedSeconds}
            />

            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                h-[1px]
                w-[425px]
                -translate-x-1/2
                -translate-y-1/2
                bg-[#d8ff3f]/15
              "
            />
          </div>
          </> : <p className="mb-8 text-sm text-[#f4f1ea]/55">Start counting up whenever you&apos;re ready.</p>}

          {/* SET TIMER */}

          <button
            onClick={setTimer}
            disabled={!canStart}
            className="
              mt-8
              cursor-pointer
              rounded-full
              border
              border-[#d8ff3f]/40
              px-8
              py-3
              text-sm
              text-[#f9f7f0]
              transition-all
              duration-200
              hover:border-[#d8ff3f]
              hover:bg-[#33332d]
              active:scale-95
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >
            Start {timerMode === "countdown" ? "Timer" : "Stopwatch"}
          </button>
        </main>
      </div>
    );
  }

  /* --------------------------------------------------
   * ASSEMBLING
   * -------------------------------------------------- */

  if (state === "assembling") {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#20201c]">
        <DashboardLink />
        <GrindPresence groupId={groupId} />
        <div className="h-[140px] w-[700px]">
          <VaporizeTextCycle
            texts={[timerText]}
            font={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 120,
              lineHeight: 1,
              letterSpacing: 0,
              textAlign: "center",
            }}
            color="rgb(216, 255, 63)"
            spread={1}
            density={5}
            alignment="center"
            tag="div"
            appear={{
              mode: "particle",
              order: "together",
              transition: {
                type: "tween",
                duration: ASSEMBLE_DURATION,
                ease: "easeOut",
                delay: 0,
              },
            }}
            disappear={{
              mode: "particle",
              order: "together",
              transition: {
                type: "tween",
                duration: 2,
                ease: "easeOut",
                delay: 10,
              },
            }}
          />
        </div>
      </div>
    );
  }

  /* --------------------------------------------------
   * VAPORIZING
   * -------------------------------------------------- */

  if (state === "vaporizing") {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#20201c]">
        <DashboardLink />
        <GrindPresence groupId={groupId} />
        <div className="h-[140px] w-[700px]">
          <VaporizeTextCycle
            key="final-vaporize"
            texts={[timerText]}
            font={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 120,
              lineHeight: 1,
              letterSpacing: 0,
              textAlign: "center",
            }}
            color="rgb(216, 255, 63)"
            spread={1}
            density={5}
            alignment="center"
            tag="div"
            appear={{
              mode: "opacity",
              order: "together",
              transition: {
                type: "tween",
                duration: 0.01,
                ease: "linear",
              },
            }}
            disappear={{
              mode: "particle",
              order: "together",
              transition: {
                type: "tween",
                duration: VAPORIZE_DURATION,
                ease: "easeOut",
                delay: 0,
              },
            }}
          />
        </div>
      </div>
    );
  }

  /* --------------------------------------------------
   * RUNNING / PAUSED
   * -------------------------------------------------- */

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#20201c]">
      <DashboardLink />
      <GrindPresence groupId={groupId} />
      <main className="flex flex-col items-center">

        {/* TASK NAME */}

        <div className="mb-6 text-sm text-[#f4f1ea]/45">
          {sessionName} {state === "paused" && "• Paused"}
        </div>

        {/* TIMER */}

        <div className="flex cursor-pointer items-center justify-center gap-5 text-[#f9f7f0]">

          {/* HOURS */}

          <div className="flex">
            <TextMorph
              words={formatTime(hours)[0]}
              color="#d8ff3f"
              font={textStyle}
              transition={transition}
            />

            <TextMorph
              words={formatTime(hours)[1]}
              color="#d8ff3f"
              font={textStyle}
              transition={transition}
            />
          </div>

          <span className="text-[100px] text-[#f9f7f0]">
            :
          </span>

          {/* MINUTES */}

          <div className="flex">
            <TextMorph
              words={formatTime(minutes)[0]}
              color="#d8ff3f"
              font={textStyle}
              transition={transition}
            />

            <TextMorph
              words={formatTime(minutes)[1]}
              color="#d8ff3f"
              font={textStyle}
              transition={transition}
            />
          </div>

          <span className="text-[100px] text-[#f9f7f0]">
            :
          </span>

          {/* SECONDS */}

          <div className="flex">
            <TextMorph
              words={formatTime(secs)[0]}
              color="#d8ff3f"
              font={textStyle}
              transition={transition}
            />

            <TextMorph
              words={formatTime(secs)[1]}
              color="#ffffff"
              font={textStyle}
              transition={transition}
            />
          </div>
        </div>

        {/* TIMER CONTROLS */}

        <div className="mt-8 flex gap-3">
          <button
            onClick={togglePause}
            className="
              cursor-pointer
              rounded-full
              border
              border-[#d8ff3f]/40
              px-6
              py-3
              text-[#f9f7f0]
              transition
              hover:bg-[#33332d]
            "
          >
            {state === "paused" ? "Resume" : "Pause"}
          </button>

          <button
            onClick={resetTimer}
            className="
              cursor-pointer
              rounded-full
              border
              border-[#f4f1ea]/25
              px-6
              py-3
              text-[#f9f7f0]
              transition
              hover:bg-[#33332d]
            "
          >
            Reset
          </button>
        </div>
      </main>
    </div>
  );
}
