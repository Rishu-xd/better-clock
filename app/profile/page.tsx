"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Session = {
  id: string;
  name: string | null;
  duration: number;
  started_at: string | null;
  completed_at: string | null;
  state: "in_progress" | "paused" | "completed";
};

function formatHours(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) return `${minutes}m`;

  return `${hours}h ${minutes}m`;
}

function formatDate(date: string | null) {
  if (!date) return "Recently";

  return new Date(date).toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });

      if (!error) {
        setSessions(data ?? []);
      }

      setLoading(false);
    }

    loadProfile();
  }, [router, supabase]);

  const completedSessions = useMemo(
    () => sessions.filter((session) => session.state === "completed"),
    [sessions]
  );

  const totalSeconds = useMemo(
    () =>
      completedSessions.reduce(
        (total, session) => total + session.duration,
        0
      ),
    [completedSessions]
  );

  const initial = email.trim().at(0)?.toUpperCase() || "U";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#a8bcba] p-6">
        <div className="mx-auto max-w-4xl pt-20">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-white/20" />
          <div className="mt-8 h-48 animate-pulse rounded-[1.6rem] bg-white/20" />
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen text-black bg-[#f8f4f49e]"
    >
      <section className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-8 sm:py-7 lg:px-12">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-amber-100/45 to-transparent" />

        <div className="relative z-10 mx-auto max-w-4xl">
          {/* Header */}
          <header className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/Dashboard")}
              className="cursor-pointer text-sm font-medium text-black/55 transition hover:text-black"
            >
              ← Dashboard
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-lg font-semibold tracking-[-.06em]"
            >
              better<span className="text-black/35">clock</span>
            </button>
          </header>

          {/* Profile hero */}
          <section className="mt-12 rounded-[1.8rem] border border-white/35 bg-white/[.18] p-6 shadow-[0_18px_50px_rgba(23,38,39,.10)] backdrop-blur-xl sm:p-8">
            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-black/10 bg-black text-2xl font-medium text-white shadow-lg">
                {initial}
              </div>

              <div className="mt-5 sm:ml-6 sm:mt-0">
                <p className="text-[11px] font-medium uppercase tracking-[.2em] text-black/40">
                  Profile
                </p>

                <h1 className="mt-1 text-3xl font-medium tracking-[-.06em] sm:text-4xl">
                  {email.split("@")[0] || "Grinder"}
                </h1>

                <p className="mt-1 text-sm text-black/45">{email}</p>
              </div>
            </div>
          </section>

          {/* Main stats */}
          <section className="mt-5 rounded-[1.8rem] border border-white/35 bg-white/[.16] p-6 shadow-[0_18px_50px_rgba(23,38,39,.08)] backdrop-blur-xl sm:p-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[.2em] text-black/40">
                  Your grind
                </p>

                <p className="mt-3 text-5xl font-medium tracking-[-.07em] text-lime-700">
                  {formatHours(totalSeconds)}
                </p>

                <p className="mt-1 text-xs text-black/40">
                  Total focused time
                </p>
              </div>

              <p className="text-xs text-black/35">
                {completedSessions.length} completed sessions
              </p>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <ProfileStat
                label="Sessions"
                value={completedSessions.length}
              />

              <ProfileStat
                label="This month"
                value={formatHours(
                  completedSessions
                    .filter((session) => {
                      if (!session.started_at) return false;

                      const date = new Date(session.started_at);
                      const now = new Date();

                      return (
                        date.getMonth() === now.getMonth() &&
                        date.getFullYear() === now.getFullYear()
                      );
                    })
                    .reduce((sum, session) => sum + session.duration, 0)
                )}
              />

              <ProfileStat
                label="Avg session"
                value={
                  completedSessions.length
                    ? formatHours(
                        Math.round(
                          totalSeconds / completedSessions.length
                        )
                      )
                    : "0m"
                }
              />
            </div>
          </section>

          {/* Recent grind */}
          <section className="mt-5 rounded-[1.8rem] border border-white/35 bg-black/[.55] p-5 text-white shadow-[0_18px_50px_rgba(23,38,39,.12)] backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[.2em] text-zinc-500">
                  Recent grind
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Your latest sessions
                </p>
              </div>

              <span className="text-xs text-zinc-600">
                {sessions.length} total
              </span>
            </div>

            <div className="mt-5 space-y-2">
              {completedSessions.length === 0 ? (
                <div className="rounded-xl border border-white/10 px-5 py-8 text-center text-sm text-zinc-500">
                  Your grind starts here.
                </div>
              ) : (
                completedSessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.04] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {session.name || "Unnamed task"}
                      </p>

                      <p className="mt-1 text-[11px] text-zinc-500">
                        {formatDate(session.started_at)}
                      </p>
                    </div>

                    <p className="ml-4 shrink-0 text-sm tabular-nums text-zinc-300">
                      {formatHours(session.duration)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function ProfileStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-black/[.05] p-4">
      <p className="text-[10px] font-medium uppercase tracking-[.14em] text-black/40">
        {label}
      </p>

      <p className="mt-2 text-xl font-medium tracking-[-.04em]">
        {value}
      </p>
    </div>
  );
}