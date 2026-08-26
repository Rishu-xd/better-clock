"use client";

import { useState,useEffect } from "react";
import { createClient } from "@/lib/supabase/client";


export default function Dashboard() {
    const [userEmail, setUserEmail] = useState("");
    useEffect(() => {
  const getUser = async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUserEmail(user.email ?? "");
    }
  };

  getUser();
}, []);


  const [time, setTime] = useState(25 * 60);

  const minutes = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (time % 60)
    .toString()
    .padStart(2, "0");

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#171717]">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
         
           <div className=" flex gap-2 justify-center align-middle">
        <img  className  = " size-8 "   src="/assets/icon.png"></img>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-800">
          Better Clock
        </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-sm text-neutral-500 sm:block">
           {userEmail}
          </div>

          <button className="cursor-pointer rounded-full border border-neutral-200 px-4 py-2 text-sm transition hover:bg-neutral-100">
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-12">
        {/* Greeting */}
        <div className="mb-10">
          <p className="mb-2 text-sm text-neutral-400">
            Wednesday, August 26
          </p>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Good morning.
          </h1>

          <p className="mt-3 text-neutral-500">
            Ready to focus?
          </p>
        </div>

        {/* Timer */}
        <div className="rounded-3xl border-2 border-neutral-300 bg-gray-200 px-6 py-16 text-center shadow-sm">
          <div className="text-7xl font-medium tracking-tight tabular-nums sm:text-8xl">
            {minutes}:{seconds}
          </div>

          <p className="mt-5 text-sm text-neutral-400">
            Focus session
          </p>

          <button className="mt-8   cursor-pointer rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-neutral-800">
            Start focusing
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat
            title="Today"
            value="1h 20m"
            description="Focus time"
          />

          <Stat
            title="Sessions"
            value="4"
            description="Completed today"
          />

          <Stat
            title="Streak"
            value="7 days"
            description="Keep it going"
          />
        </div>

        {/* Recent sessions */}
        <section className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-medium">
              Recent sessions
            </h2>

            <button className="text-sm text-neutral-400 hover:text-neutral-700">
              View all
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <Session
              name="Deep Work"
              duration="25 min"
              time="Today, 10:42 AM"
            />

            <Session
              name="DSA Practice"
              duration="45 min"
              time="Today, 9:30 AM"
            />

            <Session
              name="Project"
              duration="30 min"
              time="Yesterday, 7:15 PM"
            />
          </div>
        </section>
      </section>
    </main>
  );
}

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
    <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5 last:border-b-0">
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