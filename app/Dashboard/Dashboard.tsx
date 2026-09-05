"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CalendarCard from "@/components/clender";
import YourGrind from "@/components/yourstat";

type State = "in_progress" | "paused" | "completed";
type Filter = "all" | State;
type Session = { id: string; name: string | null; duration: number; started_at: string | null; completed_at: string | null; state: State };
type Props = { userEmail: string; sessions: Session[] };

const nav: { label: string; value: Filter }[] = [
  { label: "Overview", value: "all" },
  { label: "In progress", value: "in_progress" },
  { label: "Paused", value: "paused" },
  { label: "History", value: "completed" },
];

function countdown(seconds: number) {
  return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((value) => String(value).padStart(2, "0")).join(":");
}

function remaining(session: Session, now: number | null) {
  if (session.state !== "in_progress" || !session.started_at || now === null) return session.duration;
  return Math.max(session.duration - Math.floor((now - new Date(session.started_at).getTime()) / 1000), 0);
}

function sessionDate(date: string | null) {
  return date ? new Date(date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Started recently";
}

export default function Dashboard({ userEmail, sessions }: Props) {
  const router = useRouter();
  const [now, setNow] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const start = window.setTimeout(() => setNow(Date.now()), 0);
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { window.clearTimeout(start); window.clearInterval(interval); };
  }, []);

  useEffect(() => {
    const loadTheme = window.setTimeout(() => {
      setDarkMode(window.localStorage.getItem("betterclock-theme") === "dark");
    }, 0);
    return () => window.clearTimeout(loadTheme);
  }, []);

  const toggleTheme = () => {
    setDarkMode((current) => {
      const next = !current;
      window.localStorage.setItem("betterclock-theme", next ? "dark" : "light");
      return next;
    });
  };

  const shown = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sessions.filter((item) => (filter === "all" || item.state === filter) && (!query || (item.name || "Unnamed task").toLowerCase().includes(query)));
  }, [filter, search, sessions]);

  const active = sessions.filter((item) => item.state === "in_progress").length;
  const paused = sessions.filter((item) => item.state === "paused").length;
  const completed = sessions.filter((item) => item.state === "completed").length;
  const initial = userEmail.trim().at(0)?.toUpperCase() || "U";

  return (
    <main className={`dashboard-shell min-h-screen ${darkMode ? "dashboard-dark" : "dashboard-light"}`} style={{ backgroundImage: darkMode ? "radial-gradient(circle at 88% 8%, rgba(216,255,63,.18), transparent 20%), radial-gradient(circle at 5% 92%, rgba(86,106,69,.22), transparent 24%), linear-gradient(135deg, #171714, #25251f 55%, #11110f)" : "radial-gradient(circle at 88% 8%, rgba(216,255,63,.48), transparent 19%), radial-gradient(circle at 5% 92%, rgba(255,185,129,.24), transparent 21%), linear-gradient(135deg, #f4f1ea, #e6e1d5 55%, #d9d3c4)" }}>
      <section className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-8 sm:py-7 lg:px-12">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#d8ff3f]/20 to-transparent" />
        <header className="relative z-10 flex items-center gap-3">
          <button onClick={() => setFilter("all")} className={`cursor-pointer text-lg font-semibold tracking-[-.06em] transition hover:opacity-70 sm:text-xl ${darkMode ? "text-[#f9f7f0]" : "text-[#171714]"}`}>better<span className="opacity-35">clock</span></button>
          <div className="relative ml-auto w-full max-w-sm"><svg viewBox="0 0 24 24" className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${darkMode ? "stroke-white/45" : "stroke-[#171714]/45"}`} fill="none" strokeWidth="2"><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" className={`h-10 w-full rounded-full border pl-10 pr-4 text-sm outline-none transition focus:border-[#9dc700] ${darkMode ? "border-white/15 bg-white/10 text-[#f9f7f0] placeholder:text-white/40 focus:bg-white/15" : "border-[#171714]/10 bg-white/55 text-[#171714] placeholder:text-[#171714]/45 focus:bg-white"}`} /></div>
          <button onClick={toggleTheme} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={darkMode} className={`dashboard-mode-toggle ${darkMode ? "is-dark" : ""}`}><span className="dashboard-mode-knob">{darkMode ? "☾" : "☀"}</span></button>
          <button onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-label="Open profile menu" className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#171714]/10 bg-[#d8ff3f] text-sm font-bold text-[#171714] transition hover:bg-[#c8ed30]">{initial}</button>
        </header>
        <div className={`absolute right-5 top-20 z-30 w-64 origin-top-right rounded-2xl border border-[#d8ff3f]/20 bg-[#20201c] p-4 shadow-2xl backdrop-blur-xl transition duration-200 ease-out sm:right-8 lg:right-12 ${profileOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-95 opacity-0"}`}>
          <p className="text-xs uppercase tracking-[.16em] text-zinc-500">Account</p>
          <p className="mt-2 truncate text-sm">{userEmail}</p>
          <button type="button" onClick={() => router.push("/profile")} className="mt-4 w-full cursor-pointer rounded-xl bg-white px-3 py-2 text-left text-xs font-medium text-black transition hover:bg-zinc-200">View public profile</button>

          <button type="button" className="mt-2 w-full cursor-pointer rounded-xl border border-white/10 px-3 py-2 text-left text-xs text-zinc-300 transition hover:bg-white/10">Help center</button>
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col pt-16 sm:pt-20">
          <div className="text-center"><h1 className={`mt-3 text-xl font-extralight tracking-[-.06em] sm:text-5xl ${darkMode ? "text-[#f9f7f0]" : "text-[#171714]"}`}>
            Focus workspace
          </h1></div>
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          
            <div className={`rounded-2xl border p-3 backdrop-blur-md ${darkMode ? "border-white/10 bg-white/10" : "border-[#171714]/10 bg-white/50"}`}>
              <p className={`px-1 pb-2 text-[11px] font-medium uppercase tracking-[.16em] ${darkMode ? "text-white/45" : "text-[#171714]/45"}`}>
                Start a grind
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/timer")}
                  className="group cursor-pointer rounded-xl border border-[#171714] bg-[#171714] p-3 text-left text-[#f9f7f0] transition duration-300 hover:-translate-y-0.5 hover:bg-[#33332d] active:scale-[.98]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Solo</span>
                    <span className="text-lg transition-transform duration-300 group-hover:translate-x-0.5">
                      →
                    </span>
                  </div>

                 <p className="mt-1 text-[11px] text-zinc-400">Focus on your own</p>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/grind")}
                  className="group cursor-pointer rounded-xl border border-[#171714]/10 bg-[#d8ff3f] p-3 text-left text-[#171714] transition duration-300 hover:-translate-y-0.5 hover:bg-[#c8ed30] active:scale-[.98]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Group</span>
                    <span className="text-lg transition-transform duration-300 group-hover:translate-x-0.5">
                      →
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-black/45">
                    Grind together
                  </p>
                </button>
              </div>
            </div>
            <CalendarCard completedDays={25} title={"Monthly progress"} darkMode={darkMode} />


          </div>
          <div className="mt-6">
            <YourGrind
              totalSeconds={3600}
              soloSeconds={360}
              groupSeconds={0}
              theme={darkMode}
            />
          </div>
          <section className="mt-6 rounded-[1.6rem] border border-[#171714]/20 bg-[#20201c] p-4 shadow-[0_18px_50px_rgba(23,23,20,.2)] backdrop-blur-xl sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <div><h2 className="text-sm font-medium">Your tasks</h2><p className="mt-1 text-xs text-zinc-400">{shown.length} {shown.length === 1 ? "task" : "tasks"} shown</p></div>
              <div className="flex flex-wrap items-center gap-2">
                {nav.map((item) => {
                  const count = item.value === "all" ? sessions.length : item.value === "in_progress" ? active : item.value === "paused" ? paused : completed;
                  return <button key={item.value} onClick={() => setFilter(item.value)} className={`cursor-pointer rounded-full px-3 py-1.5 text-xs transition ${filter === item.value ? "bg-[#d8ff3f] text-[#171714]" : "border border-white/15 text-zinc-400 hover:border-[#d8ff3f]/60 hover:text-white"}`}>{item.label}{item.value !== "all" && <span className="ml-1 text-[10px] opacity-70">{count}</span>}</button>;
                })}
                <button onClick={() => router.push("/timer")} className="cursor-pointer rounded-full border border-[#d8ff3f]/40 px-3 py-2 text-xs transition hover:bg-[#d8ff3f] hover:text-[#171714]">+ Create task</button>
              </div>
            </div>
            {shown.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center text-sm text-zinc-300">{search ? "No matching tasks found." : "No tasks in this view yet."}</div> : <div className="space-y-2">{shown.map((session) => <TaskCard key={session.id} session={session} seconds={remaining(session, now)} onPlay={() => router.push(`/timer?session=${session.id}`)} />)}</div>}
          </section>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-white/30 bg-white/18 p-4 backdrop-blur-md"><p className="text-xs text-black/50">{label}</p><p className="mt-1 text-2xl font-medium tabular-nums text-black">{value}</p></div>;
}



function TaskCard({ session, seconds, onPlay }: { session: Session; seconds: number; onPlay: () => void }) {
  const active = session.state === "in_progress";
  const dot = active ? "bg-emerald-400 shadow-[0_0_0_5px_rgba(52,211,153,.11)]" : session.state === "paused" ? "bg-amber-300" : "bg-zinc-600";
  const badge = active ? "bg-emerald-400/10 text-emerald-300" : session.state === "paused" ? "bg-amber-300/10 text-amber-200" : "bg-zinc-500/15 text-zinc-400";
  const label = active ? "In progress" : session.state === "paused" ? "Paused" : "Completed";
  return <article className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[.055] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[.09] sm:flex-row sm:items-center"><div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-medium">{session.name || "Unnamed task"}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge}`}>{label}</span></div><p className="mt-1 text-xs text-zinc-500">{sessionDate(session.started_at)}</p></div><div className="flex items-center justify-between gap-4 sm:justify-end"><div className="text-left sm:text-right"><p className="text-sm font-medium tabular-nums">{session.state === "completed" ? `${Math.floor(session.duration / 60)}m recorded` : `${countdown(seconds)} remaining`}</p><p className="mt-1 text-[11px] text-zinc-500">{session.state === "completed" ? "Recorded duration" : "Live timer"}</p></div>{session.state !== "completed" && <button type="button" onClick={onPlay} aria-label={`Continue ${session.name || "task"}`} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-black transition hover:scale-105 hover:bg-zinc-200 active:scale-95"><svg viewBox="0 0 24 24" aria-hidden="true" className="ml-0.5 h-4 w-4 fill-current"><path d="M8 5v14l11-7z" /></svg></button>}</div></article>;
}
