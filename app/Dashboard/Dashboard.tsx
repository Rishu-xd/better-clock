"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Session = {
  id: string;
  user_id: string;
  name: string | null;
  duration: number;
  started_at: string;
  completed_at: string;
};

export default function Dashboard({
  userEmail,
  initialSessions,
}: {
  userEmail: string;
  initialSessions: Session[];
}) {
  const [time, setTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const [sessionName, setSessionName] =
    useState("Focus Session");

  const [sessions, setSessions] =
    useState<Session[]>(initialSessions);

  // --------------------------------------------------
  // TIMER
  // --------------------------------------------------

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTime((currentTime) => {
        if (currentTime <= 1) {
          clearInterval(interval);

          setIsRunning(false);

          // Timer finished
          saveSession();

          return 0;
        }

        return currentTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // --------------------------------------------------
  // TIMER DISPLAY
  // --------------------------------------------------

  const minutes = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (time % 60)
    .toString()
    .padStart(2, "0");

  // --------------------------------------------------
  // START TIMER
  // --------------------------------------------------

  function startTimer() {
    setIsRunning(true);
  }

  // --------------------------------------------------
  // RESET TIMER
  // --------------------------------------------------

  function resetTimer() {
    setIsRunning(false);
    setTime(25 * 60);
  }

  // --------------------------------------------------
  // SAVE SESSION TO SUPABASE
  // --------------------------------------------------

  async function saveSession() {
    const supabase = createClient();

    // Get current authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No logged-in user.");
      return;
    }

    // 25 minutes = 1500 seconds
    const duration = 25 * 60;

    const startedAt = new Date(
      Date.now() - duration * 1000
    );

    const completedAt = new Date();

    const { data, error } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        name: sessionName,
        duration: duration,
        started_at: startedAt.toISOString(),
        completed_at: completedAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error(
        "Could not save session:",
        error
      );

      return;
    }

    // Add the new session to the dashboard immediately
    if (data) {
      setSessions((currentSessions) => [
        data,
        ...currentSessions,
      ]);
    }

    console.log("Session saved successfully!");
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#171717]">

      {/* HEADER */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">

        <div className="flex items-center justify-center gap-2">

          <img
            className="size-8"
            src="/assets/icon.png"
            alt="Better Clock"
          />

          <h1 className="text-3xl font-semibold tracking-tight text-gray-800">
            Better Clock
          </h1>

        </div>

        <div className="flex items-center gap-4">

          <div className="hidden text-sm text-neutral-500 sm:block">
            {userEmail}
          </div>

          <button
            className="
              cursor-pointer
              rounded-full
              border
              border-neutral-200
              px-4
              py-2
              text-sm
              transition
              hover:bg-neutral-100
            "
          >
            Logout
          </button>

        </div>

      </header>

      {/* MAIN */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-12">

        {/* GREETING */}
        <div className="mb-10">

          <p className="mb-2 text-sm text-neutral-400">
            Focus dashboard
          </p>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Good morning.
          </h1>

          <p className="mt-3 text-neutral-500">
            Ready to focus?
          </p>

        </div>

        {/* SESSION NAME */}
        <div className="mb-4">

          <input
            value={sessionName}
            onChange={(e) =>
              setSessionName(e.target.value)
            }
            disabled={isRunning}
            placeholder="What are you working on?"
            className="
              w-full
              rounded-2xl
              border
              border-neutral-200
              bg-white
              px-5
              py-4
              text-sm
              outline-none
              transition
              focus:border-neutral-400
              disabled:bg-neutral-100
            "
          />

        </div>

        {/* TIMER */}
        <div
          className="
            rounded-3xl
            border-2
            border-neutral-300
            bg-gray-200
            px-6
            py-16
            text-center
            shadow-sm
          "
        >

          <div
            className="
              text-7xl
              font-medium
              tracking-tight
              tabular-nums
              sm:text-8xl
            "
          >
            {minutes}:{seconds}
          </div>

          <p className="mt-5 text-sm text-neutral-400">
            {isRunning
              ? "Focus mode"
              : "Focus session"}
          </p>

          {/* TIMER BUTTONS */}
          <div className="mt-8 flex justify-center gap-3">

            {/* START */}
            {!isRunning && time > 0 && (
              <button
                onClick={startTimer}
                className="
                  cursor-pointer
                  rounded-full
                  bg-black
                  px-7
                  py-3
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-neutral-800
                "
              >
                Start focusing
              </button>
            )}

            {/* PAUSE */}
            {isRunning && (
              <button
                onClick={() =>
                  setIsRunning(false)
                }
                className="
                  cursor-pointer
                  rounded-full
                  bg-black
                  px-7
                  py-3
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-neutral-800
                "
              >
                Pause
              </button>
            )}

            {/* RESET */}
            {!isRunning &&
              time !== 25 * 60 && (
                <button
                  onClick={resetTimer}
                  className="
                    cursor-pointer
                    rounded-full
                    border
                    border-neutral-300
                    bg-white
                    px-7
                    py-3
                    text-sm
                    font-medium
                    transition
                    hover:bg-neutral-100
                  "
                >
                  Reset
                </button>
              )}

          </div>

        </div>

        {/* STATS */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">

          <Stat
            title="Today"
            value={formatToday(sessions)}
            description="Focus time"
          />

          <Stat
            title="Sessions"
            value={getTodaySessions(
              sessions
            ).length.toString()}
            description="Completed today"
          />

          <Stat
            title="Streak"
            value="—"
            description="We'll add this next"
          />

        </div>

        {/* RECENT SESSIONS */}
        <section className="mt-12">

          <div className="mb-5 flex items-center justify-between">

            <h2 className="text-lg font-medium">
              Recent sessions
            </h2>

            <button
              className="
                text-sm
                text-neutral-400
                transition
                hover:text-neutral-700
              "
            >
              View all
            </button>

          </div>

          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-neutral-200
              bg-white
            "
          >

            {sessions.length === 0 ? (

              <div className="px-6 py-10 text-center">

                <p className="text-sm text-neutral-400">
                  No focus sessions yet.
                </p>

                <p className="mt-1 text-sm text-neutral-400">
                  Start your first session above.
                </p>

              </div>

            ) : (

              sessions
                .slice(0, 5)
                .map((session) => (

                  <Session
                    key={session.id}
                    name={
                      session.name ??
                      "Focus Session"
                    }
                    duration={formatDuration(
                      Number(session.duration)
                    )}
                    time={formatSessionDate(
                      session.completed_at
                    )}
                  />

                ))

            )}

          </div>

        </section>

      </section>

    </main>
  );
}


// ==================================================
// STAT COMPONENT
// ==================================================

function Stat({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">

      <p className="text-sm text-neutral-400">
        {title}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-sm text-neutral-400">
        {description}
      </p>

    </div>
  );
}


// ==================================================
// SESSION COMPONENT
// ==================================================

function Session({
  name,
  duration,
  time,
}: {
  name: string;
  duration: string;
  time: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        border-b
        border-neutral-100
        px-6
        py-5
        last:border-b-0
      "
    >

      <div>

        <p className="font-medium">
          {name}
        </p>

        <p className="mt-1 text-sm text-neutral-400">
          {time}
        </p>

      </div>

      <p className="text-sm text-neutral-500">
        {duration}
      </p>

    </div>
  );
}


// ==================================================
// GET TODAY'S SESSIONS
// ==================================================

function getTodaySessions(
  sessions: Session[]
) {
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  return sessions.filter(
    (session) =>
      new Date(session.completed_at) >=
      startOfToday
  );
}


// ==================================================
// FORMAT TODAY'S TOTAL
// ==================================================

function formatToday(
  sessions: Session[]
) {
  const todaySessions =
    getTodaySessions(sessions);

  const totalSeconds =
    todaySessions.reduce(
      (total, session) =>
        total + Number(session.duration),
      0
    );

  const totalMinutes =
    Math.floor(totalSeconds / 60);

  const hours =
    Math.floor(totalMinutes / 60);

  const minutes =
    totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}


// ==================================================
// FORMAT DURATION
// ==================================================

function formatDuration(
  seconds: number
) {
  const minutes =
    Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(minutes / 60);

  const remainingMinutes =
    minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}


// ==================================================
// FORMAT DATE
// ==================================================

function formatSessionDate(
  dateString: string
) {
  return new Date(
    dateString
  ).toLocaleString(
    "en-US",
    {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}