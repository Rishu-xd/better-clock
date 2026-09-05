
"use client";

import ProgressBar from "./ProgressBar";

type CalendarSession = { duration: number; started_at: string | null; completed_at: string | null; state: "in_progress" | "paused" | "completed" };
type CalendarCardProps = { sessions: CalendarSession[]; now: number | null; title?: string; darkMode?: boolean };

function formatHours(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export default function CalendarCard({ sessions, now, title = "Monthly progress", darkMode = false }: CalendarCardProps) {
  const machineNow = now === null ? null : new Date(now);
  const currentMonth = machineNow?.getMonth() ?? 0;
  const currentYear = machineNow?.getFullYear() ?? 1970;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
  const monthLabel = machineNow ? new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(machineNow) : "Loading calendar…";
  const focusedByDay = new Map<string, number>();

  for (const session of sessions) {
    if (session.state !== "completed") continue;
    const recordedAt = session.completed_at ?? session.started_at;
    if (!recordedAt) continue;
    const date = new Date(recordedAt);
    if (Number.isNaN(date.getTime()) || date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) continue;
    const key = dateKey(date);
    focusedByDay.set(key, (focusedByDay.get(key) ?? 0) + Math.max(0, session.duration));
  }

  const completedDays = focusedByDay.size;
  const completion = daysInMonth ? Math.round((completedDays / daysInMonth) * 100) : 0;
  const timezone = machineNow === null ? "Local time" : Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";

  return (
    <section className={`w-full overflow-hidden rounded-2xl border p-3 backdrop-blur transition-colors duration-500 ${darkMode ? "border-white/10 bg-white/[.07] text-[#f9f7f0]" : "border-[#171714]/10 bg-white/45 text-[#171714]"}`}>
      <div className="flex items-start justify-between gap-3 text-sm"><div><p className={`text-[11px] font-medium uppercase tracking-[.16em] ${darkMode ? "text-white/45" : "text-[#171714]/45"}`}>{title}</p><span>{monthLabel}</span></div><span className="text-lg font-bold text-[#9dc700]">{completion}%</span></div>
      <div className="mt-4"><ProgressBar value={completion} darkMode={darkMode} /></div>
      <div className={`mt-2 flex justify-between text-xs ${darkMode ? "text-white/45" : "text-[#171714]/45"}`}><span>{completedDays} focused {completedDays === 1 ? "day" : "days"}</span><span>{daysInMonth} days</span></div>
      <div className={`mt-4 grid grid-cols-7 gap-1 text-center text-[10px] ${darkMode ? "text-white/40" : "text-[#171714]/45"}`}>{["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: firstWeekday }, (_, index) => <span key={`empty-${index}`} />)}
        {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
          const date = new Date(currentYear, currentMonth, day);
          const focusedSeconds = focusedByDay.get(dateKey(date)) ?? 0;
          const isToday = machineNow !== null && dateKey(date) === dateKey(machineNow);
          return <span key={day} title={focusedSeconds ? `${formatHours(focusedSeconds)} focused` : undefined} className={`flex aspect-square items-center justify-center rounded-md text-[10px] tabular-nums ${focusedSeconds ? "bg-[#d8ff3f] font-semibold text-[#171714]" : darkMode ? "text-white/55" : "text-[#171714]/55"} ${isToday && !focusedSeconds ? "ring-1 ring-[#9dc700]" : ""}`}>{day}</span>;
        })}
      </div>
      <p className={`mt-3 truncate text-[10px] ${darkMode ? "text-white/35" : "text-[#171714]/40"}`}>Based on your machine time · {timezone}</p>
    </section>
  );
}
