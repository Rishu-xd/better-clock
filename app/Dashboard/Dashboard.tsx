"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CalendarCard from "@/components/clender";

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

  useEffect(() => {
    const start = window.setTimeout(() => setNow(Date.now()), 0);
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { window.clearTimeout(start); window.clearInterval(interval); };
  }, []);

  const shown = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sessions.filter((item) => (filter === "all" || item.state === filter) && (!query || (item.name || "Unnamed task").toLowerCase().includes(query)));
  }, [filter, search, sessions]);

  const active = sessions.filter((item) => item.state === "in_progress").length;
  const paused = sessions.filter((item) => item.state === "paused").length;
  const completed = sessions.filter((item) => item.state === "completed").length;
  const initial = userEmail.trim().at(0)?.toUpperCase() || "U";

  return (
    <main className="min-h-screen text-white" style={{ backgroundImage: "radial-gradient(circle at 82% 94%, rgba(255,224,161,.65), transparent 20%), radial-gradient(circle at 14% 84%, rgba(255,255,255,.48), transparent 25%), linear-gradient(135deg, #b8ccca, #91aaa9 52%, #aec5c2)" }}>
      <section className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-8 sm:py-7 lg:px-12">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-amber-100/45 to-transparent" />
        <header className="relative z-10 flex items-center gap-3">
          <button onClick={() => setFilter("all")} className="cursor-pointer text-lg font-semibold tracking-[-.06em] text-black transition hover:opacity-70 sm:text-xl">better<span className="text-black/35">clock</span></button>
          <div className="relative ml-auto w-full max-w-sm"><svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 stroke-black/45" fill="none" strokeWidth="2"><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" className="h-10 w-full rounded-full border border-black/10 bg-black/15 pl-10 pr-4 text-sm text-black outline-none placeholder:text-black/45 transition focus:border-black/35 focus:bg-white/40" /></div>
          <button onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-label="Open profile menu" className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white/25 text-sm font-bold text-black transition hover:bg-white/50">{initial}</button>
        </header>
        <div className={`absolute right-5 top-20 z-30 w-64 origin-top-right rounded-2xl border border-white/40 bg-black/85 p-4 shadow-2xl backdrop-blur-xl transition duration-200 ease-out sm:right-8 lg:right-12 ${profileOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-95 opacity-0"}`}>
          <p className="text-xs uppercase tracking-[.16em] text-zinc-500">Account</p>
          <p className="mt-2 truncate text-sm">{userEmail}</p>
          <button type="button" className="mt-4 w-full cursor-pointer rounded-xl bg-white px-3 py-2 text-left text-xs font-medium text-black transition hover:bg-zinc-200">View public profile</button>
          <button type="button" className="mt-2 w-full cursor-pointer rounded-xl border border-white/10 px-3 py-2 text-left text-xs text-zinc-300 transition hover:bg-white/10">Profile settings</button>
          <button type="button" className="mt-2 w-full cursor-pointer rounded-xl border border-white/10 px-3 py-2 text-left text-xs text-zinc-300 transition hover:bg-white/10">Help center</button>
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col pt-16 sm:pt-20">
          <div className="text-center"><p className="text-xs font-medium uppercase tracking-[.22em] text-black/45">Focus workspace</p><h1 className="mt-3 text-4xl font-medium tracking-[-.06em] text-black sm:text-5xl">Keep time on your side.</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/55">Start a focused session, pause when life interrupts, and return exactly where you left off.</p></div>
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="All tasks" value={sessions.length} />
            <Stat label="In progress" value={active} />
            <button onClick={() => router.push("/timer")} className="group flex cursor-pointer items-center justify-between rounded-2xl border border-black bg-black p-4 text-left transition hover:-translate-y-0.5 hover:bg-zinc-900"><span><span className="block text-xs text-zinc-400">Ready to focus?</span><span className="mt-1 block text-base font-medium">New task</span></span><span className="text-xl transition group-hover:translate-x-1">→</span></button>
            
           <CalendarCard totalDots={30} filledDots={18} month={8} year={2026} /> 
          </div>
          <section className="mt-6 rounded-[1.6rem] border border-white/35 bg-black/55 p-4 shadow-[0_18px_50px_rgba(23,38,39,.16)] backdrop-blur-xl sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <div><h2 className="text-sm font-medium">Your tasks</h2><p className="mt-1 text-xs text-zinc-400">{shown.length} {shown.length === 1 ? "task" : "tasks"} shown</p></div>
              <div className="flex flex-wrap items-center gap-2">
                {nav.map((item) => {
                  const count = item.value === "all" ? sessions.length : item.value === "in_progress" ? active : item.value === "paused" ? paused : completed;
                  return <button key={item.value} onClick={() => setFilter(item.value)} className={`cursor-pointer rounded-full px-3 py-1.5 text-xs transition ${filter === item.value ? "bg-white text-black" : "border border-white/15 text-zinc-400 hover:border-white/35 hover:text-white"}`}>{item.label}{item.value !== "all" && <span className="ml-1 text-[10px] opacity-70">{count}</span>}</button>;
                })}
                <button onClick={() => router.push("/timer")} className="cursor-pointer rounded-full border border-white/15 px-3 py-2 text-xs transition hover:border-white/35 hover:bg-white/10">+ Create task</button>
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

// const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// function CalendarCard({ totalDots, filledDots, month, year }: { totalDots: number; filledDots: number; month: number; year: number }) {
//   const dots = Array.from({ length: totalDots }, (_, index) => index < filledDots);
//   return (
//     <div className="flex flex-col justify-between rounded-2xl border border-white/30 bg-white/18 p-4 backdrop-blur-md">
//       <div className="flex items-baseline justify-between gap-2">
//         <p className="truncate text-xs text-black/50">{monthNames[month] ?? ""} {year}</p>
//         <p className="shrink-0 text-xs font-medium tabular-nums text-black/70">{filledDots}/{totalDots}</p>
//       </div>
//       <div className="mt-3 grid grid-cols-6 gap-1.5">
//         {dots.map((filled, index) => <span key={index} className={`h-2.5 w-2.5 rounded-full transition ${filled ? "bg-black" : "bg-black/15"}`} />)}
//       </div>
//     </div>
//   );
// }

function TaskCard({ session, seconds, onPlay }: { session: Session; seconds: number; onPlay: () => void }) {
  const active = session.state === "in_progress";
  const dot = active ? "bg-emerald-400 shadow-[0_0_0_5px_rgba(52,211,153,.11)]" : session.state === "paused" ? "bg-amber-300" : "bg-zinc-600";
  const badge = active ? "bg-emerald-400/10 text-emerald-300" : session.state === "paused" ? "bg-amber-300/10 text-amber-200" : "bg-zinc-500/15 text-zinc-400";
  const label = active ? "In progress" : session.state === "paused" ? "Paused" : "Completed";
  return <article className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[.055] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[.09] sm:flex-row sm:items-center"><div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-medium">{session.name || "Unnamed task"}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge}`}>{label}</span></div><p className="mt-1 text-xs text-zinc-500">{sessionDate(session.started_at)}</p></div><div className="flex items-center justify-between gap-4 sm:justify-end"><div className="text-left sm:text-right"><p className="text-sm font-medium tabular-nums">{session.state === "completed" ? `${Math.floor(session.duration / 60)}m recorded` : `${countdown(seconds)} remaining`}</p><p className="mt-1 text-[11px] text-zinc-500">{session.state === "completed" ? "Recorded duration" : "Live timer"}</p></div>{session.state !== "completed" && <button type="button" onClick={onPlay} aria-label={`Continue ${session.name || "task"}`} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-black transition hover:scale-105 hover:bg-zinc-200 active:scale-95"><svg viewBox="0 0 24 24" aria-hidden="true" className="ml-0.5 h-4 w-4 fill-current"><path d="M8 5v14l11-7z" /></svg></button>}</div></article>;
}
