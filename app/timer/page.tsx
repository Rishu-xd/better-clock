"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import TextMorph from "@/componets/page";
import VaporizeTextCycle from "@/componets/veporizer";
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
        border-zinc-800
        px-4
        py-2
        text-xs
        text-zinc-300
        transition
        hover:border-zinc-600
        hover:bg-zinc-900
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

      <span className="mx-2 -mt-1 text-[90px] font-light leading-none text-zinc-500">
        :
      </span>

      <TimeColumn
        value={minutes}
        max={59}
        label="minutes"
        setValue={setMinutes}
      />

      <span className="mx-2 -mt-1 text-[90px] font-light leading-none text-zinc-500">
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
          text-zinc-700
          transition-all
          duration-300
          ease-out
          group-hover:text-zinc-600
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
          text-white
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
          text-zinc-700
          transition-all
          duration-300
          ease-out
          group-hover:text-zinc-600
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
          from-black
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
          from-black
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
          text-zinc-600
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
  /* --------------------------------------------------
   * TASK
   * -------------------------------------------------- */

  const [sessionName, setSessionName] =
    useState("session_12");

  const [sessionId, setSessionId] =
    useState<string | null>(null);

  /* --------------------------------------------------
   * SELECTED TIME
   * -------------------------------------------------- */

  const [selectedHours, setSelectedHours] =
    useState(DEFAULT_HOURS);

  const [selectedMinutes, setSelectedMinutes] =
    useState(DEFAULT_MINUTES);

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

  /* --------------------------------------------------
   * PRECISION TIMER
   * -------------------------------------------------- */

  const timer = useTimer(
    { delay: 1000 },
    useCallback(() => {
      setSeconds((previousSeconds) => {
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
    }, [sessionId, updateSessionState])
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

  const setTimer = async () => {
    const total =
      selectedHours * 3600 +
      selectedMinutes * 60 +
      selectedSeconds;

    if (total <= 0) return;

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
          duration: total,
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

    setSeconds(total);

    setState("assembling");
  };

  /* --------------------------------------------------
   * RESET
   * -------------------------------------------------- */

  const resetTimer = () => {
    timer.stop();

    if (sessionId) {
      void updateSessionState(
        "completed",
        { completedAt: new Date().toISOString() }
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
        duration: seconds,
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
      selectedHours > 0 ||
      selectedMinutes > 0 ||
      selectedSeconds > 0;

    return (
      <div className="relative flex min-h-screen items-center justify-center bg-black text-white">
        <DashboardLink />
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
              border-zinc-800
              bg-transparent
              px-6
              py-3
              text-center
              text-sm
              text-white
              outline-none
              transition-all
              duration-200
              placeholder:text-zinc-600
              focus:border-zinc-600
            "
          />

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
                bg-white/[0.06]
              "
            />
          </div>

          {/* SET TIMER */}

          <button
            onClick={setTimer}
            disabled={!canStart}
            className="
              mt-8
              cursor-pointer
              rounded-full
              border
              border-zinc-800
              px-8
              py-3
              text-sm
              text-white
              transition-all
              duration-200
              hover:border-zinc-600
              hover:bg-zinc-900
              active:scale-95
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >
            Set Timer
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
      <div className="relative flex min-h-screen items-center justify-center bg-black">
        <DashboardLink />
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
            color="rgb(255, 255, 255)"
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
      <div className="relative flex min-h-screen items-center justify-center bg-black">
        <DashboardLink />
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
            color="rgb(255, 255, 255)"
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
    <div className="relative flex min-h-screen items-center justify-center bg-black">
      <DashboardLink />
      <main className="flex flex-col items-center">

        {/* TASK NAME */}

        <div className="mb-6 text-sm text-zinc-500">
          {sessionName} {state === "paused" && "• Paused"}
        </div>

        {/* TIMER */}

        <div className="flex cursor-pointer items-center justify-center gap-5 text-white">

          {/* HOURS */}

          <div className="flex">
            <TextMorph
              words={formatTime(hours)[0]}
              color="#ffffff"
              font={textStyle}
              transition={transition}
            />

            <TextMorph
              words={formatTime(hours)[1]}
              color="#ffffff"
              font={textStyle}
              transition={transition}
            />
          </div>

          <span className="text-[100px] text-white">
            :
          </span>

          {/* MINUTES */}

          <div className="flex">
            <TextMorph
              words={formatTime(minutes)[0]}
              color="#ffffff"
              font={textStyle}
              transition={transition}
            />

            <TextMorph
              words={formatTime(minutes)[1]}
              color="#ffffff"
              font={textStyle}
              transition={transition}
            />
          </div>

          <span className="text-[100px] text-white">
            :
          </span>

          {/* SECONDS */}

          <div className="flex">
            <TextMorph
              words={formatTime(secs)[0]}
              color="#ffffff"
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
              border-zinc-700
              px-6
              py-3
              text-white
              transition
              hover:bg-gray-900
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
              border-zinc-700
              px-6
              py-3
              text-white
              transition
              hover:bg-gray-900
            "
          >
            Reset
          </button>
        </div>
      </main>
    </div>
  );
}
