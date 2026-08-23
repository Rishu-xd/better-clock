
"use client";

import { useCallback, useEffect, useState } from "react";

import TextMorph from "@/componets/page";
import VaporizeTextCycle from "@/componets/veporizer";

import { useTimer } from "react-use-precision-timer";

const DEFAULT_HOURS = 0;
const DEFAULT_MINUTES = 0;
const DEFAULT_SECONDS = 5;

// Reverse vaporize / assemble duration
const ASSEMBLE_DURATION = 0.8;

// Completion vaporize duration
const VAPORIZE_DURATION = 0.9;

type TimerState =
  | "setup"
  | "assembling"
  | "running"
  | "vaporizing";

type TimePickerProps = {
  hours: number;
  minutes: number;
  seconds: number;
  setHours: React.Dispatch<React.SetStateAction<number>>;
  setMinutes: React.Dispatch<React.SetStateAction<number>>;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
};

function TimePicker({
  hours,
  minutes,
  seconds,
  setHours,
  setMinutes,
  setSeconds,
}: TimePickerProps) {
  const format = (value: number) =>
    String(value).padStart(2, "0");

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
  const format = (value: number) =>
    String(value).padStart(2, "0");

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
      {/* Previous number */}

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
        {format(previous)}
      </div>

      {/* Current number */}

      <div
        className="
          pointer-events-none
          cursor-pointer
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
        {format(value)}
      </div>

      {/* Next number */}

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
        {format(next)}
      </div>

      {/* Subtle top/bottom fade */}

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

      {/* Label */}

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

export default function Home() {
  /*
   * --------------------------------------------------
   * TIME SETTING
   * --------------------------------------------------
   */

  const [selectedHours, setSelectedHours] =
    useState(DEFAULT_HOURS);

  const [selectedMinutes, setSelectedMinutes] =
    useState(DEFAULT_MINUTES);

  const [selectedSeconds, setSelectedSeconds] =
    useState(DEFAULT_SECONDS);

  /*
   * --------------------------------------------------
   * TIMER STATE
   * --------------------------------------------------
   */

  const [seconds, setSeconds] = useState(
    DEFAULT_HOURS * 3600 +
      DEFAULT_MINUTES * 60 +
      DEFAULT_SECONDS
  );

  const [state, setState] =
    useState<TimerState>("setup");

  /*
   * --------------------------------------------------
   * TIMER
   * --------------------------------------------------
   */

  const timer = useTimer(
    { delay: 1000 },
    useCallback(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          timer.stop();
          setState("vaporizing");
          return 0;
        }

        return prev - 1;
      });
    }, [])
  );

  /*
   * --------------------------------------------------
   * AFTER ASSEMBLY
   * --------------------------------------------------
   */

  useEffect(() => {
    if (state !== "assembling") return;

    const timeout = setTimeout(() => {
      setState("running");
      timer.start();
    }, ASSEMBLE_DURATION * 1000);

    return () => clearTimeout(timeout);
  }, [state, timer]);

  /*
   * --------------------------------------------------
   * AFTER FINAL VAPORIZATION
   * --------------------------------------------------
   */

  useEffect(() => {
    if (state !== "vaporizing") return;

    const timeout = setTimeout(() => {
      setState("setup");
    }, VAPORIZE_DURATION * 1000);

    return () => clearTimeout(timeout);
  }, [state]);

  /*
   * --------------------------------------------------
   * TIMER VALUES
   * --------------------------------------------------
   */

  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const secs = seconds % 60;

  const format = (value: number) =>
    String(value).padStart(2, "0");

  /*
   * --------------------------------------------------
   * TIMER TEXT
   * --------------------------------------------------
   */

  const timerText =
    `${format(hours)}:${format(minutes)}:${format(secs)}`;

  /*
   * --------------------------------------------------
   * TEXT MORPH SETTINGS
   * --------------------------------------------------
   */

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

  /*
   * --------------------------------------------------
   * SET TIMER
   * --------------------------------------------------
   */

  const setTimer = () => {
    const total =
      selectedHours * 3600 +
      selectedMinutes * 60 +
      selectedSeconds;

    // Don't start a zero-second timer.
    if (total <= 0) return;

    timer.stop();

    setSeconds(total);

    // First assemble the timer from particles.
    setState("assembling");
  };

  /*
   * --------------------------------------------------
   * RESET
   * --------------------------------------------------
   */

  const resetTimer = () => {
    timer.stop();

    setSeconds(
      selectedHours * 3600 +
        selectedMinutes * 60 +
        selectedSeconds
    );

    setState("setup");
  };

  /*
   * --------------------------------------------------
   * SETUP SCREEN
   * --------------------------------------------------
   */

  if (state === "setup") {
    const canStart =
      selectedHours > 0 ||
      selectedMinutes > 0 ||
      selectedSeconds > 0;

    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <main className="flex w-full flex-col items-center">

          {/* Time picker */}

          <div className="relative">

            <TimePicker
              hours={selectedHours}
              minutes={selectedMinutes}
              seconds={selectedSeconds}
              setHours={setSelectedHours}
              setMinutes={setSelectedMinutes}
              setSeconds={setSelectedSeconds}
            />

            {/* Center selection line */}

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

        

          {/* Set button */}

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

  /*
   * --------------------------------------------------
   * ASSEMBLE TIMER
   * --------------------------------------------------
   */

  if (state === "assembling") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
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

  /*
   * --------------------------------------------------
   * FINAL VAPORIZATION
   * --------------------------------------------------
   */

  if (state === "vaporizing") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
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

  /*
   * --------------------------------------------------
   * NORMAL COUNTDOWN
   * --------------------------------------------------
   */

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <main className="flex flex-col items-center">

        <div className="flex items-center justify-center gap-5 text-white cursor-pointer" >

          {/* HOURS */}

          <div className="flex">
            <TextMorph
              words={format(hours)[0]}
              color="#ffffff"
              font={textStyle}
              transition={transition}
            />

            <TextMorph
              words={format(hours)[1]}
              color="#ffffff"
              font={textStyle}
              transition={transition}
            />
          </div>

          <span className="text-[100px] text-white">
            :
          </span>

          {/* MINUTES */}

          <div className="flex cursor-pointer">
            <TextMorph
              words={format(minutes)[0]}
              color="#ffffff"
              font={textStyle}
              transition={transition}
            />

            <TextMorph
              words={format(minutes)[1]}
              color="#ffffff"
              font={textStyle}
              transition={transition}
            />
          </div>

          <span className="text-[100px] text-white ">
            :
          </span>

          {/* SECONDS */}

          <div className="flex cursor-pointer">
            <TextMorph
              words={format(secs)[0]}
              color="#ffffff"
              font={textStyle}
              transition={transition}
            />

            <TextMorph
              words={format(secs)[1]}
              color="#ffffff"
              font={textStyle}
              transition={transition}
            />
          </div>
        </div>

        {/* RESET */}

        <button
          onClick={resetTimer}
          className="
            mt-8
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
      </main>
    </div>
  );
}